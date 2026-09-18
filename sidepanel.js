const $ = (id) => document.getElementById(id);

function getGeoAnchor() {
  const el = document.querySelector('input[name="geo-anchor"]:checked');
  return el ? el.value : "kalibata";
}
function setGeoAnchor(v) {
  const r = document.querySelector('input[name="geo-anchor"][value="' + v + '"]');
  if (r) r.checked = true;
}


function getGeoMode() {
  const el = document.querySelector('input[name="geo-mode"]:checked');
  return el ? el.value : "wfo";
}
function setGeoMode(v) {
  const r = document.querySelector('input[name="geo-mode"][value="' + v + '"]');
  if (r) r.checked = true;
}


function getProxyScope() {
  const el = document.querySelector('input[name="proxy-scope"]:checked');
  return el ? el.value : "target";
}
function setProxyScope(v) {
  const r = document.querySelector('input[name="proxy-scope"][value="' + v + '"]');
  if (r) r.checked = true;
}

const DEFAULT_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1";

const ANCHORS = {
  kalibata: { lat: -6.2549094, lng: 106.8514313 },
  kalisari: { lat: -6.3430492, lng: 106.8590752 }
};
const WFO_PRESETS = {
  kalibata: [{"lat":-6.2549276,"lng":106.8514093},{"lat":-6.2549227,"lng":106.8515156},{"lat":-6.254922,"lng":106.8512831},{"lat":-6.2548681,"lng":106.8513979},{"lat":-6.2549368,"lng":106.851446},{"lat":-6.2548844,"lng":106.8515573},{"lat":-6.2548304,"lng":106.8514447},{"lat":-6.2549874,"lng":106.8513234},{"lat":-6.2548839,"lng":106.8515676},{"lat":-6.2549041,"lng":106.8514177},{"lat":-6.2548578,"lng":106.8512895},{"lat":-6.2549475,"lng":106.8514914},{"lat":-6.2548089,"lng":106.8514034},{"lat":-6.2548628,"lng":106.8514622},{"lat":-6.2548291,"lng":106.8513164},{"lat":-6.2548555,"lng":106.8512867},{"lat":-6.2550821,"lng":106.851391},{"lat":-6.2550059,"lng":106.8515241},{"lat":-6.2548418,"lng":106.8513065},{"lat":-6.2548213,"lng":106.8513264},{"lat":-6.2549202,"lng":106.8513942},{"lat":-6.254896,"lng":106.8515276},{"lat":-6.2548334,"lng":106.8514732},{"lat":-6.2548331,"lng":106.8514878},{"lat":-6.2549808,"lng":106.8513491},{"lat":-6.2549658,"lng":106.8514915},{"lat":-6.2549279,"lng":106.8516052},{"lat":-6.2549932,"lng":106.8513182},{"lat":-6.2548365,"lng":106.8515671},{"lat":-6.2548521,"lng":106.8515265}],
  kalisari: [{"lat":-6.3429058,"lng":106.8590657},{"lat":-6.3431885,"lng":106.8590228},{"lat":-6.342962,"lng":106.8589423},{"lat":-6.343045,"lng":106.8591073},{"lat":-6.3430864,"lng":106.8591609},{"lat":-6.3430069,"lng":106.8592455},{"lat":-6.3429773,"lng":106.8590041},{"lat":-6.3431125,"lng":106.858981},{"lat":-6.3429446,"lng":106.8590125},{"lat":-6.3430576,"lng":106.8591646},{"lat":-6.3431346,"lng":106.8590403},{"lat":-6.343196,"lng":106.8589884},{"lat":-6.3431171,"lng":106.8591252},{"lat":-6.342921,"lng":106.8590732},{"lat":-6.3430164,"lng":106.8590964},{"lat":-6.3429394,"lng":106.8591662},{"lat":-6.3430187,"lng":106.8589618},{"lat":-6.342947,"lng":106.8591186},{"lat":-6.3429186,"lng":106.859072},{"lat":-6.3428853,"lng":106.8590449},{"lat":-6.3428971,"lng":106.8590862},{"lat":-6.343104,"lng":106.8589547},{"lat":-6.3430644,"lng":106.8592191},{"lat":-6.3429587,"lng":106.859152},{"lat":-6.3432173,"lng":106.8591258},{"lat":-6.3429837,"lng":106.8590099},{"lat":-6.3431252,"lng":106.8590749},{"lat":-6.3429062,"lng":106.8589872},{"lat":-6.3430923,"lng":106.859213},{"lat":-6.3431036,"lng":106.8590305}]
};
function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function parseGeoCoord(str) {
  if (!str) return null;
  const m = String(str).split(",");
  if (m.length < 2) return null;
  const lat = parseFloat(m[0].trim());
  const lng = parseFloat(m[1].trim());
  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat: Number(lat.toFixed(7)), lng: Number(lng.toFixed(7)) };
}

function pickGeo(mode, manualCoord, anchor) {
  if (mode === "manual") {
    const c = parseGeoCoord(manualCoord);
    if (c) return c;
  }
  if (mode === "wfo") {
    const wfo = WFO_PRESETS[anchor] || WFO_PRESETS.kalibata;
    const item = randItem(wfo);
    return { lat: Number(item.lat.toFixed(7)), lng: Number(item.lng.toFixed(7)) };
  }
  if (mode === "wfh") return { lat: -6.3430492, lng: 106.8590752 };
  const item = randItem(WFO_PRESETS.kalibata);
  return { lat: Number(item.lat.toFixed(7)), lng: Number(item.lng.toFixed(7)) };
}

function renderGeoCoords(mode, anchor, manual) {
  const el = $("geo-coords");
  if (!el) return;
  if (mode === "manual" && parseGeoCoord(manual)) {
    const c = parseGeoCoord(manual);
    el.textContent = `Manual · ${c.lat.toFixed(7)}, ${c.lng.toFixed(7)}`;
    return;
  }
  const a = ANCHORS[anchor] || ANCHORS.kalibata;
  el.textContent = `${mode.toUpperCase()} · ${anchor[0].toUpperCase()+anchor.slice(1)} · ${a.lat.toFixed(7)}, ${a.lng.toFixed(7)}`;
}

async function validateAndApplyGeoManual() {
  const mode = getGeoMode();
  const anchor = getGeoAnchor();
  const val = $("geo-manual").value.trim();
  const coord = parseGeoCoord(val);
  const inputEl = $("geo-manual");
  const checkIc = $("geo-manual-check-ic");

  if (coord) {
    inputEl.classList.add("geo-valid");
    inputEl.classList.remove("geo-invalid");
    if (checkIc) checkIc.style.display = "flex";

    await chrome.storage.local.set({ geoManual: val });

    renderGeoCoords("manual", anchor, val);

    if ($("geo-toggle").checked) {
      const tab = await currentTab();
      if (tab) {
        chrome.runtime.sendMessage(
          { type: "GEO_SET", tabId: tab.id, lat: coord.lat, lng: coord.lng, geoAuto: false },
          () => { render(); }
        );
      }
    }
  } else {
    inputEl.classList.remove("geo-valid");
    if (val.length > 0) inputEl.classList.add("geo-invalid");
    else inputEl.classList.remove("geo-invalid");
    if (checkIc) checkIc.style.display = "none";

    await chrome.storage.local.set({ geoManual: val });
    renderGeoCoords(mode, anchor, "");
  }
}

const DEFAULT_PATTERN = "*/security-guard.js*";
const DEFAULT_MODE = "prepend";
const DEFAULT_PATCH_JS =
  ';(function(){' +
  'var d={configurable:true,get:function(){return undefined}};' +
  'try{Object.defineProperty(window,"chrome",d)}catch(e){}' +
  'try{Object.defineProperty(navigator,"userAgentData",d)}catch(e){}' +
  'try{Object.defineProperty(Navigator.prototype,"userAgentData",d)}catch(e){}' +
  'try{Object.defineProperty(window,"outerWidth",{get:function(){return window.innerWidth},configurable:true})}catch(e){}' +
  'try{Object.defineProperty(window,"outerHeight",{get:function(){return window.innerHeight},configurable:true})}catch(e){}' +
  'try{var _F=window.Function;window.Function=function(){var a=[].slice.call(arguments);if(a.some(function(x){return typeof x==="string"&&x.indexOf("debugger")!==-1}))return function(){};return _F.apply(this,a)};window.Function.prototype=_F.prototype}catch(e){}' +
  '})();\n';

async function currentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// --- TAB SWITCHER LOGIC ---
function initTabs() {
  const tabs = [
    { btn: "tab-btn-controls",   tab: "tab-controls" },
    { btn: "tab-btn-console",    tab: "tab-console", onShow: loadLogs },
    { btn: "tab-btn-changelog",  tab: "tab-changelog", onShow: renderChangelog },
  ];

  tabs.forEach(({ btn, tab, onShow }) => {
    $(btn).addEventListener("click", () => {
      tabs.forEach(t => {
        $(t.btn).classList.toggle("active", t.btn === btn);
        $(t.tab).classList.toggle("active", t.tab === tab);
      });
      if (onShow) onShow();
    });
  });
}

// --- CHANGELOG VIEWER ---
const CHANGELOG = [
  { ver: "2.0.5", date: "2026-09-14", items: [
    "Pembaruan Label UI/UX:",
    "• CTA Update: Label tombol OTA diubah menjadi 'Update latest version'.",
    "• Modul Lokasi: Label card diubah menjadi 'GPS Location' (dari sebelumnya 'GPS Location Spoof').",
    "• Deskripsi Netral: Kata 'Memalsukan' diubah menjadi 'Mengubah koordinat GPS...'.",
  ]},
  { ver: "2.0.4", date: "2026-09-14", items: [
    "Normalisasi Desimal GPS (7 Digit): Menyeragamkan seluruh koordinat preset WFO (Kalibata & Kalisari), anchor, spoof engine, dan input manual menjadi tepat 7 digit desimal (standar presisi GPS smartphone).",
    "Natural Sensor Emulation: Menghilangkan artefak kalkulasi floating-point 14-16 desimal yang tidak wajar agar terbaca otentik seperti sensor perangkat fisik.",
  ]},
  { ver: "2.0.3", date: "2026-09-14", items: [
    "Startup Dynamic Script Purge: Pembersihan total LevelDB dynamic content script cache saat background service worker startup untuk memastikan pembaruan spoof.js langsung aktif tanpa hambatan cache browser.",
    "Hardened Injection Synchronization: Menjamin module iOS spoofing dan SweetAlert gatekeeper blocker selalu berjalan di versi disk paling mutakhir di seluruh tab.",
  ]},
  { ver: "2.0.2", date: "2026-09-14", items: [
    "Hotfix Swal Proxy Scoping: Memindahkan fungsi report logger ke root scope IIFE di spoof.js guna mencegah 'ReferenceError: report is not defined' saat gatekeeper modal dicegah pada halaman ubah-password.",
    "Zero-Interruption Page Lifecycle: Menjamin halaman pergantian password dan dialog status presensi berjalan mulus tanpa error konsol.",
  ]},
  { ver: "2.0.1", date: "2026-09-14", items: [
    "Stability & Blocker Hardening: Selektor bedah khusus untuk iOS Gatekeeper tanpa merusak modal dialog SweetAlert lainnya (konfirmasi absen, notifikasi radius, error).",
    "CDP Request Recovery: Penanganan error -32602 (Invalid InterceptionId) saat reload/navigasi cepat agar tidak memicu uncaught promise exception.",
    "UI Refinements: Tombol Reload Tab dipindah ke samping kanan Bypass All sebagai icon button mandiri dengan animasi spin interaktif.",
    "Transparent Proxy Hooking: Mengganti monkey-patching Swal dengan ES6 Proxy untuk menjamin kompatibilitas penuh method dan prototype SweetAlert bawaan website.",
  ]},
  { ver: "2.0.0", date: "2026-09-14", items: [
    "Major Release: Block iOS AppStore Gate — memblokir modal SweetAlert 'ePresensi Versi Web Sudah Tidak Digunakan' beserta backdrop gelapnya secara instan.",
    "Dual Quick Nav CTA: Tombol shortcut 2 kolom di bawah Bypass All untuk akses instan ke 'Buka Absen-Dev' dan 'Buka Presensi Lama'.",
    "Engine Hardening & Clean Startup: Pembersihan otomatis residual script registrasi dinamis dan isolasi penuh sakelar Bypass All.",
  ]},
  { ver: "1.4.39", date: "2026-08-30", items: [
    "Instant Real-Time OTA Fetcher: Menggunakan GitHub Releases REST API (/releases/latest) dengan bypass cache CDN agar rilis baru terdeteksi secara instan.",
    "Dynamic Release Notes Accordion: Render catatan rilis langsung di banner warning update tanpa perlu berpindah tab."
  ]},
  { ver: "1.4.38", date: "2026-08-30", items: [
    "Bypass All Module Isolation: Tombol master hanya menghitung 3 modul inti (iOS Safari UA, Guard Neutralizer, GPS Spoof), sepenuhnya independen dari Proxy Route.",
    "Deactivate All State: Tombol bertransformasi menjadi 'Deactivate All' dengan style merah saat 3 modul aktif."
  ]},
  { ver: "1.4.37", date: "2026-08-30", items: [
    "New Branding Icon: Logo roset anyaman geometris biru modern (16px, 48px, 128px) dengan render ultra-tajam dan transparan.",
    "Codebase Refactor & Dead Code Elimination: Menghapus seluruh dead script (proxy-auto.js, proxy-rotator.js, popup.js/html, shell scripts lama) untuk efisiensi dan performa maksimal.",
    "Optimasi Bundle: Ukuran codebase bersih dan efisien tanpa dependensi yang tidak terpakai."
  ]},
  { ver: "1.4.36", date: "2026-08-30", items: [
    "One-Click Direct OTA Download & Reload: Klik tombol update langsung mendownload rilis zip dan merefresh runtime ekstensi.",
    "Warning/Yellow Alert Banner: Tampilan banner update baru dengan tone warna Amber/Kuning dan icon warning yang kontras."
  ]},
  { ver: "1.4.35", date: "2026-08-30", items: [
    "Theme Awareness (Dark/Light mode): Otomatis mendeteksi tema OS / Chrome browser (prefers-color-scheme) dengan token CSS variables shadcn.",
    "OTA Update Alert Banner: Peningkatan kontras tema gelap dan penyesuaian styling dynamic card/controls."
  ]},
  { ver: "1.4.34", date: "2026-08-30", items: [
    "Tombol CTA 'Cek Update' Manual: Tombol di footer panel untuk men-trigger pencarian versi terbaru langsung ke GitHub secara real-time.",
    "Live Feedback State: Animasi status 'Memeriksa...', 'Update Ditemukan!', atau 'Versi Terbaru (Up-to-date)'.",
  ]},
  { ver: "1.4.33", date: "2026-08-30", items: [
    "GitHub OTA Update Engine: Deteksi otomatis update versi baru dari repository GitHub kangxgemini-netizen/eh-presensi.",
    "Shadcn Alert CTA Banner: Tampilan banner update interaktif lengkap dengan direct CTA ke GitHub & tab Changelog.",
  ]},
  { ver: "1.4.32", date: "2026-08-30", items: [
    "Isolasi Bypass All: Tombol 'Bypass All' hanya mengaktifkan modul core (iOS UA, Security-Guard Patch, & GPS Spoof).",
    "Proxy Route dibuat 100% independen & manual (tidak ikut tertoggle otomatis oleh Bypass All).",
  ]},
  { ver: "1.4.31", date: "2026-08-30", items: [
    "Pembersihan total default proxy: Menghapus auto-fill IP AWS lama dari cache & storage lokal.",
    "Full Manual Custom Proxy: Field input bersih tanpa default IP, langsung siap diisi custom proxy user.",
    "Auto-reset status subtitle card ke 'manual / off' saat URL kosong.",
  ]},
  { ver: "1.4.30", date: "2026-08-30", items: [
    "Pembersihan fallback storage proxy pada inisialisasi panel.",
  ]},
  { ver: "1.4.29", date: "2026-08-30", items: [
    "Refactor Proxy Route ke Full Manual: Menghapus preset hardcoded AWS, menyediakan input fleksibel socks5/http.",
    "Validasi & Testing Real-time: Live feedback 'Test Connection' dengan status validasi jika URL belum terisi.",
    "Pembersihan UI & UX Polish: Input langsung interaktif dengan visual hint dan scope selector.",
  ]},
  { ver: "1.4.28", date: "2026-08-30", items: [
    "UI Polish: Menyeragamkan ukuran dan tinggi button-pill Anchor (Kalibata/Kalisari) agar 100% konsisten dengan Mode pills.",
  ]},
  { ver: "1.4.27", date: "2026-08-30", items: [
    "Upgrade Proxy Route: Routing Scope selector ('Target Host Only' vs 'All Traffic') & tombol 'Test Connection'.",
    "Cleanup proxy engine: Menghapus modul auto-scraper proxy publik yang lambat/rentan mati.",
  ]},
  { ver: "1.4.26", date: "2026-08-30", items: [
    "Modernisasi UI shadcn: Mode GPS (WFO/WFH/Manual) dan Anchor (Kalibata/Kalisari) menggunakan Button/Radio-Pill group.",
    "Porting GPS terbaru: 30 titik acak Kalibata (-6.2549, 106.8514) & Kalisari (-6.3430, 106.8590) radius 20m, WFH koordinat, dan validasi manual realtime.",
    "Rollback baseline core iOS Safari fingerprint & security-guard bypass ke v1.4.23 yang terbukti 100% stabil.",
  ]},
  { ver: "1.4.23", date: "2026-08-09", items: [
    "Proxy langsung tanpa tunnel: default socks5://43.218.127.193:443 (SOCKS port 443, tembus ISP, gak perlu setup manual/SSH). 3proxy compile di AWS (port 443, systemd persistent). Instance lama 16.78.6.181 dibuang (egress rusak).",
    "Proxy Route conditional: default Target Host = presensi.kemendesa.go.id (cuma site itu lewat proxy, sisanya DIRECT). Kosongkan = semua trafik. Field Target Host TETAP kelihatan di Auto mode.",
    "Auto proxy (proxy ID gratis <=100km): anchor = GPS SPOOF aktif (auto random 50 preset ATAU manual input), fallback titik default. Filter haversine 100km dari titik spoof, live-test tab stealth, PAC conditional dari Target Host.",
    "Auto UI: checklist 5 tahap (1 ambil 2 filter 3 test 4 terapkan 5 verifikasi IP) muncul SATU PER SATU + delay 3 detik, spinner muter, auto-reload tab pas AKTIF. Hint: mylocation.org gak berubah kalau Target Host = presensi (site-specific).",
    "iOS Safari fingerprint: DNR strip sec-ch-ua* (Client Hints) saat UA Spoof ON -> server fallback ke UA iPhone Safari. Butuh permission declarativeNetRequestWithHostAccess + hapus 'fetch' dari resourceTypes (MV3 invalid).",
    "Proxy status real-time di card (update pas ketik/toggle/mode). Auto-migrate storage lama 127.0.0.1:1080 / 16.78.6.181 -> AWS. MV3 keep-alive alarm + guard lastError (fix 'message port closed').",
    "Catatan: 'Mode development aktif' di website = environment server (bukan extension). Free proxy (Auto) umur pendek -> pakai Manual AWS untuk IP stabil.",
    "Proxy Config selector Manual/Auto: Manual -> input URL + Target Host; Auto -> disable manual + tombol Auto (ID <=100km). applyAll hormati proxy-mode.",
    "Bypass All CTA: klik -> applyAll() lalu auto-reload tab aktif biar seluruh config (UA/JS/Geo/Proxy) langsung jalan di halaman.",
  ]},
  { ver: "1.4.4", date: "2026-08-06", items: [
    "Hapus status-card dari tab Controls (render null-safe).",
  ]},
  { ver: "1.4.3", date: "2026-08-06", items: [
    "Tab ke-3 'Changelog' di side panel (data dari array CHANGELOG, auto-render).",
    "Refactor initTabs() jadi loop generic.",
  ]},
  { ver: "1.4.2", date: "2026-08-06", items: [
    "Type scale dikonsolidasi ke tokens (--text-xs/sm/base/md) di :root; semua font-size acak di-remap.",
  ]},
  { ver: "1.4.1", date: "2026-08-06", items: [
    "Console Log fill container height (hapus min/max-height, pakai flex:1).",
  ]},
  { ver: "1.4.0", date: "2026-08-06", items: [
    "Geo Manual: hapus label 'Valid & Aktif'; feedback hanya di field input (border hijau + icon).",
  ]},
  { ver: "1.3.9", date: "2026-08-06", items: [
    "Console Log layout 2-row: [Time]+badge di baris 1, deskripsi di baris 2.",
  ]},
  { ver: "1.3.8", date: "2026-08-06", items: [
    "CTA Bypass All dapat state Active (merah 'Deactivate') / Inactive (biru 'Bypass All').",
  ]},
  { ver: "1.3.7", date: "2026-08-06", items: [
    "Short info deskriptif di tiap card fitur (iOS, security-guard, GPS, Proxy).",
  ]},
  { ver: "1.3.6", date: "2026-08-06", items: [
    "Console Log menampilkan kemampuan ke-4 fungsi utama (INJECT/PATCH/PROXY/UA).",
  ]},
  { ver: "1.3.5", date: "2026-08-06", items: [
    "Console Log menampilkan respon ekstensi ke halaman via kategori INJECT (cyan).",
  ]},
  { ver: "1.3.4", date: "2026-08-06", items: [
    "FIX krusial: Toggle Geo ON/OFF beneran jalan (flag geoEnabled + inject berdasar state).",
    "Version label tampil di side panel (live dari manifest).",
  ]},
  { ver: "1.3.3", date: "2026-08-06", items: [
    "FIX Toggle Geo OFF mengembalikan GPS asli (native fallback di spoof.js).",
  ]},
  { ver: "1.3.2", date: "2026-08-06", items: [
    "Preset GPS 50 koordinat acak radius 30m dari titik pusat -6.343295, 106.858673.",
  ]},
  { ver: "1.3.1", date: "2026-08-06", items: [
    "FIX input manual GPS + visual feedback (validasi range, apply real-time).",
  ]},
  { ver: "1.3.0", date: "2026-08-06", items: [
    "Side Panel + Console Log (permission sidePanel, logging engine, 2 tab).",
  ]},
  { ver: "1.2.x", date: "sebelumnya", items: [
    "GPS spoof geospoof, strong iOS spoof, JS Response Override via CDP Fetch.",
  ]},
];

function renderChangelog() {
  const c = $("changelog-container");
  if (!c) return;

  c.innerHTML = CHANGELOG.map(e => `
    <div class="cl-entry">
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="cl-ver">v${e.ver}</span>
        <span class="cl-date">${e.date}</span>
      </div>
      <ul class="cl-list">${e.items.map(i => `<li>${i}</li>`).join("")}</ul>
    </div>
  `).join("");
}

// --- CONSOLE LOG VIEWER ---
let currentLogFilter = "ALL";

function renderLogs(logs) {
  const container = $("log-container");
  const badgeCount = $("log-count-badge");
  if (!container) return;

  if (badgeCount) badgeCount.textContent = logs.length;
  container.innerHTML = "";

  const filtered = logs.filter(l => currentLogFilter === "ALL" || l.category === currentLogFilter);
  if (filtered.length === 0) {
    container.innerHTML = `<div style="padding:16px;text-align:center;color:#6b7280;font-size:11px;">Belum ada log (${currentLogFilter})</div>`;
    return;
  }

  filtered.forEach(log => {
    const el = document.createElement("div");
    el.className = "log-item";
    const badgeClass = {
      STATE: "badge-state",
      UA: "badge-ua",
      GEO: "badge-geo",
      PROXY: "badge-proxy",
      PATCH: "badge-patch",
      INJECT: "badge-inject",
      ERROR: "badge-error"
    }[log.category] || "badge-state";

    el.innerHTML = `
      <div class="log-row1">
        <span class="log-ts">[${log.timestamp}]</span>
        <span class="log-badge ${badgeClass}">${log.category}</span>
      </div>
      <div class="log-desc">${log.message}</div>
    `;
    container.appendChild(el);
  });
  container.scrollTop = container.scrollHeight;
}

async function loadLogs() {
  const data = await chrome.storage.local.get(["logHistory"]);
  renderLogs(Array.isArray(data.logHistory) ? data.logHistory : []);
}

function initConsoleToolbar() {
  $("log-filter").addEventListener("change", (e) => {
    currentLogFilter = e.target.value;
    loadLogs();
  });

  $("btn-clear-log").addEventListener("click", async () => {
    await chrome.storage.local.set({ logHistory: [] });
    loadLogs();
  });

  $("btn-copy-log").addEventListener("click", async () => {
    const data = await chrome.storage.local.get(["logHistory"]);
    const logs = Array.isArray(data.logHistory) ? data.logHistory : [];
    const text = logs.map(l => `[${l.timestamp}] [${l.category}] ${l.message}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      const orig = $("btn-copy-log").textContent;
      $("btn-copy-log").textContent = "Copied!";
      setTimeout(() => { $("btn-copy-log").textContent = orig; }, 1200);
    });
  });
}

// --- CONTROLS LOGIC ---
async function load() {
  const data = await chrome.storage.local.get(["pattern", "mode", "js", "ua", "proxyUrl", "proxyHost", "proxyOn", "proxyScope", "geoMode", "geoAnchor", "geoManual", "logHistory", "gateBlockEnabled"]);
  $("pattern").value = data.pattern || DEFAULT_PATTERN;
  $("ua").value = data.ua || DEFAULT_UA;

  // Clean custom proxy input (clear any stale legacy default URL if present)
  let savedProxyUrl = (data.proxyUrl || "").trim();
  if (savedProxyUrl.includes("43.218.127.193") || savedProxyUrl.includes("16.78.6.181")) {
    savedProxyUrl = "";
    await chrome.storage.local.remove(["proxyPreset", "proxyUrl"]);
    await chrome.storage.local.set({ proxyOn: false });
    chrome.runtime.sendMessage({ type: "PROXY_CLEAR" }).catch(() => {});
  }
  $("proxy-url").value = savedProxyUrl;
  $("proxy-host").value = data.proxyHost || "presensi.kemendesa.go.id";
  setProxyScope(data.proxyScope || "target");

  setGeoMode(data.geoMode || "wfo");
  setGeoAnchor(data.geoAnchor || "kalibata");
  $("geo-manual").value = data.geoManual || "";
  $("geo-manual-box").style.display = (getGeoMode() === "manual") ? "block" : "none";
  validateAndApplyGeoManual();
  updateProxyStatusLive();

  const gateOn = (data.gateBlockEnabled !== false);
  if ($("gate-toggle")) $("gate-toggle").checked = gateOn;
  updateGateStatusLive();

  renderLogs(Array.isArray(data.logHistory) ? data.logHistory : []);

  // Show extension version label (read live from manifest)
  try {
    const mv = chrome.runtime.getManifest().version;
    const vEl = document.getElementById("app-version");
    if (vEl && mv) vEl.textContent = "v" + mv;
  } catch (_) {}

  const tab = await currentTab();
  if (!tab) return;

  chrome.runtime.sendMessage({ type: "STATUS", tabId: tab.id }, (res) => {
    if (chrome.runtime.lastError || !res) {
      // SW mungkin sedang wake-up (MV3 race) — biarkan render pakai state storage saja
      render();
      return;
    }
    const jsOn = !!(res && res.js);
    const uaOn = !!(res && res.ua);
    const geoOn = !!(res && res.geo);
    const currentProxyUrl = ($("proxy-url") ? $("proxy-url").value.trim() : "");
    const proxyOn = !!(currentProxyUrl && (res.proxy || data.proxyOn));

    $("js-toggle").checked = jsOn;
    $("ua-toggle").checked = uaOn;
    $("geo-toggle").checked = geoOn;
    $("proxy-toggle").checked = proxyOn;
    if ($("gate-toggle") && res && res.gateBlockEnabled !== undefined) {
      $("gate-toggle").checked = !!res.gateBlockEnabled;
    }
    updateGateStatusLive();
    if (uaOn) $("ua").value = res.ua;
    if (geoOn) $("geo-coords").textContent = `${res.geo.lat.toFixed(7)}, ${res.geo.lng.toFixed(7)}`;

    if (currentProxyUrl) {
      $("proxy-status").textContent = (proxyOn ? "manual (aktif): " : "manual: ") + currentProxyUrl;
    } else {
      $("proxy-status").textContent = "manual / off";
    }

    render();
  });
}

function render() {
  const js = $("js-toggle").checked;
  const ua = $("ua-toggle").checked;
  const geo = $("geo-toggle").checked;
  const card = $("status-card");
  const title = $("status-title");
  const badge = $("status-badge");
  const count = [js, ua, geo].filter(Boolean).length;

  if (card && title && badge) {
    if (count === 3) {
      card.className = "status-card active";
      title.textContent = "Fully Bypassed & Armed";
      badge.textContent = "FULL";
    } else if (count > 0) {
      card.className = "status-card active";
      title.textContent = `${count}/3 Active`;
      badge.textContent = "PARTIAL";
    } else {
      card.className = "status-card";
      title.textContent = "Bypass Disabled";
      badge.textContent = "OFF";
    }
  }

  // Bypass All CTA state: active (all 3 on: UA, JS, Geo) -> Deactivate All, else -> Bypass All
  const btn = $("btn-bypass-all");
  const label = $("btn-bypass-label");
  const ic = $("btn-bypass-ic");
  if (count === 3) {
    btn.className = "btn btn-deactivate";
    label.textContent = "Deactivate All";
    ic.innerHTML = '<path d="M18.36 6.64A9 9 0 1 1 5.64 6.64"/><line x1="12" y1="2" x2="12" y2="12"/>';
  } else {
    btn.className = "btn btn-primary";
    label.textContent = "Bypass All";
    ic.innerHTML = '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>';
  }
}

async function applyUaIfOn() {
  if (!$("ua-toggle").checked) return;
  const tab = await currentTab();
  if (!tab) return;
  const ua = $("ua").value.trim();
  if (!ua) return;
  await chrome.storage.local.set({ ua });
  chrome.runtime.sendMessage({ type: "UA_SET", tabId: tab.id, ua }, render);
}

async function armJsIfOn() {
  if (!$("js-toggle").checked) return;
  const tab = await currentTab();
  if (!tab) return;
  const rule = {
    urlPattern: $("pattern").value.trim() || DEFAULT_PATTERN,
    mode: DEFAULT_MODE,
    replacement: DEFAULT_PATCH_JS,
  };
  if (!rule.urlPattern) return;
  await chrome.storage.local.set({ pattern: rule.urlPattern, mode: rule.mode, js: rule.replacement });
  chrome.runtime.sendMessage({ type: "JS_ENABLE", tabId: tab.id, rule }, render);
}

async function applyAll(on) {
  const tab = await currentTab();
  if (!tab) return;

  if (on) {
    const ua = $("ua").value.trim() || DEFAULT_UA;
    await chrome.storage.local.set({ ua });
    chrome.runtime.sendMessage({ type: "UA_SET", tabId: tab.id, ua });
  } else {
    chrome.runtime.sendMessage({ type: "UA_CLEAR", tabId: tab.id });
  }

  if (on) {
    const rule = { urlPattern: $("pattern").value.trim() || DEFAULT_PATTERN, mode: DEFAULT_MODE, replacement: DEFAULT_PATCH_JS };
    await chrome.storage.local.set({ pattern: rule.urlPattern, mode: rule.mode, js: rule.replacement });
    chrome.runtime.sendMessage({ type: "JS_ENABLE", tabId: tab.id, rule });
  } else {
    chrome.runtime.sendMessage({ type: "JS_DISABLE", tabId: tab.id });
  }

  if (on) {
    const mode = getGeoMode();
    const anchor = getGeoAnchor();
    const g = pickGeo(mode, $("geo-manual").value.trim(), anchor);
    const geoAuto = false;
    chrome.runtime.sendMessage({ type: "GEO_SET", tabId: tab.id, lat: g.lat, lng: g.lng, geoAuto });
  } else {
    chrome.runtime.sendMessage({ type: "GEO_CLEAR", tabId: tab.id });
  }

  // Proxy Route murni manual & independen: jangan diubah otomatis oleh Bypass All

  $("ua-toggle").checked = on;
  $("js-toggle").checked = on;
  $("geo-toggle").checked = on;
  if ($("gate-toggle")) {
    $("gate-toggle").checked = on;
    await chrome.storage.local.set({ gateBlockEnabled: on });
    updateGateStatusLive();
    chrome.runtime.sendMessage({ type: "GATE_BLOCK_SET", tabId: tab.id, enabled: on });
  }
  render();
}

// Event Listeners
if ($("gate-toggle")) {
  $("gate-toggle").addEventListener("change", async (e) => {
    const on = e.target.checked;
    await chrome.storage.local.set({ gateBlockEnabled: on });
    updateGateStatusLive();
    const tab = await currentTab();
    if (tab) {
      chrome.runtime.sendMessage({ type: "GATE_BLOCK_SET", tabId: tab.id, enabled: on }, render);
    }
  });
}

$("ua-toggle").addEventListener("change", async (e) => {
  const tab = await currentTab();
  if (!tab) return;
  if (e.target.checked) {
    const ua = $("ua").value.trim();
    if (!ua) { e.target.checked = false; return; }
    await chrome.storage.local.set({ ua });
    chrome.runtime.sendMessage({ type: "UA_SET", tabId: tab.id, ua }, render);
  } else {
    chrome.runtime.sendMessage({ type: "UA_CLEAR", tabId: tab.id }, render);
  }
});

$("ua").addEventListener("input", applyUaIfOn);

$("js-toggle").addEventListener("change", async (e) => {
  const tab = await currentTab();
  if (!tab) return;
  if (e.target.checked) {
    await armJsIfOn();
  } else {
    chrome.runtime.sendMessage({ type: "JS_DISABLE", tabId: tab.id }, render);
  }
});

$("pattern").addEventListener("input", armJsIfOn);

$("geo-toggle").addEventListener("change", async (e) => {
  const tab = await currentTab();
  if (!tab) return;
  if (e.target.checked) {
    await chrome.storage.local.set({ geoDisabled: false });
    const mode = getGeoMode();
    const anchor = getGeoAnchor();
    const g = pickGeo(mode, $("geo-manual").value.trim(), anchor);
    const geoAuto = false;
    await chrome.storage.local.set({ geoLat: g.lat, geoLng: g.lng });
    chrome.runtime.sendMessage(
      { type: "GEO_SET", tabId: tab.id, lat: g.lat, lng: g.lng, geoAuto },
      (res) => {
        if (res && res.geo) {
          $("geo-coords").textContent = `${res.geo.lat.toFixed(7)}, ${res.geo.lng.toFixed(7)}`;
        }
        render();
      }
    );
  } else {
    await chrome.storage.local.set({ geoDisabled: true });
    chrome.runtime.sendMessage({ type: "GEO_CLEAR", tabId: tab.id }, render);
  }
});

document.querySelectorAll('input[name="geo-mode"]').forEach((r) => r.addEventListener("change", async (e) => {
  const mode = e.target.value;
  $("geo-manual-box").style.display = (mode === "manual") ? "block" : "none";
  await chrome.storage.local.set({ geoMode: mode });
  validateAndApplyGeoManual();

  if ($("geo-toggle").checked) {
    const tab = await currentTab();
    if (tab) {
      const g = pickGeo(mode, $("geo-manual").value.trim(), getGeoAnchor());
      const geoAuto = false;
      chrome.runtime.sendMessage(
        { type: "GEO_SET", tabId: tab.id, lat: g.lat, lng: g.lng, geoAuto },
        (res) => {
          if (res && res.geo) {
            $("geo-coords").textContent = `${res.geo.lat.toFixed(7)}, ${res.geo.lng.toFixed(7)}`;
          }
          render();
        }
      );
    }
  }
}));

$("geo-manual").addEventListener("input", () => {
  validateAndApplyGeoManual();
});

document.querySelectorAll('input[name="geo-anchor"]').forEach((r) => r.addEventListener("change", async () => {
  await chrome.storage.local.set({ geoAnchor: getGeoAnchor() });
  renderGeoCoords(getGeoMode(), getGeoAnchor(), $("geo-manual").value.trim());
  if ($("geo-toggle").checked) {
    const tab = await currentTab();
    if (tab) {
      const g = pickGeo(getGeoMode(), $("geo-manual").value.trim(), getGeoAnchor());
      chrome.runtime.sendMessage(
        { type: "GEO_SET", tabId: tab.id, lat: g.lat, lng: g.lng, geoAuto: false },
        () => { render(); }
      );
    }
  }
}));

async function applyProxyIfOn() {
  if (!$("proxy-toggle").checked) return;
  let url = $("proxy-url").value.trim();
  const host = $("proxy-host").value.trim();
  const scope = getProxyScope();

  if (!url) {
    $("proxy-status").textContent = "manual: belum diisi";
    return;
  }

  await chrome.storage.local.set({ proxyUrl: url, proxyHost: host, proxyOn: true, proxyScope: scope });
  chrome.runtime.sendMessage({ type: "PROXY_SET", proxyUrl: url, targetHost: host, scope }, (res) => {
    if (res && res.ok) {
      $("proxy-status").textContent = `manual: ${res.proxy.scheme} ${res.proxy.host}:${res.proxy.port}`;
    }
    render();
  });
}

document.querySelectorAll('input[name="proxy-scope"]').forEach((r) => r.addEventListener("change", async (e) => {
  const scope = e.target.value;
  await chrome.storage.local.set({ proxyScope: scope });
  updateProxyStatusLive();
  if ($("proxy-toggle").checked) {
    await applyProxyIfOn();
  }
}));

$("btn-proxy-test").addEventListener("click", async () => {
  const btn = $("btn-proxy-test");
  const statusEl = $("proxy-test-status");
  let url = $("proxy-url").value.trim();

  if (!url) {
    statusEl.textContent = "Silakan isi Proxy URL terlebih dahulu.";
    statusEl.style.color = "var(--destructive)";
    return;
  }

  btn.disabled = true;
  btn.style.opacity = "0.6";
  statusEl.textContent = "Menguji koneksi proxy...";
  statusEl.style.color = "var(--muted-foreground)";

  chrome.runtime.sendMessage({ type: "PROXY_TEST", proxyUrl: url }, (res) => {
    btn.disabled = false;
    btn.style.opacity = "1";
    if (res && res.ok) {
      statusEl.textContent = `Connected (${res.latencyMs}ms) · IP: ${res.ip}`;
      statusEl.style.color = "var(--success)";
    } else {
      statusEl.textContent = `Gagal: ${res && res.error ? res.error : "Connection error"}`;
      statusEl.style.color = "var(--destructive)";
    }
  });
});

$("proxy-toggle").addEventListener("change", async (e) => {
  if (e.target.checked) {
    await applyProxyIfOn();
  } else {
    await chrome.storage.local.set({ proxyOn: false });
    chrome.runtime.sendMessage({ type: "PROXY_CLEAR" }, render);
  }
});

$("proxy-url").addEventListener("input", () => {
  applyProxyIfOn();
  updateProxyStatusLive();
});
$("proxy-host").addEventListener("input", () => {
  applyProxyIfOn();
  updateProxyStatusLive();
});

// Real-time status text (tanpa nunggu toggle ON)
function updateGateStatusLive() {
  const el = $("gate-status");
  if (!el) return;
  const on = $("gate-toggle") ? $("gate-toggle").checked : false;
  el.textContent = on ? "blocker: aktif" : "blocker: nonaktif";
}

function updateProxyStatusLive() {
  const scope = getProxyScope();
  let url = $("proxy-url") ? $("proxy-url").value.trim() : "";
  const host = $("proxy-host") ? $("proxy-host").value.trim() : "";
  const on = $("proxy-toggle") ? $("proxy-toggle").checked : false;

  if (!url) {
    $("proxy-status").textContent = on ? "aktif: url kosong" : "manual / off";
    return;
  }

  const scopeText = (scope === "target" && host) ? ` → hanya ${host}` : " → semua trafik";
  $("proxy-status").textContent = (on ? "manual (aktif): " : "manual: ") + url + scopeText;
}

$("btn-reload").addEventListener("click", async () => {
  const btn = $("btn-reload");
  const ic = btn ? btn.querySelector(".ic") : null;
  if (ic) {
    ic.style.transition = "transform 0.4s ease";
    ic.style.transform = "rotate(360deg)";
    setTimeout(() => {
      ic.style.transition = "none";
      ic.style.transform = "none";
    }, 400);
  }
  const tab = await currentTab();
  if (!tab || !tab.id) return;
  if ($("geo-toggle").checked) {
    const g = pickGeo(getGeoMode(), $("geo-manual").value.trim(), getGeoAnchor());
    chrome.runtime.sendMessage(
      { type: "GEO_SET", tabId: tab.id, lat: g.lat, lng: g.lng, geoAuto: true },
      (res) => {
        if (res && res.geo) {
          $("geo-coords").textContent = `${res.geo.lat.toFixed(7)}, ${res.geo.lng.toFixed(7)}`;
        }
      }
    );
  }
  chrome.tabs.reload(tab.id);
});

$("btn-bypass-all").addEventListener("click", async () => {
  const allOn = $("ua-toggle").checked && $("js-toggle").checked && $("geo-toggle").checked;
  await applyAll(!allOn);
  // Reload tab aktif biar seluruh config (UA/JS/Geo/Proxy) langsung jalan di halaman
  try {
    const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (t && t.id) chrome.tabs.reload(t.id);
  } catch (_) {}
});

if ($("btn-open-dashboard")) {
  $("btn-open-dashboard").addEventListener("click", async () => {
    const targetUrl = "https://presensi.kemendesa.go.id/absen-dev/dashboard";
    const tab = await currentTab();
    if (tab && tab.id) {
      chrome.tabs.update(tab.id, { url: targetUrl, active: true });
    } else {
      chrome.tabs.create({ url: targetUrl, active: true });
    }
  });
}

if ($("btn-open-legacy")) {
  $("btn-open-legacy").addEventListener("click", async () => {
    const targetUrl = "https://presensi.kemendesa.go.id/dashboard";
    const tab = await currentTab();
    if (tab && tab.id) {
      chrome.tabs.update(tab.id, { url: targetUrl, active: true });
    } else {
      chrome.tabs.create({ url: targetUrl, active: true });
    }
  });
}

// Live Log Listener
const STAGE_KEYWORDS = [
  { key: "ambil", re: /mengambil daftar proxy/i },
  { key: "filter", re: /memfilter proxy/i },
  { key: "test", re: /menguji koneksi/i },
  { key: "terapkan", re: /menerapkan proxy/i },
  { key: "verifikasi", re: /memverifikasi ip/i },
];
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "LOG_EVENT") {
    // Real-time checklist di-handle oleh timed animation loop (bukan log), biar muncul satu per satu 3s.
    loadLogs();
  }
});

// --- OTA UPDATE CHECKER ---
const REPO_OWNER = "kangxgemini-netizen";
const REPO_NAME = "eh-presensi";
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

let targetNewVersion = null;

async function executeAutoUpdate() {
  const btn = $("btn-ota-open");
  if (!btn) return;
  const originalHtml = btn.innerHTML;

  try {
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="ic" viewBox="0 0 24 24" style="width:12px;height:12px;animation:eh-spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-2.64-6.36L21 8"/></svg>
      <span>Mendownload update file...</span>
    `;

    // Download rilis zip via chrome.downloads atau direct web fetch
    const zipUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/v${targetNewVersion}/eh-presensi-v${targetNewVersion}.zip`;

    // Trigger download zip rilis ke folder ~/Downloads via Chrome Downloads API
    await chrome.downloads.download({
      url: zipUrl,
      filename: `eh-presensi-v${targetNewVersion}.zip`,
      saveAs: false,
      conflictAction: "overwrite"
    });

    btn.innerHTML = `
      <svg class="ic" viewBox="0 0 24 24" style="width:12px;height:12px;"><path d="M20 6L9 17l-5-5"/></svg>
      <span>Rilis v${targetNewVersion} Terdownload! Merefresh...</span>
    `;

    // Reload extension
    setTimeout(() => {
      chrome.runtime.reload();
    }, 1500);

  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = `<span>Gagal Download: Buka GitHub</span>`;
    setTimeout(() => {
      chrome.tabs.create({ url: `${REPO_URL}/releases/latest` });
      btn.innerHTML = originalHtml;
    }, 1500);
  }
}

function isNewerVersion(remote, local) {
  if (!remote || !local) return false;
  const p1 = remote.split(".").map(n => parseInt(n, 10) || 0);
  const p2 = local.split(".").map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const v1 = p1[i] || 0;
    const v2 = p2[i] || 0;
    if (v1 > v2) return true;
    if (v1 < v2) return false;
  }
  return false;
}

async function checkOTAUpdate(isManual = false) {
  const btnCheck = $("btn-check-version");
  const textCheck = $("check-version-text");

  if (isManual && textCheck) {
    textCheck.textContent = "Memeriksa...";
    if (btnCheck) btnCheck.style.opacity = "0.7";
  }

  try {
    // 1. Coba fetch dari GitHub API Releases terbaru lebih dulu (real-time tanpa CDN cache)
    let remoteVer = null;
    let remoteNotes = null;

    try {
      const releaseApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
      const relRes = await fetch(releaseApiUrl, {
        headers: { "Accept": "application/vnd.github.v3+json" }
      });
      if (relRes.ok) {
        const relData = await relRes.json();
        if (relData && relData.tag_name) {
          remoteVer = relData.tag_name.replace(/^v/, "").trim();
          remoteNotes = relData.body || "";
        }
      }
    } catch (_) {}

    // 2. Fallback ke raw manifest.json dengan timestamp query param untuk bypass CDN cache 300s
    if (!remoteVer) {
      const ts = Date.now();
      const manifestUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/manifest.json?_t=${ts}`;
      const res = await fetch(manifestUrl, { cache: "no-cache" });
      if (!res.ok) throw new Error("Gagal mengambil manifest");
      const remoteManifest = await res.json();
      remoteVer = remoteManifest.version;
    }

    const localVer = chrome.runtime.getManifest().version;

    if (isNewerVersion(remoteVer, localVer)) {
      targetNewVersion = remoteVer;
      const banner = $("ota-banner");
      const title = $("ota-title");
      const desc = $("ota-desc");
      const clContent = $("ota-changelog-content");

      if (banner && title && desc) {
        title.textContent = `Update Tersedia: v${remoteVer}`;
        desc.textContent = `Versi v${remoteVer} tersedia di GitHub (saat ini v${localVer}).`;
        banner.style.display = "block";
      }

      // Render release notes / changelog
      if (clContent) {
        if (remoteNotes) {
          // Format release notes dari GitHub Release
          const formattedNotes = remoteNotes
            .replace(/^##\s+.*$/m, "")
            .replace(/\n\s*-\s+/g, "<br>• ")
            .trim();
          clContent.innerHTML = `
            <div style="font-weight:700; margin-bottom:4px;">Rilis v${remoteVer}</div>
            <div style="line-height:1.4;">${formattedNotes}</div>
          `;
        } else {
          // Fallback ke local changelog entry
          const localEntry = CHANGELOG.find(l => l.ver === remoteVer) || CHANGELOG[0];
          if (localEntry && localEntry.items) {
            clContent.innerHTML = `
              <div style="font-weight:700; margin-bottom:4px;">Rilis v${localEntry.ver} (${localEntry.date})</div>
              <ul>${localEntry.items.map(it => `<li>${it}</li>`).join("")}</ul>
            `;
          }
        }
      }

      if (isManual && textCheck) {
        textCheck.textContent = "Update Ditemukan!";
        setTimeout(() => { textCheck.textContent = "Cek Update"; }, 3000);
      }
    } else {
      if (isManual && textCheck) {
        textCheck.textContent = "Versi Terbaru (Up-to-date)";
        setTimeout(() => { textCheck.textContent = "Cek Update"; }, 2500);
      }
    }
  } catch (err) {
    if (isManual && textCheck) {
      textCheck.textContent = "Gagal Cek Update";
      setTimeout(() => { textCheck.textContent = "Cek Update"; }, 2500);
    }
  } finally {
    if (btnCheck) btnCheck.style.opacity = "1";
  }
}

function initOTA() {
  const btnOpen = $("btn-ota-open");
  const btnCheck = $("btn-check-version");

  if (btnOpen) {
    btnOpen.addEventListener("click", () => {
      executeAutoUpdate();
    });
  }
  if (btnCheck) {
    btnCheck.addEventListener("click", () => {
      checkOTAUpdate(true);
    });
  }

  checkOTAUpdate(false);
}

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initConsoleToolbar();
  initOTA();
  load();
});
