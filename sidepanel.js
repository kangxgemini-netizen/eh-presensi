const $ = (id) => document.getElementById(id);

// Status line writer for .card-sub elements.
// Those elements are OPTIONAL: the UI may not render them (cleaner cards), so
// every write must tolerate a missing node instead of throwing. Several call
// sites assign `.textContent` directly with no guard, which would be a
// TypeError on null the moment the element is absent.
function setCardSub(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

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
              setCardSub("geo-coords", `${res.geo.lat}, ${res.geo.lng}`);
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

// Floating overlay scrollbars with 3s auto-hide
function initAutoHideScrollbars() {
  document.addEventListener("scroll", (e) => {
    const target = e.target;
    if (!target || !target.classList) return;
    target.classList.add("scrollbar-active");
    clearTimeout(target._scrollHideTimer);
    target._scrollHideTimer = setTimeout(() => {
      target.classList.remove("scrollbar-active");
    }, 3000);
  }, true);
}

// Tab navigation with directional cross-slide transitions
function initTabs() {
  const tabs = [
    { btn: "tab-btn-controls",   tab: "tab-controls" },
    { btn: "tab-btn-console",    tab: "tab-console", onShow: loadLogs },
    { btn: "tab-btn-changelog",  tab: "tab-changelog", onShow: renderChangelog },
  ];

  let prevIndex = 0;
  let isTransitioning = false;

  function updateGlider(btnEl) {
    const glider = $("tab-glider");
    if (!glider || !btnEl) return;
    glider.style.width = `${btnEl.offsetWidth}px`;
    glider.style.transform = `translateX(${btnEl.offsetLeft - 3.5}px)`;
  }

  tabs.forEach(({ btn, tab, onShow }, idx) => {
    const btnEl = $(btn);
    if (!btnEl) return;
    btnEl.addEventListener("click", () => {
      if (idx === prevIndex || isTransitioning) return;

      const viewport = $("tab-viewport");
      const currentTabEl = $(tabs[prevIndex].tab);
      const nextTabEl = $(tab);
      const isRight = idx > prevIndex;
      prevIndex = idx;

      // Update tab buttons & glider immediately
      tabs.forEach(t => $(t.btn)?.classList.toggle("active", t.btn === btn));
      updateGlider(btnEl);

      if (!viewport || !currentTabEl || !nextTabEl) {
        tabs.forEach(t => $(t.tab)?.classList.toggle("active", t.tab === tab));
        if (onShow) onShow();
        return;
      }

      isTransitioning = true;

      // Absolute overlay during transition inside viewport
      currentTabEl.style.position = "absolute";
      currentTabEl.style.top = "0";
      currentTabEl.style.left = "0";
      currentTabEl.style.width = "100%";
      currentTabEl.style.height = "100%";
      currentTabEl.style.zIndex = "1";

      nextTabEl.style.position = "absolute";
      nextTabEl.style.top = "0";
      nextTabEl.style.left = "0";
      nextTabEl.style.width = "100%";
      nextTabEl.style.height = "100%";
      nextTabEl.style.zIndex = "2";
      nextTabEl.style.display = "flex";

      // 1. Animate outgoing tab (fade out & drift)
      currentTabEl.animate([
        { opacity: 1, transform: "translateX(0)" },
        { opacity: 0, transform: isRight ? "translateX(-24px)" : "translateX(24px)" }
      ], {
        duration: 180,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards"
      });

      // 2. Animate incoming tab (fade in & slide from opposite side)
      const inAnim = nextTabEl.animate([
        { opacity: 0, transform: isRight ? "translateX(24px)" : "translateX(-24px)" },
        { opacity: 1, transform: "translateX(0)" }
      ], {
        duration: 220,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards"
      });

      inAnim.onfinish = () => {
        currentTabEl.classList.remove("active");
        currentTabEl.style.cssText = "";

        nextTabEl.classList.add("active");
        nextTabEl.style.cssText = "";
        isTransitioning = false;
      };

      if (onShow) onShow();
    });
  });

  // Initial positioning
  setTimeout(() => {
    const activeBtn = document.querySelector(".tab-btn.active") || $("tab-btn-controls");
    if (activeBtn) updateGlider(activeBtn);
  }, 40);
  window.addEventListener("resize", () => {
    const activeBtn = document.querySelector(".tab-btn.active");
    if (activeBtn) updateGlider(activeBtn);
  });
}

// Changelog data and renderer
const CHANGELOG = [
  { ver: "2.9.0", date: "2026-10-04", items: [
    "Design System & UI/UX Consistency Overhaul (UI/UX Pro Max):",
    "• 100% Solid Fill Icons: seluruh icon tombol, tabs, selector, badge, banner, accordion chevron, dan toolbar distandarisasikan ke solid fill vector glyphs tanpa garis stroke tipis.",
    "• Top Navigation Tabs: icon Controls diperbarui menjadi solid gear (cog), Log solid terminal prompt, dan Changelog solid document sheet dengan bobot visual dan ukuran optik identik.",
    "• Secondary Action Buttons: tombol Presensi dan Developer menggunakan Heroicons Solid arrow-top-right-on-square dengan ketebalan stroke-matching yang proporsional.",
    "• Chevron & Accordions: rotasi chevron 180° tersinkronisasi 1:1 dengan ekspansi WAAPI spring physics (cubic-bezier 0.16, 1, 0.3, 1) tanpa snapping.",
    "• Accessible Toggle Switches: kontras track toggle inactive ditingkatkan dengan slate-300 (#cbd5e1) agar memenuhi standar aksesibilitas kontras WCAG AA.",
    "• Code Hygiene (Anti-Slop): pembersihan banner separator ascii berulang, komentar naratif alur, dan label generik di seluruh source code.",
  ]},
  { ver: "2.8.6", date: "2026-10-04", items: [
    "Iconography: standarisasi 100% solid fill vector icons di seluruh antarmuka tombol dan kontrol.",
    "• Device e-Presensi: selector Android kini menggunakan icon solid fill robot head yang presisi dan senada dengan Apple logo.",
    "• Master Action: tombol Bypass All menggunakan solid shield-check icon (dan solid power icon saat Deactivate All); tombol Reload menggunakan solid rotate arrow berbobot tebal.",
    "• Secondary Links: tombol Presensi dan Developer menggunakan solid rounded square glyphs dengan cutout launch arrow.",
  ]},
  { ver: "2.8.5", date: "2026-10-04", items: [
    "Layout: terminal Log (#log-container) kini fill 100% container browser height, membentang penuh antara toolbar dan footer.",
    "• Floating Overlay Scrollbars: scrollbar menggunakan overflow: overlay (mengambang di atas UI), tidak memakan space/lebar layout di sisi kanan dan tidak menggeser padding konten.",
    "• Auto-Hide 3 Detik: scrollbar otomatis menghilang/transparan setelah 3 detik tidak ada aktivitas scroll, dan hanya muncul lembut saat digulir atau di-hover.",
  ]},
  { ver: "2.8.4", date: "2026-10-04", items: [
    "Layout: panel diubah menjadi full-height (fill container browser) dengan flex: 1 dan height 100vh.",
    "• Tab Changelog (.changelog-container) dan Log (.log-container) kini membentang penuh mengisi tinggi jendela Chrome sidepanel tanpa batas max-height atau ruang kosong di bawah.",
    "• Tab Controls, Log, dan Changelog memiliki area scroll independen dengan scrollbar minimalis halus.",
    "• Motion: transisi tab menggunakan crossfade overlay dan directional spring slide (Framer Motion feel) dengan performa 60/120 FPS tanpa layout jump.",
  ]},
  { ver: "2.8.3", date: "2026-10-04", items: [
    "UI: menggabungkan input Target Host dan tombol Test Connection menjadi 1 baris (single row grid).",
    "• Tombol Test Connection disederhanakan menjadi icon button only (pulse icon) dengan tinggi presisi 38px sejajar dengan input.",
    "• Motion: menambahkan container tab-viewport dengan animasi transisi ketinggian mulus (height fluid motion auto-resize) dan crossfade/slide Framer Motion pada pergantian tab.",
  ]},
  { ver: "2.8.2", date: "2026-10-04", items: [
    "UI: menghapus elemen header (.app-header) di bagian paling atas panel.",
    "• Menghilangkan header duplikat di dalam halaman karena Chrome sidepanel sudah memiliki header dan tombol close bawaan.",
    "• Tab bar navigasi (.tab-bar) kini menempati posisi teratas, memberikan lebih banyak ruang vertikal untuk konten kartu.",
  ]},
  { ver: "2.8.1", date: "2026-10-04", items: [
    "Fix: tombol 'Bypass All' / 'Deactivate All' tidak lagi collapse/rusak saat state render di ekstensi asli.",
    "• Penyebab: updateBypassAllButton() menimpa btn.className menjadi 'btn btn-primary', sehingga class 'btn-bypass-master' hilang dan tombol kehilangan flex/height styling.",
    "• Perbaikan: selector CSS diikat langsung ke #btn-bypass-all sehingga kebal terhadap pergantian className apa pun, dan className JS juga tetap mempertahankan btn-bypass-master.",
    "• Motion: menambahkan transisi motion Framer Motion pada pergantian tab dengan floating capsule glider (.tab-glider) dan direction-aware slide physics (.slide-right / .slide-left).",
  ]},
  { ver: "2.8.0", date: "2026-10-04", items: [
    "Redesign Total Modern UI (Apple / Vercel Minimalist Light):",
    "• Zero Border-Line UI: menghapus semua border stroke 1px abu-abu kaku; kedalaman dibangun lewat layered surfaces, background contrast (#F4F6F9 vs #FFFFFF), dan soft diffuse shadows.",
    "• Top App Header: dilengkapi logo gear modern, nama app, subtitle 'Tools & konfigurasi presensi', serta circular close button native macOS.",
    "• Floating Segmented Navigation: tab Controls, Log [0], dan Changelog bergaya capsule pill melayang.",
    "• GPS Location Hero Card: dipindah ke posisi paling atas sebagai controller utama presensi.",
    "• Device e-Presensi Selector: dilengkapi icon Apple (iOS) dan Android bot dengan label bersih tanpa teks kurung.",
    "• Unified Icon System: semua card fitur menggunakan icon container soft blue (#EFF6FF) dengan rich royal blue solid fill icon (#2563EB).",
    "• WAAPI & CSS Spring Motion: transisi accordion halus berbasis Web Animations API, staggered card entrance, dan tactile iOS switch knob stretch saat ditekan.",
    "• Quick Link Actions: tombol eksternal diperbarui menjadi 'Presensi' dan 'Developer' dengan trailing external link arrow.",
  ]},
  { ver: "2.7.1", date: "2026-10-03", items: [
    "Fix: tombol 'Buka Google Maps' benar-benar sejajar dengan kolom koordinat.",
    "• Penyebab: aturan .btn ada DI BELAH .btn-maps di stylesheet dengan specificity sama, jadi margin-top:6px + padding:9px dari .btn menang dan mendorong tombol 6px ke bawah — padahal tinggi keduanya sama-sama 38px.",
    "• Perbaikan: selector jadi .btn.btn-maps (2 class) sehingga menang dari .btn (1 class) apa pun urutan sumber.",
    "• Fix kedua: di panel <=320px, media query sempat mengulang grid-auto-rows:auto sehingga input menyusut ke 17px sementara tombol tetap 38px. Row height kini tetap 38px.",
  ]},
  { ver: "2.7.0", date: "2026-10-03", items: [
    "UI: hapus 4 baris status di bawah deskripsi card (lebih bersih).",
    "• 'blocker: nonaktif', 'off' (WFH v2 Mode), baris koordinat GPS, dan 'manual / off' (Proxy Route) sudah dihapus.",
    "• Deskripsi card dan toggle switch tetap utuh — hanya baris status kecil yang dihapus.",
    "• Semua penulisan status dipusatkan ke setCardSub() yang aman terhadap node yang tidak ada.",
  ]},
  { ver: "2.6.1", date: "2026-10-03", items: [
    "Fix: tinggi kolom koordinat dan tombol 'Buka Google Maps' kini sama persis.",
    "• Input dan tombol diberi tinggi baris eksplisit 38px, jadi keduanya flush di sisi atas dan bawah.",
    "• Font input diperbesar dari 11px ke 13px agar lebih mudah dibaca koordinatnya.",
    "• Ikon centang koordinat valid sekarang di-center vertikal terhadap input yang lebih tinggi (sebelumnya menempel di atas).",
  ]},
  { ver: "2.6.0", date: "2026-10-03", items: [
    "Fitur Baru: tombol CTA 'Buka Google Maps' di samping kolom koordinat manual.",
    "• Kolom Koordinat (lat, lng) kini jadi 2 kolom: input di kiri, tombol 'Buka Google Maps' di kanan.",
    "• Koordinat yang dibuka adalah hasil applyGeoStyle() yang sama persis dengan yang dikirim ke halaman, jadi titik di peta benar-benar sama dengan spoof yang aktif.",
    "• Format koma, tab, dan spasi sama-sama didukung.",
    "• Koordinat tidak valid atau kosong: tombol tidak membuka tab, hanya menampilkan pesan di hint dan menandai input sebagai tidak valid.",
    "• Di panel sangat sempit (<320px) tombol otomatis turun ke bawah agar tidak terpotong.",
  ]},
  { ver: "2.5.1", date: "2026-10-03", items: [
    "UI: Card 'WFH v2 Mode' dipindahkan ke atas card 'GPS Location'.",
    "• WFH v2 Mode kini tampil sebelum GPS Location, jadi toggle mode WFH bisa ditemukan lebih cepat.",
    "• Deskripsi card diperbarui: kini menyebut bahwa request ikut divalidasi ke lokasi rumah terdaftar (bukan kantor), sesuai perilaku v2.5.0.",
  ]},
  { ver: "2.5.0", date: "2026-10-03", items: [
    "Perbaikan WFH: request sekarang divalidasi ke LOKASI RUMAH (bukan kantor):",
    "• Root cause terverifikasi di akun nyata: POST /api/absensi/cek-lokasi (v1) mengembalikan distance_meter 17787 meter dan allowed:false karena membandingkan lokasi user dengan koordinat KANTOR. Endpoint v2 pada koordinat yang sama mengembalikan 0,57 meter dan allowed:true karena memakai titik RUMAH terdaftar.",
    "• Fix: satu rewrite URL pada fetch /api/absensi/cek-lokasi -> /api/absensi/v2/cek-lokasi, hanya di halaman lama dan hanya saat WFH v2 Mode aktif.",
    "• Parser halaman sudah punya (d.absen_token / d.absen_token_expired_at) — field itu hanya dikirim v2, jadi submit ke /api/proxy/addpresensi-ios sekarang ikut membawa token sesi yang valid.",
    "• Endpoint lain (liveness, upload foto, by-enroll, wfh-radius, dev/check, dev/submit) tidak pernah disentuh.",
    "UI: Opsi 'Lokasi Kantor' disembunyikan saat mode WFH atau Manual, karena tidak relevan di kedua mode tersebut (WFH memakai lokasi rumah terdaftar, Manual memakai koordinat pilihan user).",
  ]},
  { ver: "2.4.0", date: "2026-10-03", items: [
    "Fitur Baru: WFH v2 Mode (toggle, default OFF):",
    "• Menyamakan tampilan halaman Presensi Lama dengan aplikasi resmi v1.0.13 saat mode ini dinyalakan.",
    "• Badge marker peta 'K' menjadi 'R', popup 'Lokasi kantor' menjadi 'Lokasi rumah WFH', dan teks 'Jarak ke kantor' menjadi 'Jarak ke rumah'.",
    "• Angka jarak TIDAK diubah — hanya teks labelnya. Koordinat, radius, dan seluruh payload API tetap seperti yang dihitung halaman.",
    "• Hanya berlaku di halaman lama (/cek-lokasi-wfh dan /cek-lokasi-wfa). Halaman /absen-dev/ yang sudah benar dari server tidak pernah disentuh.",
    "• WFO (/cek-lokasi) tidak pernah disentuh — di sana 'K' memang benar.",
    "• Ikut aktif otomatis saat Bypass All dinyalakan.",
    "Catatan: fitur ini sengaja tidak mengubah endpoint API maupun koordinat acuan, agar tidak mungkin memblokir proses absensi.",
  ]},
  { ver: "2.3.1", date: "2026-10-03", items: [
    "Fix Marker 'R' Tidak Muncul (revisi v2.3.0):",
    "• Root Cause: spoof.js didaftarkan dengan world:'MAIN' sehingga chrome.storage TIDAK bisa diakses (hanya tersedia di ISOLATED world). loadGeoCfg() selalu gagal diam-diam sehingga isWfhModeActive() tidak pernah bernilai true.",
    "• Penusan geoMode: background.js kini meneruskan geoMode (wfo/wfh/manual) ke window.__EH_GEO__ lewat readGeoMode() dan buildGeoCfg() pada setiap navigasi/reload.",
    "• Prioritas Konfigurasi: Konfigurasi yang di-inject selalu menang. Fallback berbasis path halaman (/cek-lokasi-wfh, /cek-lokasi-wfa) hanya dipakai selagi background belum menyuntikkan apa pun — tidak pernah menimpa status disabled atau pilihan mode WFO.",
    "• loadGeoCfg tidak lagi menimpa window.__EH_GEO__ yang sudah ada.",
  ]},
  { ver: "2.3.0", date: "2026-10-03", items: [
    "WFH Marker 'R' (Rumah) — Sinkron dengan App Resmi v1.0.13:",
    "• Relabel Marker Peta: Saat mode GPS WFH aktif, marker titik acuan di peta Leaflet otomatis diubah dari 'K' (Kantor) menjadi 'R' (Rumah), dan popup 'Lokasi kantor' menjadi 'Rumah WFH' — mengikuti tampilan di aplikasi resmi Kementerian Desa.",
    "• Gated pada Mode WFH: Relabel hanya berlaku di halaman WFH/WFA. Mode WFO tetap menampilkan 'K' (Kantor) sesuai aslinya.",
    "• Kosmetik murni: Tidak ada koordinat, radius, atau payload API yang diubah.",
    "• Hoisting getGeoCfg: Fungsi getGeoCfg() dipindahkan ke root scope IIFE agar isWfhModeActive() tidak terkena ReferenceError di bawah mode strict.",
  ]},
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

// Console log filtering and rendering
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

// Panel state hydration and event listeners
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
  updateGeoAnchorVisibility(getGeoMode());
  validateAndApplyGeoManual();
  updateProxyStatusLive();

  const gateOn = !!data.gateBlockEnabled;
  if ($("gate-toggle")) $("gate-toggle").checked = gateOn;
  updateGateStatusLive();

  if ($("wfhv2-toggle")) $("wfhv2-toggle").checked = !!data.wfhV2Enabled;
  updateWfhV2Status();

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
    if ($("wfhv2-toggle") && res && res.wfhV2Enabled !== undefined) {
      $("wfhv2-toggle").checked = !!res.wfhV2Enabled;
    }
    updateWfhV2Status();
    if (uaOn) $("ua").value = res.ua;
    if (geoOn) setCardSub("geo-coords", `${res.geo.lat}, ${res.geo.lng}`);

    if (currentProxyUrl) {
      setCardSub("proxy-status", (proxyOn ? "manual (aktif): " : "manual: ") + currentProxyUrl);
    } else {
      setCardSub("proxy-status", "manual / off");
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
    btn.className = "btn btn-deactivate btn-bypass-master";
    label.textContent = "Deactivate All";
    ic.innerHTML = '<path fill-rule="evenodd" d="M12 1.5a.75.75 0 01.75.75V7.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM5.636 4.136a.75.75 0 011.06 0 9 9 0 11-1.06 12.728.75.75 0 111.06-1.06 7.5 7.5 0 10.88-10.608.75.75 0 01-1.06-1.06z" clip-rule="evenodd"/>';
  } else {
    btn.className = "btn btn-primary btn-bypass-master";
    label.textContent = "Bypass All";
    ic.innerHTML = '<path fill-rule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.5 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd"/>';
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

  // WFH v2 Mode ikutan aktif saat Bypass All aktif (default-nya tetap OFF)
  if ($("wfhv2-toggle")) {
    $("wfhv2-toggle").checked = on;
    await chrome.storage.local.set({ wfhV2Enabled: on });
    updateWfhV2Status();
  }

  // Proxy Route murni manual & independen: jangan diubah otomatis oleh Bypass All

  $("ua-toggle").checked = on;
  $("js-toggle").checked = on;
  $("geo-toggle").checked = on;
  render();
}

// Event Listeners
if ($("wfhv2-toggle")) {
  $("wfhv2-toggle").addEventListener("change", async (e) => {
    const on = e.target.checked;
    await chrome.storage.local.set({ wfhV2Enabled: on });
    updateWfhV2Status();
    // Flag ini disuntik ke halaman saat navigasi/reload, jadi reload tab aktif.
    const tab = await currentTab();
    if (tab && /^https?:/.test(tab.url || "")) {
      chrome.runtime.sendMessage({ type: "WFH_V2_SET", tabId: tab.id, enabled: on });
      chrome.tabs.reload(tab.id).catch(() => {});
    }
  });
}

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
          setCardSub("geo-coords", `${res.geo.lat}, ${res.geo.lng}`);
        }
        render();
      }
    );
  } else {
    await chrome.storage.local.set({ geoDisabled: true });
    chrome.runtime.sendMessage({ type: "GEO_CLEAR", tabId: tab.id }, render);
  }
});

// Buka Google Maps pada koordinat yang sedang diketik di kolom manual.
// Memakai parseGeoCoord() yang sama dengan validasi input, lalu applyGeoStyle()
// supaya koordinat yang dibuka persis dengan yang benar-benar dikirim ke halaman
// (untuk iOS, digit trailing longitude ditambahkan).
$("btn-open-maps").addEventListener("click", async () => {
  const hint = $("geo-manual-hint");
  const inputEl = $("geo-manual");
  const btn = $("btn-open-maps");
  const raw = parseGeoCoord($("geo-manual").value.trim());
  const defaultHint = "Format: lat, lng (iOS: 14 digit, Android: 6-7 digit)";

  const flashHint = (msg) => {
    if (hint) hint.textContent = msg;
    inputEl.classList.add("geo-invalid");
    setTimeout(() => {
      if (hint) hint.textContent = defaultHint;
      validateAndApplyGeoManual();
    }, 2600);
  };

  if (!raw) {
    flashHint($("geo-manual").value.trim()
      ? "Koordinat tidak valid — isi dulu format lat, lng."
      : "Isi koordinat dulu untuk membuka Google Maps.");
    inputEl.focus();
    return;
  }

  const style = getGeoStyle();
  const coord = applyGeoStyle(raw, style);

  const url = "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(coord.lat + "," + coord.lng);

  btn.disabled = true;
  try {
    await chrome.tabs.create({ url, active: true });
    if (hint) hint.textContent = "Google Maps dibuka untuk koordinat ini.";
    setTimeout(() => { if (hint) hint.textContent = defaultHint; }, 2600);
  } catch (e) {
    flashHint("Gagal membuka Google Maps.");
  } finally {
    btn.disabled = false;
  }
});

document.querySelectorAll('input[name="geo-mode"]').forEach((r) => r.addEventListener("change", async (e) => {
  const mode = e.target.value;
  $("geo-manual-box").style.display = (mode === "manual") ? "block" : "none";
  updateGeoAnchorVisibility(mode);
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
            setCardSub("geo-coords", `${res.geo.lat}, ${res.geo.lng}`);
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
            setCardSub("geo-coords", `${res.geo.lat}, ${res.geo.lng}`);
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
    setCardSub("proxy-status", "manual: belum diisi");
    return;
  }

  await chrome.storage.local.set({ proxyUrl: url, proxyHost: host, proxyOn: true, proxyScope: scope });
  chrome.runtime.sendMessage({ type: "PROXY_SET", proxyUrl: url, targetHost: host, scope }, (res) => {
    if (res && res.ok) {
      setCardSub("proxy-status", `manual: ${res.proxy.scheme} ${res.proxy.host}:${res.proxy.port}`);
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
  const on = $("gate-toggle") ? $("gate-toggle").checked : false;
  setCardSub("gate-status", on ? "blocker: aktif" : "blocker: nonaktif");
}

// Anchor Kantor hanya relevan untuk mode WFO.
// WFH: titik acuan diambil otomatis dari lokasi rumah yang sudah didaftarkan
//      oleh user (/api/pegawai/by-enroll -> latitude_wfh/longitude_wfh).
// Manual: user sendiri yang menentukan koordinat.
function updateGeoAnchorVisibility(mode) {
  const box = $("geo-anchor-box");
  if (!box) return;
  const show = mode === "wfo";
  box.style.display = show ? "block" : "none";
  // Fieldset memakai display:block; pastikan legend/isi ikut tersembunyi.
  const kids = box.querySelectorAll(".radio-group, label, input");
  for (let i = 0; i < kids.length; i++) {
    kids[i].style.display = show ? "" : "none";
  }
}
// Real-time status text untuk WFH v2 Mode
function updateWfhV2Status() {
  const on = $("wfhv2-toggle") ? $("wfhv2-toggle").checked : false;
  setCardSub("wfhv2-status", on ? "aktif — marker R di Presensi Lama" : "off");
}

function updateProxyStatusLive() {
  const scope = getProxyScope();
  let url = $("proxy-url") ? $("proxy-url").value.trim() : "";
  const host = $("proxy-host") ? $("proxy-host").value.trim() : "";
  const on = $("proxy-toggle") ? $("proxy-toggle").checked : false;

  if (!url) {
    setCardSub("proxy-status", on ? "aktif: url kosong" : "manual / off");
    return;
  }

  const scopeText = (scope === "target" && host) ? ` → hanya ${host}` : " → semua trafik";
  setCardSub("proxy-status", (on ? "manual (aktif): " : "manual: ") + url + scopeText);
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
          setCardSub("geo-coords", `${res.geo.lat}, ${res.geo.lng}`);
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
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "LOG_EVENT") {
      // Real-time checklist di-handle oleh timed animation loop (bukan log), biar muncul satu per satu 3s.
      loadLogs();
    }
  });
}

// GitHub Releases update checker
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
  initAutoHideScrollbars();
  initTabs();
  initConsoleToolbar();
  initOTA();
  load();
});
