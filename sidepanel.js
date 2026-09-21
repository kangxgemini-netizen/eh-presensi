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

function getGeoStyle() {
  const el = document.querySelector('input[name="geo-style"]:checked');
  return el ? el.value : "ios";
}
function setGeoStyle(v) {
  const r = document.querySelector('input[name="geo-style"][value="' + v + '"]');
  if (r) r.checked = true;
}

function updateGeoPlaceholder(style) {
  const inputEl = $("geo-manual");
  const hintEl = $("geo-manual-hint");
  if (!inputEl) return;
  if (style === "android") {
    inputEl.placeholder = "-6.254742, 106.7249454";
    if (hintEl) hintEl.textContent = "Format: -6.254742, 106.7249454 (Android style: 6-7 digit desimal)";
  } else {
    inputEl.placeholder = "-6.34294464805416, 106.859012539737";
    if (hintEl) hintEl.textContent = "Format: -6.34294464805416, 106.859012539737 (iOS style: 14 digit desimal)";
  }
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
  ios: {
    kalibata: { lat: -6.254909403644054, lng: 106.85143128081853 },
    kalisari: { lat: -6.343049224430671, lng: 106.85907517136334 }
  },
  android: {
    kalibata: { lat: -6.254909, lng: 106.8514313 },
    kalisari: { lat: -6.343049, lng: 106.8590752 }
  }
};

const WFH_COORDS = {
  ios: { lat: -6.343049224430671, lng: 106.85907517136334 },
  android: { lat: -6.343049, lng: 106.8590752 }
};

const WFO_PRESETS = {
  ios: {
    kalibata: [{"lat": -6.254927593631349, "lng": 106.85140932272272}, {"lat": -6.254922697519233, "lng": 106.85151561714237}, {"lat": -6.254921951521704, "lng": 106.85128313927164}, {"lat": -6.25486812780363, "lng": 106.85139787712154}, {"lat": -6.2549367590237015, "lng": 106.8514459797313}, {"lat": -6.25488439875606, "lng": 106.85155727813797}, {"lat": -6.254830401032189, "lng": 106.85144465600945}, {"lat": -6.254987437688222, "lng": 106.85132339777968}, {"lat": -6.254883936053605, "lng": 106.85156763598403}, {"lat": -6.25490412015442, "lng": 106.85141771469434}, {"lat": -6.2548578271930335, "lng": 106.85128945862739}, {"lat": -6.25494745701193, "lng": 106.85149139307322}, {"lat": -6.254808913499901, "lng": 106.85140342920505}, {"lat": -6.254862751501531, "lng": 106.8514622129487}, {"lat": -6.254829138556013, "lng": 106.85131638256804}, {"lat": -6.254855489461963, "lng": 106.85128672643877}, {"lat": -6.255082062621966, "lng": 106.8513910461431}, {"lat": -6.255005866627508, "lng": 106.85152410444694}, {"lat": -6.254841796829954, "lng": 106.85130646434055}, {"lat": -6.254821263277841, "lng": 106.85132640995053}, {"lat": -6.254920232857241, "lng": 106.85139415627498}, {"lat": -6.254896025179033, "lng": 106.85152757254372}, {"lat": -6.254833387210668, "lng": 106.85147319140692}, {"lat": -6.25483312241945, "lng": 106.85148777539706}, {"lat": -6.254980817420954, "lng": 106.85134908277502}, {"lat": -6.254965765423752, "lng": 106.85149152203927}, {"lat": -6.25492791696741, "lng": 106.85160520656576}, {"lat": -6.2549932173118625, "lng": 106.85131819267933}, {"lat": -6.254836460701443, "lng": 106.85156705000934}, {"lat": -6.254852113775574, "lng": 106.85152653753497}],
    kalisari: [{"lat": -6.342905805959112, "lng": 106.85906565870027}, {"lat": -6.343188463779803, "lng": 106.85902278592775}, {"lat": -6.34296204050186, "lng": 106.85894227033938}, {"lat": -6.343044999109876, "lng": 106.85910727865158}, {"lat": -6.343086387545774, "lng": 106.85916090879653}, {"lat": -6.343006882716122, "lng": 106.8592454559652}, {"lat": -6.342977349914106, "lng": 106.85900408642941}, {"lat": -6.343112485511974, "lng": 106.85898095460189}, {"lat": -6.34294464805416, "lng": 106.85901253973728}, {"lat": -6.343057554187329, "lng": 106.85916455200355}, {"lat": -6.343134554689285, "lng": 106.85904032195981}, {"lat": -6.343195978881353, "lng": 106.85898836408934}, {"lat": -6.343117107436662, "lng": 106.85912518919687}, {"lat": -6.342920994881032, "lng": 106.85907317505823}, {"lat": -6.3430164172377514, "lng": 106.85909638522605}, {"lat": -6.342939370555359, "lng": 106.85916620046864}, {"lat": -6.343018719310226, "lng": 106.85896180019901}, {"lat": -6.3429469622445795, "lng": 106.85911857114681}, {"lat": -6.342918576483772, "lng": 106.85907196721602}, {"lat": -6.342885281638708, "lng": 106.85904486182702}, {"lat": -6.342897096253924, "lng": 106.85908623228059}, {"lat": -6.343103996323526, "lng": 106.85895471492435}, {"lat": -6.343064402043868, "lng": 106.85921908712523}, {"lat": -6.342958687569869, "lng": 106.85915203993997}, {"lat": -6.343217323835156, "lng": 106.85912578384008}, {"lat": -6.342983676996946, "lng": 106.85900992331872}, {"lat": -6.343125162167386, "lng": 106.85907488998693}, {"lat": -6.342906228004826, "lng": 106.85898716218394}, {"lat": -6.34309226617131, "lng": 106.85921302531669}, {"lat": -6.34310363255925, "lng": 106.85903047725714}]
  },
  android: {
    kalibata: [{"lat": -6.254928, "lng": 106.8514093}, {"lat": -6.254923, "lng": 106.8515156}, {"lat": -6.254922, "lng": 106.8512831}, {"lat": -6.254868, "lng": 106.8513979}, {"lat": -6.254937, "lng": 106.851446}, {"lat": -6.254884, "lng": 106.8515573}, {"lat": -6.25483, "lng": 106.8514447}, {"lat": -6.254987, "lng": 106.8513234}, {"lat": -6.254884, "lng": 106.8515676}, {"lat": -6.254904, "lng": 106.8514177}, {"lat": -6.254858, "lng": 106.8512895}, {"lat": -6.254947, "lng": 106.8514914}, {"lat": -6.254809, "lng": 106.8514034}, {"lat": -6.254863, "lng": 106.8514622}, {"lat": -6.254829, "lng": 106.8513164}, {"lat": -6.254855, "lng": 106.8512867}, {"lat": -6.255082, "lng": 106.851391}, {"lat": -6.255006, "lng": 106.8515241}, {"lat": -6.254842, "lng": 106.8513065}, {"lat": -6.254821, "lng": 106.8513264}, {"lat": -6.25492, "lng": 106.8513942}, {"lat": -6.254896, "lng": 106.8515276}, {"lat": -6.254833, "lng": 106.8514732}, {"lat": -6.254833, "lng": 106.8514878}, {"lat": -6.254981, "lng": 106.8513491}, {"lat": -6.254966, "lng": 106.8514915}, {"lat": -6.254928, "lng": 106.8516052}, {"lat": -6.254993, "lng": 106.8513182}, {"lat": -6.254836, "lng": 106.8515671}, {"lat": -6.254852, "lng": 106.8515265}],
    kalisari: [{"lat": -6.342906, "lng": 106.8590657}, {"lat": -6.343188, "lng": 106.8590228}, {"lat": -6.342962, "lng": 106.8589423}, {"lat": -6.343045, "lng": 106.8591073}, {"lat": -6.343086, "lng": 106.8591609}, {"lat": -6.343007, "lng": 106.8592455}, {"lat": -6.342977, "lng": 106.8590041}, {"lat": -6.343112, "lng": 106.858981}, {"lat": -6.342945, "lng": 106.8590125}, {"lat": -6.343058, "lng": 106.8591646}, {"lat": -6.343135, "lng": 106.8590403}, {"lat": -6.343196, "lng": 106.8589884}, {"lat": -6.343117, "lng": 106.8591252}, {"lat": -6.342921, "lng": 106.8590732}, {"lat": -6.343016, "lng": 106.8590964}, {"lat": -6.342939, "lng": 106.8591662}, {"lat": -6.343019, "lng": 106.8589618}, {"lat": -6.342947, "lng": 106.8591186}, {"lat": -6.342919, "lng": 106.859072}, {"lat": -6.342885, "lng": 106.8590449}, {"lat": -6.342897, "lng": 106.8590862}, {"lat": -6.343104, "lng": 106.8589547}, {"lat": -6.343064, "lng": 106.8592191}, {"lat": -6.342959, "lng": 106.859152}, {"lat": -6.343217, "lng": 106.8591258}, {"lat": -6.342984, "lng": 106.8590099}, {"lat": -6.343125, "lng": 106.8590749}, {"lat": -6.342906, "lng": 106.8589872}, {"lat": -6.343092, "lng": 106.859213}, {"lat": -6.343104, "lng": 106.8590305}]
  }
};

function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function applyGeoStyle(coord, style) {
  if (!coord) return null;
  const s = style || "ios";
  const numLat = typeof coord.lat === "number" ? coord.lat : parseFloat(coord.lat);
  const numLng = typeof coord.lng === "number" ? coord.lng : parseFloat(coord.lng);
  if (isNaN(numLat) || isNaN(numLng)) return null;

  if (s === "android") {
    return {
      lat: Number(numLat.toFixed(6)),
      lng: Number(numLng.toFixed(7))
    };
  }

  // iOS style: high precision float (14 decimals for lat, 12-14 decimals for lng)
  const strLat = String(numLat);
  const strLng = String(numLng);
  const latDecs = (strLat.split(".")[1] || "").length;
  const lngDecs = (strLng.split(".")[1] || "").length;

  let finalLat = numLat;
  let finalLng = numLng;

  if (latDecs < 10) {
    const seed = Math.abs(Math.sin(numLat * 98765.4321));
    const tailStr = seed.toFixed(14).slice(7, 14);
    finalLat = Number(numLat.toFixed(7) + tailStr);
  } else {
    finalLat = Number(numLat.toFixed(14));
  }

  if (lngDecs < 10) {
    const seed = Math.abs(Math.cos(numLng * 12345.6789));
    const tailStr = seed.toFixed(12).slice(7, 12);
    finalLng = Number(numLng.toFixed(7) + tailStr);
  } else {
    finalLng = Number(numLng.toFixed(12));
  }

  return { lat: finalLat, lng: finalLng };
}

function parseGeoCoord(str) {
  if (!str) return null;
  const trimmed = String(str).trim();
  let parts;
  if (trimmed.includes(",")) {
    parts = trimmed.split(",");
  } else if (trimmed.includes("\t")) {
    parts = trimmed.split("\t");
  } else {
    parts = trimmed.split(/\s+/);
  }
  if (parts.length < 2) return null;
  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());
  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

function pickGeo(mode, manualCoord, anchor, style) {
  const s = style || getGeoStyle();
  if (mode === "manual") {
    const c = parseGeoCoord(manualCoord);
    if (c) return applyGeoStyle(c, s);
  }
  if (mode === "wfo") {
    const presetsByStyle = WFO_PRESETS[s] || WFO_PRESETS.ios;
    const wfo = presetsByStyle[anchor] || presetsByStyle.kalibata;
    const item = randItem(wfo);
    return { lat: item.lat, lng: item.lng };
  }
  if (mode === "wfh") {
    const wfh = WFH_COORDS[s] || WFH_COORDS.ios;
    return { lat: wfh.lat, lng: wfh.lng };
  }
  const presetsByStyle = WFO_PRESETS[s] || WFO_PRESETS.ios;
  const item = randItem(presetsByStyle.kalibata);
  return { lat: item.lat, lng: item.lng };
}

function renderGeoCoords(mode, anchor, manual, style) {
  const el = $("geo-coords");
  if (!el) return;
  const s = style || getGeoStyle();
  if (mode === "manual" && parseGeoCoord(manual)) {
    const c = applyGeoStyle(parseGeoCoord(manual), s);
    el.textContent = `Manual · ${s.toUpperCase()} · ${c.lat}, ${c.lng}`;
    return;
  }
  const anchorsByStyle = ANCHORS[s] || ANCHORS.ios;
  const a = anchorsByStyle[anchor] || anchorsByStyle.kalibata;
  el.textContent = `${mode.toUpperCase()} · ${anchor[0].toUpperCase()+anchor.slice(1)} · ${s.toUpperCase()} · ${a.lat}, ${a.lng}`;
}

async function validateAndApplyGeoManual() {
  const mode = getGeoMode();
  const anchor = getGeoAnchor();
  const style = getGeoStyle();
  const val = $("geo-manual").value.trim();
  const rawCoord = parseGeoCoord(val);
  const inputEl = $("geo-manual");
  const checkIc = $("geo-manual-check-ic");

  if (rawCoord) {
    const coord = applyGeoStyle(rawCoord, style);
    inputEl.classList.add("geo-valid");
    inputEl.classList.remove("geo-invalid");
    if (checkIc) checkIc.style.display = "flex";

    await chrome.storage.local.set({ geoManual: val, geoLat: coord.lat, geoLng: coord.lng });

    renderGeoCoords("manual", anchor, val, style);

    if ($("geo-toggle").checked) {
      const tab = await currentTab();
      if (tab) {
        chrome.runtime.sendMessage(
          { type: "GEO_SET", tabId: tab.id, lat: coord.lat, lng: coord.lng, geoAuto: false, geoStyle: style },
          (res) => {
            if (res && res.geo) {
              $("geo-coords").textContent = `${res.geo.lat}, ${res.geo.lng}`;
            }
            render();
          }
        );
      }
    }
  } else {
    inputEl.classList.remove("geo-valid");
    if (val.length > 0) inputEl.classList.add("geo-invalid");
    else inputEl.classList.remove("geo-invalid");
    if (checkIc) checkIc.style.display = "none";

    await chrome.storage.local.set({ geoManual: val });
    renderGeoCoords(mode, anchor, "", style);
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
  { ver: "2.2.3", date: "2026-09-21", items: [
    "Permanent Gatekeeper Dismissal ('ePresensi Versi Web Sudah Tidak Digunakan'):",
    "• Persistence & In-Page Cache: Menyimpan status Gate Block di localStorage sehingga langsung aktif pada document_start bahkan sebelum background worker sempat menginjeksi config.",
    "• Navigation/Reload Auto-Sync: Memperbaiki event onUpdated background service worker agar selalu menyuntikkan ulang Gate Block pada setiap reload/F5 tab.",
    "• Multi-Layer Purge & Poller: Menambahkan poller 200ms pasca-load untuk menghancurkan SweetAlert tertunda, menutup Swal.close() secara bersih, dan mengembalikan overflow body.",
  ]},
  { ver: "2.2.2", date: "2026-09-21", items: [
    "Restore Baseline iPhone Safari Fingerprint: Mengembalikan User-Agent dan profil navigator ke iPhone Safari resmi (Mozilla/5.0 ... Version/26.4 Mobile/15E148 Safari/604.1).",
    "Bypass security-guard.js 'Gunakan Safari di iPhone/iPad': Memastikan website presensi.kemendesa.go.id mengenali browser sebagai Safari resmi sehingga tidak memicu blokir 'Akses Dibatasi'.",
    "Kombinasi Modul Stabil (v2.1.3 Baseline): Bekerja bersama Security Bypass, GPS Location dual-style (14 digit float iOS vs 6-7 digit Android), dan Block iOS Update.",
  ]},
  { ver: "2.1.3", date: "2026-09-21", items: [
    "Sinkronisasi Master Bypass All & Block iOS Update: Tombol Bypass All kini mengaktifkan Block iOS Update secara bersamaan (4/4 modul aktif), sementara status awal ekstensi tetap default non-aktif saat baru dipasang.",
  ]},
  { ver: "2.1.2", date: "2026-09-21", items: [
    "Penyederhanaan Label UI: 'security-guard.js Bypass' diubah menjadi 'Security Bypass', 'Block iOS AppStore Gate' menjadi 'Block iOS Update', 'Proxy Route (IP Jakarta)' menjadi 'Proxy Route', 'Anchor' menjadi 'Lokasi Kantor', dan 'GPS Style' menjadi 'Device e-Presensi'.",
    "Reposisi CTA Navigasi: Menukar posisi tombol aksi cepat, 'Buka Presensi Lama' kini di sebelah kiri dan 'Buka Absen-Dev' di sebelah kanan.",
  ]},
  { ver: "2.1.1", date: "2026-09-21", items: [
    "Block iOS AppStore Gate Default Non-Aktif: Mengubah status bawaan (default) fitur Block iOS AppStore Gate menjadi non-aktif (OFF) saat ekstensi diaktifkan atau dipasang.",
    "Manual & Independent Gate Blocker: Mengeluarkan toggle Gate Blocker dari tombol master Bypass All agar tidak aktif otomatis tanpa persetujuan eksplisit pengguna.",
    "Synchronized State Verification: Sinkronisasi status blocker di sidepanel UI, background service worker, dan content script injection agar secara konsisten non-aktif kecuali diaktifkan manual.",
  ]},
  { ver: "2.1.0", date: "2026-09-18", items: [
    "Fitur GPS Location Style (iOS & Android):",
    "• iOS Style: Emulasi presisi CoreLocation / WebKit 64-bit IEEE 754 double precision (14 digit desimal, misal: -6.34294464805416, 106.859012539737).",
    "• Android Style: Format presisi standar FusedLocationProvider / Chromium Android (6-7 digit desimal, misal: -6.254742, 106.7249454).",
    "• Dynamic Conversion & Input Parsing: Input manual mendukung pemisah koma, tab (\\t), atau spasi, serta otomatis beradaptasi dengan gaya perangkat yang dipilih.",
    "• Dual Preset Engine: Tersedia 30 titik acak WFO Kalibata & Kalisari khusus untuk mode iOS dan Android.",
  ]},
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
  const data = await chrome.storage.local.get(["pattern", "mode", "js", "ua", "proxyUrl", "proxyHost", "proxyOn", "proxyScope", "geoMode", "geoAnchor", "geoManual", "geoStyle", "logHistory", "gateBlockEnabled"]);
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
  setGeoStyle(data.geoStyle || "ios");
  updateGeoPlaceholder(data.geoStyle || "ios");
  $("geo-manual").value = data.geoManual || "";
  $("geo-manual-box").style.display = (getGeoMode() === "manual") ? "block" : "none";
  validateAndApplyGeoManual();
  updateProxyStatusLive();

  const gateOn = !!data.gateBlockEnabled;
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
    if (geoOn) $("geo-coords").textContent = `${res.geo.lat}, ${res.geo.lng}`;

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
  const gate = $("gate-toggle") ? $("gate-toggle").checked : false;
  const card = $("status-card");
  const title = $("status-title");
  const badge = $("status-badge");
  const count = [js, ua, geo, gate].filter(Boolean).length;

  if (card && title && badge) {
    if (count === 4) {
      card.className = "status-card active";
      title.textContent = "Fully Bypassed & Armed";
      badge.textContent = "FULL";
    } else if (count > 0) {
      card.className = "status-card active";
      title.textContent = `${count}/4 Active`;
      badge.textContent = "PARTIAL";
    } else {
      card.className = "status-card";
      title.textContent = "Bypass Disabled";
      badge.textContent = "OFF";
    }
  }

  // Bypass All CTA state: active (all 4 on: UA, JS, Geo, Gate) -> Deactivate All, else -> Bypass All
  const btn = $("btn-bypass-all");
  const label = $("btn-bypass-label");
  const ic = $("btn-bypass-ic");
  if (count === 4) {
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
    const style = getGeoStyle();
    const g = pickGeo(mode, $("geo-manual").value.trim(), anchor, style);
    const geoAuto = false;
    chrome.runtime.sendMessage({ type: "GEO_SET", tabId: tab.id, lat: g.lat, lng: g.lng, geoAuto, geoStyle: style });
  } else {
    chrome.runtime.sendMessage({ type: "GEO_CLEAR", tabId: tab.id });
  }

  // Block iOS Update ikutan aktif saat Bypass All aktif
  if ($("gate-toggle")) {
    $("gate-toggle").checked = on;
    await chrome.storage.local.set({ gateBlockEnabled: on });
    updateGateStatusLive();
    await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "GATE_BLOCK_SET", tabId: tab.id, enabled: on }, () => resolve());
    });
  }

  // Proxy Route murni manual & independen: jangan diubah otomatis oleh Bypass All

  $("ua-toggle").checked = on;
  $("js-toggle").checked = on;
  $("geo-toggle").checked = on;
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
    const style = getGeoStyle();
    const g = pickGeo(mode, $("geo-manual").value.trim(), anchor, style);
    const geoAuto = false;
    await chrome.storage.local.set({ geoLat: g.lat, geoLng: g.lng });
    chrome.runtime.sendMessage(
      { type: "GEO_SET", tabId: tab.id, lat: g.lat, lng: g.lng, geoAuto, geoStyle: style },
      (res) => {
        if (res && res.geo) {
          $("geo-coords").textContent = `${res.geo.lat}, ${res.geo.lng}`;
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
      const style = getGeoStyle();
      const g = pickGeo(mode, $("geo-manual").value.trim(), getGeoAnchor(), style);
      const geoAuto = false;
      chrome.runtime.sendMessage(
        { type: "GEO_SET", tabId: tab.id, lat: g.lat, lng: g.lng, geoAuto, geoStyle: style },
        (res) => {
          if (res && res.geo) {
            $("geo-coords").textContent = `${res.geo.lat}, ${res.geo.lng}`;
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
  renderGeoCoords(getGeoMode(), getGeoAnchor(), $("geo-manual").value.trim(), getGeoStyle());
  if ($("geo-toggle").checked) {
    const tab = await currentTab();
    if (tab) {
      const style = getGeoStyle();
      const g = pickGeo(getGeoMode(), $("geo-manual").value.trim(), getGeoAnchor(), style);
      chrome.runtime.sendMessage(
        { type: "GEO_SET", tabId: tab.id, lat: g.lat, lng: g.lng, geoAuto: false, geoStyle: style },
        () => { render(); }
      );
    }
  }
}));

document.querySelectorAll('input[name="geo-style"]').forEach((r) => r.addEventListener("change", async (e) => {
  const style = e.target.value;
  await chrome.storage.local.set({ geoStyle: style });
  updateGeoPlaceholder(style);
  renderGeoCoords(getGeoMode(), getGeoAnchor(), $("geo-manual").value.trim(), style);

  if ($("geo-toggle").checked) {
    const tab = await currentTab();
    if (tab) {
      const g = pickGeo(getGeoMode(), $("geo-manual").value.trim(), getGeoAnchor(), style);
      await chrome.storage.local.set({ geoLat: g.lat, geoLng: g.lng });
      chrome.runtime.sendMessage(
        { type: "GEO_SET", tabId: tab.id, lat: g.lat, lng: g.lng, geoAuto: false, geoStyle: style },
        (res) => {
          if (res && res.geo) {
            $("geo-coords").textContent = `${res.geo.lat}, ${res.geo.lng}`;
          }
          render();
        }
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
    const style = getGeoStyle();
    const g = pickGeo(getGeoMode(), $("geo-manual").value.trim(), getGeoAnchor(), style);
    chrome.runtime.sendMessage(
      { type: "GEO_SET", tabId: tab.id, lat: g.lat, lng: g.lng, geoAuto: true, geoStyle: style },
      (res) => {
        if (res && res.geo) {
          $("geo-coords").textContent = `${res.geo.lat}, ${res.geo.lng}`;
        }
      }
    );
  }
  chrome.tabs.reload(tab.id);
});

$("btn-bypass-all").addEventListener("click", async () => {
  const allOn = $("ua-toggle").checked && $("js-toggle").checked && $("geo-toggle").checked && (!$("gate-toggle") || $("gate-toggle").checked);
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
