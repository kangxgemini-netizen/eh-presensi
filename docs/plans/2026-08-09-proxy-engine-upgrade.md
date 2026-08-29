# Proxy Engine Upgrade (adapt season-framework/proxy-switcher) Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Upgrade Proxy Route engine di eh-Presensi supaya (a) Manual mode nunjukkin info detail (latency, external IP, lokasi proxy, protokol, auth), dan (b) adopt pola dari season proxy-switcher: saved proxy profiles (CRUD), policy mode whitelist/blacklist, auth credentials, badge indicator, live state restore, dan proxy-error detection + auto-fallback.

**Architecture:** Pertahankan MV3 side-panel + background service worker kita. Angkat logika dari season repo ke dalam `background.js` (proxy control) dan `sidepanel.js`/`sidepanel.html` (UI). Jangan pakai popup mereka — kita side-panel. Manual mode pakai `fixed_servers` + `bypassList` (lebih robust dari PAC conditional kita) kecuali user mau site-specific (whitelist mode). Auto mode tetap pakai logika existing (fetch ID + radius + live-test) tapi tambah saved-profile support.

**Tech Stack:** Chrome MV3 (`chrome.proxy`, `chrome.storage.local`, `chrome.webRequest.onAuthRequired`, `chrome.action.setBadgeText`). Geolocate proxy via ipinfo (sudah ada di `geolocate()`). Latency test via tab stealth fetch ke ipify (sudah ada `testProxyViaTab`).

**Reference repo (already fetched to /tmp/proxy-switcher/):**
- `background.js` → `setProxy()` (type→scheme map, whitelist PAC, blacklist fixed_servers+bypassList, auth store, badge, restoreProxy, onProxyError, onAuthRequired)
- `popup.js` → saved profiles CRUD (`proxies[]`, `activeProxyId`), `renderProxyList()`, `saveProxy()`, `activateProxy()`, `disconnectProxy()`

---

## Task 1: Add `webRequestAuthProvider` + `webRequest` permission ke manifest

**Objective:** Izinin proxy ber-auth (username/password) + detect proxy error.

**Files:**
- Modify: `manifest.json` (permissions array)

**Step 1:** Edit permissions array jadi:
```json
"permissions": ["debugger", "storage", "activeTab", "tabs", "scripting", "proxy", "sidePanel", "alarms", "declarativeNetRequest", "declarativeNetRequestWithHostAccess", "webRequest", "webRequestAuthProvider"],
```

**Step 2:** Reload extension di Chrome → verify gak ada warning permission error.

**Verification:** `chrome://extensions` → eh-Presensi → tidak ada error merah di card.

---

## Task 2: Saved proxy profiles storage + CRUD UI (adapt season `proxies[]`)

**Objective:** User bisa simpan beberapa proxy manual (preset), pilih dari list, edit, hapus — bukan cuma 1 field.

**Files:**
- Modify: `sidepanel.html` (tambah `#proxy-profiles` list + tombol Add di Manual mode)
- Modify: `sidepanel.js` (load/save `proxies[]` + `activeProxyId`, render list, activate/delete)

**Step 1:** Di `sidepanel.html`, dalam `#proxy-manual-box`, tambah sebelum input URL:
```html
<div id="proxy-profiles" style="margin-bottom:8px;"></div>
<button class="btn btn-ghost" id="btn-add-profile" style="margin-bottom:8px;">+ Simpan proxy ini</button>
```

**Step 2:** Di `sidepanel.js`, tambah state + render:
```js
let savedProfiles = [];
let activeProfileId = null;

async function loadProfiles() {
  const d = await chrome.storage.local.get(["proxies", "activeProxyId"]);
  savedProfiles = d.proxies || [];
  activeProfileId = d.activeProxyId || null;
  renderProfiles();
}

function renderProfiles() {
  const el = $("proxy-profiles");
  if (!el) return;
  if (!savedProfiles.length) { el.innerHTML = `<div style="font-size:var(--text-xs);color:var(--muted-foreground)">Belum ada proxy tersimpan.</div>`; return; }
  el.innerHTML = savedProfiles.map(p => `
    <div class="proxy-item ${p.id === activeProfileId ? "active" : ""}" data-id="${p.id}" style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border:1px solid var(--border);border-radius:8px;margin-bottom:4px;cursor:pointer;">
      <div>
        <div style="font-weight:600">${p.name}</div>
        <div style="font-size:var(--text-xs);color:var(--muted-foreground)">${p.type} · ${p.host}:${p.port}${p.username ? " · 🔑" : ""}</div>
      </div>
      <button class="del-prof" data-id="${p.id}" style="background:none;border:none;cursor:pointer">🗑️</button>
    </div>`).join("");
  el.querySelectorAll(".proxy-item").forEach(it => it.addEventListener("click", (e) => {
    if (e.target.classList.contains("del-prof")) return;
    activateProfile(it.dataset.id);
  }));
  el.querySelectorAll(".del-prof").forEach(b => b.addEventListener("click", (e) => { e.stopPropagation(); deleteProfile(b.dataset.id); }));
}
```

**Step 3:** `activateProfile(id)` → isi field `$("proxy-url")` + `$("proxy-host")` dari profile, lalu `applyProxyIfOn()`.

**Step 4:** `#btn-add-profile` → simpan field saat ini ke `proxies[]`:
```js
$("btn-add-profile").addEventListener("click", async () => {
  const url = $("proxy-url").value.trim();
  const host = $("proxy-host").value.trim();
  if (!url) return;
  const m = url.match(/^(socks[45]|https?):\/\/([^:]+):(\d+)$/) || url.match(/^([^:]+):(\d+)$/);
  const type = (url.includes("socks5") ? "socks5" : url.includes("socks4") ? "socks4" : url.startsWith("https") ? "https" : "http");
  const host_ = m ? m[2] || m[1] : url;
  const port_ = m ? m[3] || m[2] : 1080;
  const prof = { id: Date.now().toString(), name: host_ + ":" + port_, type, host: host_, port: parseInt(port_), username: "", password: "", policyMode: host ? "whitelist" : "blacklist", domainList: host ? [host] : [] };
  savedProfiles.push(prof);
  await chrome.storage.local.set({ proxies: savedProfiles });
  renderProfiles();
});
```

**Step 5:** Panggil `loadProfiles()` di `load()`.

**Verification:** Reload extension → Manual mode → isi AWS URL → klik "Simpan proxy ini" → muncul di list → klik list item → field keisi + proxy apply.

---

## Task 3: Manual mode detail info panel (latency, external IP, lokasi, protokol)

**Objective:** Saat Manual proxy AKTIF, card bawah nunjukkin info detail bukan cuma URL.

**Files:**
- Modify: `sidepanel.html` (tambah `#proxy-detail` div)
- Modify: `sidepanel.js` (`showProxyDetail()` → geolocate + latency + IP)

**Step 1:** Di `#proxy-status` bawah, tambah:
```html
<div id="proxy-detail" style="font-size:var(--text-xs);color:var(--muted-foreground);margin-top:4px;display:none;"></div>
```

**Step 2:** Fungsi detail (dipanggil pas proxy ON / profile activate):
```js
async function showProxyDetail(host, port, scheme) {
  const el = $("proxy-detail");
  el.style.display = "block";
  el.textContent = "Mengecek proxy...";
  // geolocate proxy IP
  let geo = "";
  try {
    const g = await geolocate([host]);
    const info = g.get(host);
    if (info) geo = `${info.city || "?"} · ${info.isp || "?"} · ${info.country || "?"}`;
  } catch (_) {}
  // latency via tab stealth fetch
  let latency = "?", extIp = "";
  try {
    const tab = await chrome.tabs.create({ url: "about:blank", active: false });
    const r = await testProxyViaTab({ type: scheme, host, port }, tab.id);
    latency = r.latencyMs != null ? r.latencyMs + "ms" : "?";
    extIp = r.ip || "";
    chrome.tabs.remove(tab.id).catch(()=>{});
  } catch (_) {}
  el.innerHTML = `Protokol: <b>${scheme}</b> · Latency: <b>${latency}</b> · IP keluar: <b>${extIp || "?"}</b><br>Lokasi: ${geo || "?"}`;
}
```
(Catatan: `testProxyViaTab` harus ditambah return `latencyMs` — lihat Task 7.)

**Verification:** Manual ON → `#proxy-detail` nunjukkin "Protokol: socks5 · Latency: 120ms · IP keluar: 43.218.127.193 · Lokasi: Jakarta · Amazon · ID".

---

## Task 4: Policy mode Whitelist/Blacklist (adapt season)

**Objective:** Manual mode support "cuma site ini" (whitelist) vs "semua kecuali" (blacklist). Ganti PAC conditional kita jadi `fixed_servers` + `bypassList` yang lebih robust.

**Files:**
- Modify: `background.js` (`proxySet()` → terima `policyMode` + `domainList`, pakai fixed_servers)
- Modify: `sidepanel.js` (tambah selector policy mode)

**Step 1:** Rewrite `proxySet(targetHost)` jadi `proxySet({host, port, scheme, policyMode, domainList})`:
```js
async function proxySet({ host, port, scheme, policyMode = "whitelist", domainList = [] }) {
  let config;
  if (policyMode === "whitelist") {
    config = { mode: "pac_script", pacScript: { data: `function FindProxyForURL(url, h){ if(${domainList.map(d=>`h==='${d}'||h.endsWith('.${d}')`).join("||")||"false"}) return '${scheme.toUpperCase()} ${host}:${port}'; return 'DIRECT'; }` } };
  } else {
    config = { mode: "fixed_servers", rules: { singleProxy: { scheme, host, port: parseInt(port) }, bypassList: domainList.length ? domainList : ["localhost","127.0.0.1"] } };
  }
  await chrome.proxy.settings.set({ value: config, scope: "regular" });
}
```
(Blacklist = semua lewat proxy, domainList di-bypass. Whitelist = cuma domainList lewat proxy.)

**Step 2:** Side panel: tambah radio `policyMode` (Whitelist = cuma Target Host / Blacklist = semua). Default Whitelist (behavior sekarang).

**Verification:** Blacklist + kosong → mylocation.org berubah IP. Whitelist + presensi → cuma presensi lewat proxy.

---

## Task 5: Auth credentials support (adapt season onAuthRequired)

**Objective:** Proxy ber-auth (username/password) otomatis login.

**Files:**
- Modify: `background.js` (tambah `currentAuth`, `onAuthRequired` listener, pass ke `proxySet`)
- Modify: `sidepanel.html`/`sidepanel.js` (field username/password di Manual mode)

**Step 1:** Di `background.js` tambah:
```js
let currentAuth = null;
chrome.webRequest.onAuthRequired.addListener((details, cb) => {
  if (currentAuth && details.isProxy) cb({ authCredentials: currentAuth });
  else cb();
}, { urls: ["<all_urls>"] }, ["asyncBlocking"]);
```

**Step 2:** Di `proxySet`, set `currentAuth` dari param `username`/`password`.

**Step 3:** Side panel Manual mode tambah field `proxy-user` + `proxy-pass` (hidden by default, show kalau ada checkbox "Proxy ber-auth").

**Verification:** Isi proxy ber-auth → activate → gak ada prompt login browser.

---

## Task 6: Badge indicator + live state restore (adapt season)

**Objective:** Icon toolbar nunjukkin status proxy (WL/BL/ON) + proxy tetap nyala setelah browser restart.

**Files:**
- Modify: `background.js` (badge + `onStartup`/`onInstalled` restore)

**Step 1:** Di `proxySet` sukses → `chrome.action.setBadgeText({text: policyMode==="whitelist"?"WL":"ON"}); chrome.action.setBadgeBackgroundColor({color:"#48bb78"});`

**Step 2:** Di `proxyClear` → `chrome.action.setBadgeText({text:""});`

**Step 3:** Tambah restore:
```js
chrome.runtime.onStartup.addListener(restoreProxy);
chrome.runtime.onInstalled.addListener(restoreProxy);
async function restoreProxy() {
  const d = await chrome.storage.local.get(["proxies","activeProxyId","proxyOn","proxyMode","proxyUrl","proxyHost"]);
  if (d.proxyOn && d.proxyMode === "manual" && d.proxyUrl) {
    // re-apply manual
  }
}
```

**Verification:** Toggle proxy ON → icon ada badge hijau "ON". Restart Chrome → proxy tetap aktif.

---

## Task 7: Proxy-error detection + auto-fallback (adapt season onProxyError)

**Objective:** Kalau proxy mati (free proxy Auto), detect via `onProxyError` → auto-switch ke AWS manual.

**Files:**
- Modify: `background.js` (`onProxyError` listener → fallback ke AWS)

**Step 1:** Tambah:
```js
chrome.proxy.onProxyError.addListener((d) => {
  addLog("PROXY", "Proxy error: " + (d.error || "unknown") + " — fallback ke AWS");
  // auto fallback ke AWS stabil
  proxySet({ host: "43.218.127.193", port: 443, scheme: "socks5", policyMode: "whitelist", domainList: ["presensi.kemendesa.go.id"] });
});
```

**Step 2:** Pastikan `testProxyViaTab` return `latencyMs` (tambah `performance.now()` sebelum/sesudah fetch).

**Verification:** Auto proxy dapat proxy mati → `onProxyError` trigger → fallback AWS → IP stabil.

---

## Task 8: Integrate + update README + changelog v1.4.24

**Objective:** Semua task terhubung, docs update.

**Files:**
- Modify: `README.md` (tutorial proxy detail + saved profiles + policy mode)
- Modify: `sidepanel.js` CHANGELOG entry → v1.4.24

**Step 1:** Bump manifest ke 1.4.24.
**Step 2:** Update README "Tutorial Penggunaan D. Proxy" dengan saved profiles + policy mode + detail info.
**Step 3:** Add CHANGELOG entry 1.4.24.

**Verification:** `node --check background.js && node --check sidepanel.js` → OK. Reload extension → seluruh fitur jalan.

---

## Notes / Tradeoffs
- Kita TIDAK pakai popup mereka (kita side-panel). Cuma angkat logika proxy control + state management.
- `fixed_servers` + `bypassList` lebih reliable dari PAC conditional kita untuk blacklist mode. Whitelist tetap pakai PAC (cuma domain spesifik).
- Auto mode tetap pakai logic existing (fetch ID + radius + live-test) — Task 2-7 mostly untuk Manual mode, tapi Auto bisa juga simpan hasil ke profile.
- Jangan hapus Geo/UA/JS override kita — proxy cuma satu dari 4 fitur.
