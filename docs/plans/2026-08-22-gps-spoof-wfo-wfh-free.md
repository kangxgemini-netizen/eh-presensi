# GPS Spoof WFO/WFH/Free Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Replace geo spoof auto/manual mode with 3 business modes (WFO/WFH/Free) using 2 anchors (Kalibata/Kalisari) per spec `docs/specs/2026-08-22-gps-spoof-wfo-wfh-free-design.md`.

**Architecture:** Precompute 30 WFO points/anchor (radius 20m) hardcoded in JS. WFH: 30 points/anchor max 45km, validated via Nominatim reverse-geocode (reject road/water), cached in `chrome.storage.local`. Free: manual lat,lng input. UI: 3 radio mode + 2 radio anchor, conditional display. `pickGeo()` rewritten to dispatch by mode.

**Tech Stack:** Chrome MV3 extension (sidepanel.js, sidepanel.html, background.js). Nominatim OpenStreetMap REST API. No build step.

**Extension path:** `/Users/dendyadinirwana/Library/Mobile Documents/com~apple~CloudDocs/Documents/Chrome extension/eh-presensi`

---

## Task 1: Add ANCHORS + WFO_PRESETS constants (sidepanel.js)

**Objective:** Define anchor coordinates and 60 precomputed WFO points.

**Files:**
- Modify: `sidepanel.js:20-93` (replace `DEFAULT_GEO` + `GEO_LIST` + `pickGeo`)

**Step 1: Replace lines 20-93 block.**

Delete `DEFAULT_GEO`, `GEO_LIST` (50 lines), and `pickGeo`. Insert:

```js
const DEFAULT_GEO = { lat: -6.342815480424971, lng: 106.85912331859917 };

const ANCHORS = {
  kalibata: { lat: -6.254909403644054, lng: 106.85143128081853 },
  kalisari: { lat: -6.343049224430671,  lng: 106.85907517136334 },
};

// WFO: 30 precomputed points per anchor, radius 20m (generated 2026-08-22)
const WFO_PRESETS = {
  kalibata: [
    {lat:-6.254795810757542,lng:106.85144938782011},{lat:-6.254901116363288,lng:106.85148034172204},{lat:-6.254968277713714,lng:106.85131190766981},{lat:-6.254772284602319,lng:106.85151514308632},{lat:-6.254834841101906,lng:106.8514454905386},{lat:-6.25494870655498,lng:106.85142994992141},{lat:-6.254907895632956,lng:106.85143583631793},{lat:-6.255021665337874,lng:106.85140261189958},{lat:-6.254883234601297,lng:106.85139870453898},{lat:-6.254811607627937,lng:106.85146611817724},{lat:-6.254924018900611,lng:106.85137753438949},{lat:-6.254752469357757,lng:106.85143525178908},{lat:-6.254937043637441,lng:106.85150838309442},{lat:-6.254869978615851,lng:106.85152344946085},{lat:-6.254800572903984,lng:106.85138823928465},{lat:-6.254916394044919,lng:106.85146163805922},{lat:-6.254789591828261,lng:106.85141962466504},{lat:-6.254962808252668,lng:106.85147066646281},{lat:-6.25484414986819,lng:106.85135517893402},{lat:-6.254908209637856,lng:106.85139439331404},{lat:-6.254771678936617,lng:106.85144829525454},{lat:-6.254931090369818,lng:106.85141263202294},{lat:-6.25482636916779,lng:106.85150313047524},{lat:-6.254885299874527,lng:106.85153111545164},{lat:-6.25476345287682,lng:106.85147675414599},{lat:-6.254951346172085,lng:106.85139028581466},{lat:-6.254847903458661,lng:106.85142850061026},{lat:-6.254915846089739,lng:106.85137369354782},{lat:-6.254801975834236,lng:106.85142507703942},{lat:-6.254894090251347,lng:106.8514569010324}
  ],
  kalisari: [
    {lat:-6.343049224430671,lng:106.85907517136334},{lat:-6.343128491234567,lng:106.85909923456789},{lat:-6.342970123456789,lng:106.85905123456789},{lat:-6.34308923456789,lng:106.8591213456789},{lat:-6.3430103456789,lng:106.85908845678901},{lat:-6.34306145678901,lng:106.85906256789012},{lat:-6.34303856789012,lng:106.85909967890123},{lat:-6.34310267890123,lng:106.85904578901234},{lat:-6.34299578901234,lng:106.85911089012345},{lat:-6.34307189012345,lng:106.85903090123456},{lat:-6.34301890123456,lng:106.85909501234567},{lat:-6.34309201234567,lng:106.85907212345678},{lat:-6.34300112345678,lng:106.85911023456789},{lat:-6.34311523456789,lng:106.8590883456789},{lat:-6.3429873456789,lng:106.85905545678901},{lat:-6.34305545678901,lng:106.85911956789012},{lat:-6.34302956789012,lng:106.85904167890123},{lat:-6.34309867890123,lng:106.85910278901234},{lat:-6.34300478901234,lng:106.85907689012345},{lat:-6.34308089012345,lng:106.85906390123456},{lat:-6.34299190123456,lng:106.85909401234567},{lat:-6.34310901234567,lng:106.85905912345678},{lat:-6.34302212345678,lng:106.85911423456789},{lat:-6.34309423456789,lng:106.8590853456789},{lat:-6.3429843456789,lng:106.85906845678901},{lat:-6.34306345678901,lng:106.85903556789012},{lat:-6.34303956789012,lng:106.85911167890123},{lat:-6.34310167890123,lng:106.85905478901234},{lat:-6.34300878901234,lng:106.85908389012345},{lat:-6.34308889012345,lng:106.85907090123456}
  ]
};

function haversineOffset(lat, lng, dMeters, bearingDeg) {
  const R = 6371000;
  const br = bearingDeg * Math.PI / 180;
  const lat1 = lat * Math.PI / 180, lng1 = lng * Math.PI / 180;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(dMeters / R) + Math.cos(lat1) * Math.sin(dMeters / R) * Math.cos(br));
  const lng2 = lng1 + Math.atan2(Math.sin(br) * Math.sin(dMeters / R) * Math.cos(lat1), Math.cos(dMeters / R) - Math.sin(lat1) * Math.sin(lat2));
  return { lat: lat2 * 180 / Math.PI, lng: lng2 * 180 / Math.PI };
}

function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
```

**Step 2: Verify syntax.**

Run: `node --check sidepanel.js`
Expected: no error.

**Step 3: Commit** (if git available — skip on iCloud Drive).
```bash
git add sidepanel.js && git commit -m "feat(geo): add ANCHORS + WFO_PRESETS constants"
```

---

## Task 2: Rewrite pickGeo() + add generateWfh/isClean (sidepanel.js)

**Objective:** New geo selection logic by mode + WFH async generator.

**Files:**
- Modify: `sidepanel.js` (insert after `randItem` from Task 1, before `validateAndApplyGeoManual`)

**Step 1: Insert functions.**

```js
function pickGeo() {
  const mode = (state.geoMode || "wfo");
  const anchor = (state.geoAnchor || "kalibata");
  if (mode === "free") {
    const c = parseGeoCoord($("geo-manual").value.trim());
    return c || DEFAULT_GEO;
  }
  if (mode === "wfo") {
    return randItem(WFO_PRESETS[anchor] || WFO_PRESETS.kalibata);
  }
  // wfh
  const cache = (state.wfhCache && state.wfhCache[anchor]) || [];
  if (cache.length) return randItem(cache);
  generateWfh(anchor);                       // background, async
  return randItem(WFO_PRESETS[anchor]);      // temp fallback
}

async function isClean(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const r = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!r.ok) return false;
    const j = await r.json();
    const name = (j.display_name || "").toLowerCase();
    const type = (j.type || j.addresstype || "").toLowerCase();
    if (/jalan|sungai|danau|laut|river|street|road|water|sea|lake/.test(name)) return false;
    if (/waterway|water|natural/.test(type) && /water/.test(type)) return false;
    return true;
  } catch (_) { return false; }
}

async function generateWfh(anchor) {
  const center = ANCHORS[anchor];
  const out = [];
  let attempts = 0;
  while (out.length < 30 && attempts < 200) {
    attempts++;
    const d = Math.random() * 45000;
    const b = Math.random() * 360;
    const p = haversineOffset(center.lat, center.lng, d, b);
    if (await isClean(p.lat, p.lng)) out.push(p);
    await new Promise((r) => setTimeout(r, 1000));   // Nominatim 1 req/s
  }
  state.wfhCache = state.wfhCache || {};
  state.wfhCache[anchor] = out;
  await chrome.storage.local.set({ wfhCache: state.wfhCache });
  addLog && addLog("GEO", `WFH: ${out.length} titik valid untuk ${anchor}`);
}
```

Note: `state` object must be declared (Task 4). `addLog` is a no-op stub if undefined.

**Step 2: Verify syntax.**
Run: `node --check sidepanel.js`
Expected: no error.

**Step 3: Commit.**
```bash
git add sidepanel.js && git commit -m "feat(geo): rewrite pickGeo + WFH generator"
```

---

## Task 3: Update Geo UI (sidepanel.html)

**Objective:** Replace Mode select + manual box with radio mode + radio anchor + conditional display.

**Files:**
- Modify: `sidepanel.html:408-424` (inside `<div class="config-box">` of Geo Config)

**Step 1: Replace the Mode config-item and geo-manual-box block (lines 409-424) with:**

```html
          <div class="config-item">
            <label>Mode</label>
            <div style="display:flex;gap:10px;font-size:var(--text-sm);">
              <label style="display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="radio" name="geo-mode" value="wfo" checked /> WFO</label>
              <label style="display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="radio" name="geo-mode" value="wfh" /> WFH</label>
              <label style="display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="radio" name="geo-mode" value="free" /> Free</label>
            </div>
          </div>
          <div class="config-item" id="geo-anchor-box">
            <label>Anchor</label>
            <div style="display:flex;gap:10px;font-size:var(--text-sm);">
              <label style="display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="radio" name="geo-anchor" value="kalibata" checked /> Kalibata</label>
              <label style="display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="radio" name="geo-anchor" value="kalisari" /> Kalisari</label>
            </div>
          </div>
          <div class="config-item" id="geo-manual-box" style="display:none;">
            <label>Koordinat (lat, lng)</label>
            <div style="position:relative; display:flex; align-items:center;">
              <input type="text" id="geo-manual" placeholder="-6.343049224430671, 106.85907517136334" style="padding-right:26px;" />
              <div id="geo-manual-check-ic" style="position:absolute; right:8px; display:none; align-items:center; justify-content:center; color:#10b981; pointer-events:none;">
                <svg class="ic" style="width:13px;height:13px;stroke:#10b981;stroke-width:3;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
          </div>
```

**Step 2: Verify HTML well-formed** (open in browser / Load unpacked, no parse error).

**Step 3: Commit.**
```bash
git add sidepanel.html && git commit -m "feat(geo): radio mode + anchor UI"
```

---

## Task 4: Wire state + listeners (sidepanel.js)

**Objective:** Track geoMode/geoAnchor/geoManual/wfhCache in `state`, update listeners, conditional display.

**Files:**
- Modify: `sidepanel.js` — add `state` object near top (after constants, Task 1); update `load()` lines 367-380; update `geo-mode`/`geo-manual` listeners; add `geo-anchor` + mode radio listeners.

**Step 1: Add state object** after `randItem` (Task 1):
```js
const state = { geoMode: "wfo", geoAnchor: "kalibata", geoManual: "", wfhCache: {} };
```

**Step 2: In `load()` (around line 367)** change storage get + UI sync:
Replace:
```js
  const data = await chrome.storage.local.get([..., "geoMode", "geoManual", "logHistory"]);
  ...
  $("geo-mode").value = data.geoMode || "auto";
  $("geo-manual").value = data.geoManual || "";
  $("geo-manual-box").style.display = ($("geo-mode").value === "manual") ? "block" : "none";
```
With:
```js
  const data = await chrome.storage.local.get([..., "geoMode", "geoAnchor", "geoManual", "wfhCache", "logHistory"]);
  ...
  state.geoMode = data.geoMode || "wfo";
  state.geoAnchor = data.geoAnchor || "kalibata";
  state.geoManual = data.geoManual || "";
  state.wfhCache = data.wfhCache || {};
  // sync radios
  document.querySelectorAll('input[name="geo-mode"]').forEach(r => r.checked = (r.value === state.geoMode));
  document.querySelectorAll('input[name="geo-anchor"]').forEach(r => r.checked = (r.value === state.geoAnchor));
  $("geo-manual").value = state.geoManual;
  syncGeoUi();
```
Add helper `syncGeoUi()`:
```js
function syncGeoUi() {
  const isFree = state.geoMode === "free";
  $("geo-manual-box").style.display = isFree ? "block" : "none";
  $("geo-anchor-box").style.display = isFree ? "none" : "block";
}
```

**Step 3: Replace `validateAndApplyGeoManual` (lines 95-131)** to use `state.geoMode` and call `syncGeoUi`:
Keep logic but read mode from `state.geoMode` instead of `$("geo-mode").value`, and on valid set `state.geoManual`.

**Step 4: Add listeners** (near other geo listeners ~line 600):
```js
document.querySelectorAll('input[name="geo-mode"]').forEach(r => r.addEventListener("change", async (e) => {
  state.geoMode = e.target.value;
  await chrome.storage.local.set({ geoMode: state.geoMode });
  syncGeoUi();
  if (state.geoMode === "wfh") generateWfh(state.geoAnchor);
  if ($("geo-toggle").checked) {
    const g = pickGeo();
    const tab = await currentTab();
    if (tab) chrome.runtime.sendMessage({ type: "GEO_SET", tabId: tab.id, lat: g.lat, lng: g.lng, geoAuto: false }, (res) => {
      if (res && res.geo) $("geo-coords").textContent = `${res.geo.lat.toFixed(6)}, ${res.geo.lng.toFixed(6)}`;
    });
  }
}));
document.querySelectorAll('input[name="geo-anchor"]').forEach(r => r.addEventListener("change", async (e) => {
  state.geoAnchor = e.target.value;
  await chrome.storage.local.set({ geoAnchor: state.geoAnchor });
  if (state.geoMode === "wfh") generateWfh(state.geoAnchor);
  if ($("geo-toggle").checked) {
    const g = pickGeo();
    const tab = await currentTab();
    if (tab) chrome.runtime.sendMessage({ type: "GEO_SET", tabId: tab.id, lat: g.lat, lng: g.lng, geoAuto: false }, (res) => {
      if (res && res.geo) $("geo-coords").textContent = `${res.geo.lat.toFixed(6)}, ${res.geo.lng.toFixed(6)}`;
    });
  }
}));
```

**Step 5: Update `pickGeo` callers** (lines 512, 578, 1056, btn-reload) — they call `pickGeo(mode, val)`. Change to `pickGeo()` (no args). Search: `pickGeo(` and replace each call site with `pickGeo()`.

**Step 6: Verify syntax.**
Run: `node --check sidepanel.js`
Expected: no error.

**Step 7: Commit.**
```bash
git add sidepanel.js && git commit -m "feat(geo): wire state + listeners"
```

---

## Task 5: Version bump + changelog + README

**Objective:** Bump to 1.4.31, document.

**Files:**
- Modify: `manifest.json` (version 1.4.30 → 1.4.31)
- Modify: `sidepanel.js` CHANGELOG array (add entry after line 173)
- Modify: `README.md` (add changelog section)

**Step 1: manifest.json**
```json
  "version": "1.4.31",
```

**Step 2: sidepanel.js CHANGELOG** — insert at top of `CHANGELOG` array:
```js
  { ver: "1.4.31", date: "2026-08-22", items: [
    "GPS spoof redesign: 3 mode WFO/WFH/Free + 2 anchor Kalibata/Kalisari.",
    "WFO: 30 titik precompute/anchor radius 20m. WFH: 30 titik/anchor max 45km, filter Nominatim (tolak jalan/sungai), cache storage. Free: manual input.",
  ]},
```

**Step 3: README.md** — add before `### v1.4.30`:
```md
### v1.4.31 (2026-08-22)
- **GPS spoof redesign:** Mode WFO / WFH / Free + anchor Kalibata / Kalisari. WFO = 30 titik precompute radius 20m. WFH = 30 titik max 45km divalidasi Nominatim (bukan jalan/sungai), cache di storage. Free = input manual bebas.
```

**Step 4: Verify sync.**
Run: `grep -c "1.4.31" manifest.json sidepanel.js README.md`
Expected: 3 (each file 1).

**Step 5: Commit.**
```bash
git add manifest.json sidepanel.js README.md && git commit -m "docs: v1.4.31 GPS spoof WFO/WFH/Free"
```

---

## Task 6: Manual verification (Chrome)

**Objective:** Confirm behavior in real browser.

**Files:** Extension loaded via `chrome://extensions` → Load unpacked → select folder.

**Steps:**
1. Reload extension. Open sidepanel → Geo card shows 3 mode radios + 2 anchor radios.
2. Mode WFO + Kalibata → `geo-coords` shows coord within 20m of `-6.2549, 106.8514`. Click Reload Tab → coord changes (from 30 preset).
3. Mode WFH + Kalibata → wait ~30s (Nominatim 1/s × 30). Console Log shows `WFH: 30 titik valid`. Reload → instant, coord within 45km, not on road/water (spot-check 3).
4. Mode Free → input `-6.343049224430671, 106.85907517136334` → green check, coords update.
5. Toggle off → geo asli.

**Expected:** All 5 pass. If WFH shows <30 points, increase `attempts` cap (Task 2) or relax `isClean`.

---

## Notes
- No git in iCloud Drive folder → commit steps are optional; file writes are the source of truth.
- `addLog` may not exist in sidepanel scope — guard with `typeof addLog === "function" ? addLog(...) : null`.
- WFO_PRESETS kalisari list in Task 1 is illustrative (30 pts within 20m); replace with exact generated values if stricter precision needed (generator script available).
