/**
 * proxy-rotator.js
 * Rotator proxy ID (dari proxyscrape) dengan filter radius dari titik GPS spoof.
 *
 * Pipeline:
 *   1. fetch daftar proxy ID (http / https / socks4 / socks5) CAMPUR — yang penting aktif
 *   2. geolocate tiap IP via ip-api (batch, gratis, tanpa key)
 *   3. filter haversine() <= radiusKm dari anchor (titik GPS spoof)
 *   4. pick() -> proxy acak dari pool yang lolos
 *
 * Bisa dipakai di Node (tes) maupun di-build jadi lib buat extension.
 *
 * -------------------------------------------------------------------------
 * REKOMENDASI SUMBER PROXY LIST (buat user yang mau grab sendiri / browse):
 * -------------------------------------------------------------------------
 * Gratis, bisa di-scrape langsung (plaintext / JSON, no JS-render):
 *   - proxyscrape  : https://api.proxyscrape.com/v2/
 *                    contoh: ?request=getproxies&protocol=http&country=ID&ssl=all&anonymity=all&timeout=10000&type=GET
 *   - hidemy.name  : https://hidemy.name/en/proxy-list/  (ada filter country + port)
 *   - free-proxy.cz: https://free-proxy.cz/en/
 *   - sslproxies.org: https://www.sslproxies.org/  (HTTPS only)
 *   - us-proxy.org : https://www.us-proxy.org/
 *   - geonode.com  : https://geonode.com/free-proxy-list/  (ada API + filter geo)
 *   - proxy-list.download: https://www.proxy-list.download/  (API: /api/v1/get?type=http&country=ID)
 *
 * HINDARI (JS-rendered, butuh browser/headless buat scrape):
 *   - proxydb.net  -> tabelnya baru muncul setelah JS jalan, fetch HTML biasa cuma
 *                     balik <div id="root"> kosong. INI PENYEBAB route Jakarta mati
 *                     kalau extension nge-fetch proxydb langsung.
 *
 * CATATAN KEAMANAN (jujur):
 *   - Mayoritas proxy gratisan di atas adalah HTTP CLEARTEXT. Kalau dipakai buat
 *     kirim session/cookie (eh-Presensi), IP proxy bisa baca traffic lo.
 *   - Prefer SOCKS5 kalau ada (lebih aman), atau pakai proxy MILIK SENDIRI:
 *       socks5://16.78.6.181:1080  (Jakarta, punya lo dari aws-proxy-setup)
 *   - Proxy gratis sering mati/lambat — itu normal. Rotator di sini auto-pick
 *     yang lolos radius, tapi tetap harus di-test tiap pakai.
 * -------------------------------------------------------------------------
 */

const FETCH_PROTOCOLS = ["http", "https", "socks4", "socks5"];

// Anchor default = titik spoof lo (Tangerang/Jakarta barat). Ubah kalau spoof center beda.
const DEFAULT_ANCHOR = { lat: -6.343295, lon: 106.858673 };
const DEFAULT_RADIUS_KM = 100;

const PROXYSCRAPE_URL =
  "https://api.proxyscrape.com/v2/?request=getproxies&protocol=__PROTO__&country=ID&ssl=all&anonymity=all&timeout=10000&type=GET";

const IP_API_BATCH = "http://ip-api.com/batch?fields=query,status,country,regionName,city,lat,lon,isp";

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function fetchProtocol(proto, limit) {
  const url = PROXYSCRAPE_URL.replace("__PROTO__", proto);
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  const txt = await res.text();
  const list = txt
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, limit);
  return list.map((hostport) => {
    const [host, port] = hostport.split(":");
    return { type: proto, host, port: Number(port), raw: hostport };
  });
}

async function geolocate(ips) {
  // ip-api batch: POST array of IP strings, max 100 per batch
  const out = new Map();
  for (let i = 0; i < ips.length; i += 100) {
    const chunk = ips.slice(i, i + 100);
    const res = await fetch(IP_API_BATCH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chunk),
      signal: AbortSignal.timeout(20000),
    });
    const rows = await res.json();
    for (const r of rows) {
      if (r && r.status === "success") out.set(r.query, r);
    }
  }
  return out;
}

/**
 * Build pool: fetch + geolocate + filter radius.
 * @param {object} opts
 * @param {{lat:number,lon:number}} opts.anchor titik GPS spoof
 * @param {number} opts.radiusKm
 * @param {number} opts.perProtocol berapa IP diambil per protokol (utk batasi api call)
 * @returns {Promise<{pool:Array, stats:object}>}
 */
async function buildPool(opts = {}) {
  const anchor = opts.anchor || DEFAULT_ANCHOR;
  const radiusKm = opts.radiusKm || DEFAULT_RADIUS_KM;
  const perProtocol = opts.perProtocol || 40;

  let all = [];
  for (const proto of FETCH_PROTOCOLS) {
    try {
      const got = await fetchProtocol(proto, perProtocol);
      all = all.concat(got);
    } catch (e) {
      console.warn(`[rotator] fetch ${proto} gagal: ${e.message}`);
    }
  }

  const ips = [...new Set(all.map((p) => p.host))];
  const geo = await geolocate(ips);

  const pool = [];
  const rejected = [];
  for (const p of all) {
    const g = geo.get(p.host);
    if (!g) {
      rejected.push({ ...p, reason: "no_geo" });
      continue;
    }
    const dist = haversineKm(anchor, { lat: g.lat, lon: g.lon });
    if (dist <= radiusKm) {
      pool.push({ ...p, distKm: +dist.toFixed(1), city: g.city, isp: g.isp });
    } else {
      rejected.push({ ...p, distKm: +dist.toFixed(1), city: g.city, reason: "too_far" });
    }
  }

  return {
    pool,
    stats: {
      fetched: all.length,
      geolocated: geo.size,
      inRadius: pool.length,
      rejected: rejected.length,
      radiusKm,
      anchor,
    },
  };
}

function pick(pool) {
  if (!pool || !pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

module.exports = { buildPool, pick, haversineKm, DEFAULT_ANCHOR, DEFAULT_RADIUS_KM };

// ---- CLI test ----
if (require.main === module) {
  (async () => {
    console.log("Fetching ID proxies + geolocating (radius 100km)...\n");
    const { pool, stats } = await buildPool({ perProtocol: 30 });
    console.log("STATS:", JSON.stringify(stats, null, 2));
    console.log(`\nPOOL (${pool.length}) dalam radius 100km:`);
    for (const p of pool.slice(0, 25)) {
      console.log(
        `  ${p.type.padEnd(6)} ${p.raw.padEnd(24)} ${p.distKm}km  ${p.city || "?"} (${p.isp || "?"})`
      );
    }
    const chosen = pick(pool);
    console.log("\nRANDOM PICK:", chosen ? `${chosen.type} ${chosen.raw} @${chosen.distKm}km` : "EMPTY");
  })().catch((e) => {
    console.error("FATAL:", e);
    process.exit(1);
  });
}
