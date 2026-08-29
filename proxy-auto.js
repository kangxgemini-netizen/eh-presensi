/**
 * proxy-auto.js — Auto proxy picker untuk eh-Presensi (MV3 service worker)
 *
 * Alur:
 *   1. fetch daftar proxy ID dari beberapa sumber (proxyscrape + proxy-list.download)
 *   2. geolocate tiap IP via ipinfo.io (HTTPS, no key)
 *   3. filter haversine <= radiusKm dari anchor (titik GPS spoof)
 *   4. TEST NYATA: set proxy global -> buka tab stealth ke ipify -> baca IP keluar.
 *      (fetch di service worker TIDAK ikut chrome.proxy, jadi kita test lewat TAB)
 *   5. pilih proxy pertama yang beneran lolos, atau null kalau semua mati
 *
 * File ini di-inline ke background.js (MV3 SW). chrome.* tersedia globally.
 */

const AUTO_ANCHOR = { lat: -6.343295, lon: 106.858673 };
const AUTO_RADIUS_KM = 100;

const SCRAPE_URL =
  "https://api.proxyscrape.com/v2/?request=getproxies&protocol=__PROTO__&country=ID&ssl=all&anonymity=all&timeout=10000&type=GET";
// proxy-list.download API (HTTPS, no key) — sumber kedua biar pool lebih padat
const PLD_URL =
  "https://www.proxy-list.download/api/v1/get?type=__PROTO__&country=ID&anon=all";

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function fetchText(url, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

async function fetchProtocol(proto, limit) {
  let list = [];
  // Sumber 1: proxyscrape
  try {
    const txt = await fetchText(SCRAPE_URL.replace("__PROTO__", proto));
    list = list.concat(
      txt.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
    );
  } catch (_) {}
  // Sumber 2: proxy-list.download
  try {
    const txt = await fetchText(PLD_URL.replace("__PROTO__", proto));
    list = list.concat(
      txt.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
    );
  } catch (_) {}

  return [...new Set(list)]
    .slice(0, limit)
    .map((hp) => {
      const [host, port] = hp.split(":");
      return { type: proto, host, port: Number(port), raw: hp };
    })
    .filter((p) => p.host && p.port);
}

// Geo via HTTPS (ipinfo.io, no key, rate 50k/bulan cukup)
async function geolocate(ips) {
  const out = new Map();
  for (const ip of ips) {
    try {
      const txt = await fetchText(`https://ipinfo.io/${ip}/json`, 12000);
      const j = JSON.parse(txt);
      if (j && j.loc) {
        const [lat, lon] = j.loc.split(",").map(Number);
        out.set(ip, {
          query: ip,
          status: "success",
          city: j.city || "",
          regionName: j.region || "",
          lat,
          lon,
          isp: j.org || "",
        });
      }
    } catch (_) {}
  }
  return out;
}

function applyProxyChrome(p) {
  const scheme = p.type;
  const pac = `function FindProxyForURL(url, host) { return '${scheme.toUpperCase()} ${p.host}:${p.port}'; }`;
  return chrome.proxy.settings.set({
    value: { mode: "pac_script", pacScript: { data: pac } },
    scope: "regular",
  });
}

// Tunggu tab selesai load (atau timeout)
async function waitTabComplete(tabId, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab && tab.status === "complete") return true;
    } catch (_) { return false; }
    await sleep(400);
  }
  return false;
}

// TEST NYATA lewat tab: set proxy -> buka ipify -> baca IP keluar
async function testProxyViaTab(p, tabId, onLog) {
  try {
    await applyProxyChrome(p);
  } catch (e) {
    return { ok: false, reason: "set_failed:" + e.message };
  }
  // proxy apply butuh waktu
  await sleep(1200);
  try {
    await chrome.tabs.update(tabId, { url: "https://api.ipify.org?format=json" });
  } catch (e) {
    return { ok: false, reason: "tab_update_failed:" + e.message };
  }
  const done = await waitTabComplete(tabId, 12000);
  if (!done) return { ok: false, reason: "tab_not_complete" };
  let ip = null;
  try {
    const r = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => (document.body ? document.body.innerText : ""),
    });
    const txt = (r && r[0] && r[0].result) || "";
    const m = txt.match(/"ip"\s*:\s*"([\d.]+)"/);
    if (m) ip = m[1];
  } catch (e) {
    return { ok: false, reason: "read_failed:" + e.message };
  }
  if (ip) return { ok: true, ip, distKm: p.distKm };
  return { ok: false, reason: "no_ip_in_page" };
}

async function buildAutoPool(opts = {}) {
  const anchor = opts.anchor || AUTO_ANCHOR;
  const radiusKm = opts.radiusKm || AUTO_RADIUS_KM;
  const perProtocol = opts.perProtocol || 60;

  let all = [];
  for (const proto of ["http", "https", "socks4", "socks5"]) {
    try {
      all = all.concat(await fetchProtocol(proto, perProtocol));
    } catch (_) {}
  }
  const ips = [...new Set(all.map((p) => p.host))];
  const geo = await geolocate(ips);

  const pool = [];
  for (const p of all) {
    const g = geo.get(p.host);
    if (!g) continue;
    const dist = haversineKm(anchor, { lat: g.lat, lon: g.lon });
    if (dist <= radiusKm) {
      pool.push({ ...p, distKm: +dist.toFixed(1), city: g.city, isp: g.isp });
    }
  }
  // shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

/**
 * pickLiveProxy: buka tab stealth, test tiap kandidat lewat tab sampai dapet yang hidup.
 * Mengembalikan { proxy, tested, alive, ip, poolSize } atau { proxy:null, ... }
 */
async function pickLiveProxy(opts = {}) {
  const maxTest = opts.maxTest || 15;
  const pool = await buildAutoPool(opts);
  if (!pool.length) return { proxy: null, tested: 0, alive: 0, poolSize: 0 };

  // Buat tab stealth satu kali, reuse untuk tiap test
  let tab;
  try {
    tab = await chrome.tabs.create({ url: "about:blank", active: false });
  } catch (e) {
    return { proxy: null, tested: 0, alive: 0, poolSize: pool.length, error: "tab_create_failed:" + e.message };
  }

  const tested = [];
  let alive = 0;
  let chosen = null;
  try {
    for (let i = 0; i < Math.min(pool.length, maxTest); i++) {
      const p = pool[i];
      if (opts.onLog) opts.onLog(`Test ${i + 1}/${Math.min(pool.length, maxTest)}: ${p.type} ${p.host}:${p.port} (${p.distKm}km ${p.city || "?"})`);
      const r = await testProxyViaTab(p, tab.id, opts.onLog);
      tested.push({ raw: p.raw, ...r });
      if (r.ok) {
        alive++;
        chosen = p;
        if (opts.onLog) opts.onLog(`OK live: ${p.type} ${p.host}:${p.port} -> IP ${r.ip}`);
        break;
      } else {
        if (opts.onLog) opts.onLog(`dead: ${p.host}:${p.port} (${r.reason || "no ip"})`);
      }
    }
  } finally {
    try { await chrome.tabs.remove(tab.id); } catch (_) {}
  }

  // kalau terpilih, proxy SUDAH ter-set di chrome.proxy (testProxyViaTab terakhir set sebelum break)
  return { proxy: chosen, tested, alive, ip: chosen ? tested[tested.length - 1].ip : null, poolSize: pool.length };
}

async function autoLog(msg) {
  try {
    const now = new Date();
    const ts = now.toTimeString().split(" ")[0];
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: ts,
      category: "PROXY",
      level: "info",
      message: msg,
    };
    const data = await chrome.storage.local.get(["logHistory"]);
    const list = Array.isArray(data.logHistory) ? data.logHistory : [];
    list.push(entry);
    if (list.length > 100) list.shift();
    await chrome.storage.local.set({ logHistory: list });
    chrome.runtime.sendMessage({ action: "LOG_EVENT", log: entry }).catch(() => {});
  } catch (_) {}
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { buildAutoPool, pickLiveProxy, geolocate, haversineKm, AUTO_ANCHOR, AUTO_RADIUS_KM };
}
