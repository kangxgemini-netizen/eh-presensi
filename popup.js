const $ = (id) => document.getElementById(id);

const DEFAULT_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1";

const DEFAULT_GEO = { lat: -6.342815480424971, lng: 106.85912331859917 };

// Curated coordinate list (Jakarta Selatan area)
const GEO_LIST = [
  { lat: -6.342859793757447, lng: 106.8584411757446 },
  { lat: -6.3430865975928175, lng: 106.85865336213146 },
  { lat: -6.342714560215695, lng: 106.85909575106356 },
  { lat: -6.342412155378162, lng: 106.85910575983117 },
  { lat: -6.343136335336069, lng: 106.85912177398495 },
  { lat: -6.34262304293404, lng: 106.85924788465934 },
  { lat: -6.3431243982643, lng: 106.8587954870963 },
  { lat: -6.342921468705353, lng: 106.85881750657332 },
  { lat: -6.342648906452595, lng: 106.85933996554688 },
  { lat: -6.3426270218940655, lng: 106.85876145747328 },
  { lat: -6.342953300583038, lng: 106.85848921789372 },
  { lat: -6.343194030932461, lng: 106.85866937610828 },
  { lat: -6.342690686122719, lng: 106.8592278670988 },
  { lat: -6.3424300608665405, lng: 106.85882351203867 },
  { lat: -6.3424300608665405, lng: 106.85882351203867 },
];

function parseGeoCoord(str) {
  if (!str) return null;
  // accepts "lat, lng" or "lat,lng" (comma + optional space)
  const m = String(str).split(",");
  if (m.length < 2) return null;
  const lat = parseFloat(m[0].trim());
  const lng = parseFloat(m[1].trim());
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}

function pickGeo(mode, manualCoord) {
  if (mode === "manual") {
    const c = parseGeoCoord(manualCoord);
    if (c) return c;
  }
  return GEO_LIST[Math.floor(Math.random() * GEO_LIST.length)];
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

async function load() {
  const data = await chrome.storage.local.get(["pattern", "mode", "js", "ua", "proxyUrl", "proxyHost", "proxyOn", "geoMode", "geoManual"]);
  $("pattern").value = data.pattern || DEFAULT_PATTERN;
  $("ua").value = data.ua || DEFAULT_UA;
  $("proxy-url").value = data.proxyUrl || "";
  $("proxy-host").value = data.proxyHost || "";
  $("geo-mode").value = data.geoMode || "auto";
  $("geo-manual").value = data.geoManual || "";
  $("geo-manual-box").style.display = ($("geo-mode").value === "manual") ? "block" : "none";


  const tab = await currentTab();
  if (!tab) return;

  chrome.runtime.sendMessage({ type: "STATUS", tabId: tab.id }, (res) => {
    const jsOn = !!(res && res.js);
    const uaOn = !!(res && res.ua);
    const geoOn = !!(res && res.geo);
    const proxyOn = !!(res && res.proxy) || !!data.proxyOn;
    $("js-toggle").checked = jsOn;
    $("ua-toggle").checked = uaOn;
    $("geo-toggle").checked = geoOn;
    $("proxy-toggle").checked = proxyOn;
    if (uaOn) $("ua").value = res.ua;
    if (geoOn) $("geo-coords").textContent = `${res.geo.lat.toFixed(6)}, ${res.geo.lng.toFixed(6)}`;
    render();
  });
}

function render() {
  const js = $("js-toggle").checked;
  const ua = $("ua-toggle").checked;
  const geo = $("geo-toggle").checked;
  const proxy = $("proxy-toggle").checked;
  const card = $("status-card");
  const title = $("status-title");
  const badge = $("status-badge");
  const count = [js, ua, geo, proxy].filter(Boolean).length;

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

  // UA
  if (on) {
    const ua = $("ua").value.trim() || DEFAULT_UA;
    await chrome.storage.local.set({ ua });
    chrome.runtime.sendMessage({ type: "UA_SET", tabId: tab.id, ua });
  } else {
    chrome.runtime.sendMessage({ type: "UA_CLEAR", tabId: tab.id });
  }

  // JS guard patch
  if (on) {
    const rule = { urlPattern: $("pattern").value.trim() || DEFAULT_PATTERN, mode: DEFAULT_MODE, replacement: DEFAULT_PATCH_JS };
    await chrome.storage.local.set({ pattern: rule.urlPattern, mode: rule.mode, js: rule.replacement });
    chrome.runtime.sendMessage({ type: "JS_ENABLE", tabId: tab.id, rule });
  } else {
    chrome.runtime.sendMessage({ type: "JS_DISABLE", tabId: tab.id });
  }

  // GPS
  if (on) {
    const mode = $("geo-mode").value;
    const g = pickGeo(mode, $("geo-manual").value.trim());
    const geoAuto = (mode === "auto");
    chrome.runtime.sendMessage({ type: "GEO_SET", tabId: tab.id, lat: g.lat, lng: g.lng, geoAuto });
  } else {
    chrome.runtime.sendMessage({ type: "GEO_CLEAR", tabId: tab.id });
  }

  // Proxy (only if url configured)
  if (on) {
    const url = $("proxy-url").value.trim();
    if (url) {
      const host = $("proxy-host").value.trim();
      await chrome.storage.local.set({ proxyUrl: url, proxyHost: host, proxyOn: true });
      chrome.runtime.sendMessage({ type: "PROXY_SET", proxyUrl: url, targetHost: host });
    }
  } else {
    await chrome.storage.local.set({ proxyOn: false });
    chrome.runtime.sendMessage({ type: "PROXY_CLEAR" });
  }

  // sync UI checkboxes
  $("ua-toggle").checked = on;
  $("js-toggle").checked = on;
  $("geo-toggle").checked = on;
  $("proxy-toggle").checked = on && !!$("proxy-url").value.trim();
  render();
}

// Event Listeners
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

// Geolocation toggle
$("geo-toggle").addEventListener("change", async (e) => {
  const tab = await currentTab();
  if (!tab) return;
  if (e.target.checked) {
    const mode = $("geo-mode").value;
    const g = pickGeo(mode, $("geo-manual").value.trim());
    const geoAuto = (mode === "auto");
    chrome.runtime.sendMessage(
      { type: "GEO_SET", tabId: tab.id, lat: g.lat, lng: g.lng, geoAuto },
      (res) => {
        if (res && res.geo) {
          $("geo-coords").textContent = `${res.geo.lat.toFixed(6)}, ${res.geo.lng.toFixed(6)}`;
        }
        render();
      }
    );
  } else {
    chrome.runtime.sendMessage({ type: "GEO_CLEAR", tabId: tab.id }, render);
  }
});

// Geo mode selector (show/hide manual inputs)
$("geo-mode").addEventListener("change", (e) => {
  $("geo-manual-box").style.display = (e.target.value === "manual") ? "block" : "none";
  chrome.storage.local.set({ geoMode: e.target.value });
});
$("geo-manual").addEventListener("input", () => chrome.storage.local.set({ geoManual: $("geo-manual").value.trim() }));

// Proxy toggle
async function applyProxyIfOn() {
  if (!$("proxy-toggle").checked) return;
  let url = $("proxy-url").value.trim();
  if (!url) return;
  const host = $("proxy-host").value.trim();
  await chrome.storage.local.set({ proxyUrl: url, proxyHost: host, proxyOn: true });
  chrome.runtime.sendMessage({ type: "PROXY_SET", proxyUrl: url, targetHost: host }, render);
}

$("proxy-toggle").addEventListener("change", async (e) => {
  if (e.target.checked) {
    await applyProxyIfOn();
  } else {
    await chrome.storage.local.set({ proxyOn: false });
    chrome.runtime.sendMessage({ type: "PROXY_CLEAR" }, render);
  }
});

$("proxy-url").addEventListener("input", applyProxyIfOn);
$("proxy-host").addEventListener("input", applyProxyIfOn);

// Quick Reload Target Tab (also re-randomizes GPS if auto mode)
$("btn-reload").addEventListener("click", async () => {
  const tab = await currentTab();
  if (!tab || !tab.id) return;
  if ($("geo-toggle").checked && $("geo-mode").value === "auto") {
    const g = pickGeo("auto");
    chrome.runtime.sendMessage(
      { type: "GEO_SET", tabId: tab.id, lat: g.lat, lng: g.lng, geoAuto: true },
      (res) => {
        if (res && res.geo) {
          $("geo-coords").textContent = `${res.geo.lat.toFixed(6)}, ${res.geo.lng.toFixed(6)}`;
        }
      }
    );
  }
  chrome.tabs.reload(tab.id);
});

// Master Bypass All
$("btn-bypass-all").addEventListener("click", async () => {
  const allOn = $("ua-toggle").checked && $("js-toggle").checked && $("geo-toggle").checked;
  await applyAll(!allOn);
  // after apply, reflect button state
  const btn = $("btn-bypass-all");
  const nowAll = $("ua-toggle").checked && $("js-toggle").checked && $("geo-toggle").checked;
  btn.classList.toggle("off", !nowAll);
});

load();
