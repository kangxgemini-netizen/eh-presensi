# GPS Location Spoof Redesign — WFO / WFH / Free

**Date:** 2026-08-22
**Extension:** eh-Presensi (Manifest V3)
**Path:** `/Users/dendyadinirwana/Library/Mobile Documents/com~apple~CloudDocs/Documents/Chrome extension/eh-presensi`
**Current version:** 1.4.30

## Goal

Ganti geo spoof mode lama (auto/manual) jadi 3 mode bisnis:
- **WFO** — 2 anchor (Kalibata, Kalisari), tiap anchor 30 titik acak dalam radius 20m, precompute (deterministic).
- **WFH** — 2 anchor sama, 30 titik acak max 45km dari anchor, divalidasi gak di jalan/sungai/perairan (reverse-geocode Nominatim), di-cache di storage.
- **Free** — user input manual bebas (format `lat, lng`).

## Requirements (dari user)

1. UI: 3 radio mode + 2 radio anchor (Kalibata/Kalisari). Free nonaktifin anchor.
2. WFO: precompute 30 titik tetap per anchor, radius 20m. Acak saat reload tab.
3. WFH: 30 titik acak max 45km, filter jalan/sungai/perairan. Generate pas pilih mode, cache storage.
4. Free: manual input bebas.
5. Display `geo-coords`: koordinat aja (kayak sekarang), gak ada label mode/anchor.

## Constants & Data Model

```js
const ANCHORS = {
  kalibata: { lat: -6.254909403644054, lng: 106.85143128081853 },
  kalisari: { lat: -6.343049224430671,  lng: 106.85907517136334 },
};

// WFO: 60 titik precompute (30/anchor), radius 20m — generated 2026-08-22
const WFO_PRESETS = {
  kalibata: [ {lat, lng} x30 ],
  kalisari: [ {lat, lng} x30 ],
};

// WFH cache: chrome.storage.local["wfhCache"] = { kalibata: [{lat,lng}x30], kalisari: [...] }
// Free: chrome.storage.local["geoManual"] = "lat, lng"

// State
storage: {
  geoMode: 'wfo' | 'wfh' | 'free',
  geoAnchor: 'kalibata' | 'kalisari',
  geoManual: 'lat, lng',   // only Free
  wfhCache: { kalibata: [...], kalisari: [...] }
}
```

Old `GEO_LIST` (50 titik) + `pickGeo(mode, manualCoord)` dihapus/replace.

## UI (sidepanel.html)

Card "GPS Location Spoof":
```
[switch] GPS Location Spoof
  details > Geo Config
    Mode:    (●) WFO  (●) WFH  (●) Free
    Anchor:  (●) Kalibata  (●) Kalisari   [hidden kalau Free]
    Manual:  [ -6.343..., 106.859... ]     [hidden kalau WFO/WFH, only Free]
             [✓ centang hijau kalau valid]
  coords: -6.2549, 106.8514
```

- `geo-mode`: radio group (3)
- `geo-anchor`: radio group (2), `style.display='none'` kalau mode=free
- `geo-manual-box`: `display:none` kalau mode != free
- Icons: Lucide (chevron-down summary, check valid) — konsisten v1.4.30

## Logic (sidepanel.js)

```js
function pickGeo() {
  const { geoMode, geoAnchor, geoManual } = state;
  if (geoMode === 'free') return parseGeoCoord(geoManual);
  if (geoMode === 'wfo') {
    const list = WFO_PRESETS[geoAnchor];
    return list[Math.floor(Math.random() * list.length)];
  }
  // wfh
  const cache = (state.wfhCache && state.wfhCache[geoAnchor]) || [];
  if (cache.length) return cache[Math.floor(Math.random() * cache.length)];
  generateWfh(geoAnchor);                       // async background
  const fb = WFO_PRESETS[geoAnchor];            // fallback sementara
  return fb[Math.floor(Math.random() * fb.length)];
}

async function generateWfh(anchor) {
  const center = ANCHORS[anchor];
  const out = [];
  let attempts = 0;
  while (out.length < 30 && attempts < 200) {
    attempts++;
    const d = Math.random() * 45000;           // 45 km
    const b = Math.random() * 360;
    const p = haversineOffset(center.lat, center.lng, d, b);
    if (await isClean(p.lat, p.lng)) out.push(p);
    await sleep(1000);                          // Nominatim rate-limit 1/s
  }
  state.wfhCache = state.wfhCache || {};
  state.wfhCache[anchor] = out;
  await chrome.storage.local.set({ wfhCache: state.wfhCache });
}

async function isClean(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const j = await fetchJson(url);
  const name = (j.display_name || '').toLowerCase();
  const type = (j.type || j.addresstype || '').toLowerCase();
  if (/jalan|sungai|danau|laut|river|street|road|water/.test(name)) return false;
  if (/waterway|water|natural=water/.test(type)) return false;
  return true;
}
```

- `haversineOffset`: offset titik sejauh `d` meter ke arah `bearing` derajat.
- `pickGeo()` dipanggil di: `applyAll` (on), `geo-toggle` change, `geo-mode` change, `btn-reload` (auto random), Auto proxy anchor.
- Saat `geo-mode` change → `pickGeo()` + apply + reload tab (kalau toggle on).
- Saat `geo-anchor` change → `pickGeo()` + apply (WFH: trigger generateWfh kalau cache kosong).

## Background (background.js)

- `geoSet` tetap pakai coord dari sidepanel (gak berubah).
- Anchor buat Auto proxy: tetap ambil dari `geoLat/geoLng` storage (sudah ada).

## Edge Cases

- WFH cache kosong + user reload cepat → fallback WFO dulu, generateWfh jalan background, next reload pakai cache.
- Nominatim gagal/rate-limit → `isClean` return false → retry titik lain. Cap 200 attempt biar gak infinite.
- Free input invalid → `parseGeoCoord` return null → geo gak aktif (switch tetap, coordinat gak berubah, centang merah).
- Anchor coordinate salah di masa depan → user edit `ANCHORS` constant.

## Testing

1. Load unpacked → Geo card muncul 3 radio mode + 2 anchor.
2. Mode WFO + Kalibata → coords muncul dalam 20m dari anchor. Reload tab → coord beda (dari 30 preset).
3. Mode WFH → pertama kali muncul (generate ~30s karena Nominatim), reload → instan dari cache, semua titik gak di jalan/sungai.
4. Mode Free → input manual, centang hijau kalau valid, coords update real-time.
5. Toggle off → geo asli.

## Files Modified

- `sidepanel.html` — Geo card UI (radio mode/anchor, conditional display)
- `sidepanel.js` — `ANCHORS`, `WFO_PRESETS` (60 titik), `pickGeo` rewrite, `generateWfh`, `isClean`, `haversineOffset`, event listeners mode/anchor
- `background.js` — minimal (geoSet unchanged)
- `manifest.json` — version bump 1.4.31
- `README.md` — changelog entry

## Out of Scope

- Tidak ubah proxy/UA/JS logic.
- Tidak ubah badge/health checker.
- Tidak buat server/endpoint.
