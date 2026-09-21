// background.js — MV3 service worker
//
// Capabilities on the active tab via CDP (chrome.debugger):
//   1. JS response body interception/modification (Fetch, Response stage)
//   2. User-Agent override to iOS iPhone (Emulation.setUserAgentOverride)
//   3. Strong device spoof via a MAIN-world content script (spoof.js)
//   4. Geolocation override (Emulation.setGeolocationOverride) — re-applied on reload

const tabs = new Map();                 // tabId -> { js, ua, geo, geoAuto, proxy }
const attached = new Set();             // tabIds currently attached to debugger
const spoofTabs = new Set();            // tabIds with active MAIN-world spoof script

// Enable the side panel to open when the toolbar icon is clicked
try {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
} catch (_) {}

// ---------- logging engine ----------
async function addLog(category, message, level = "info") {
  const now = new Date();
  const timestamp = now.toTimeString().split(" ")[0]; // HH:MM:SS
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp,
    category: category.toUpperCase(),
    level,
    message
  };

  try {
    const data = await chrome.storage.local.get(["logHistory"]);
    const list = Array.isArray(data.logHistory) ? data.logHistory : [];
    list.push(entry);
    if (list.length > 100) list.shift(); // keep max 100 entries
    await chrome.storage.local.set({ logHistory: list });
    chrome.runtime.sendMessage({ action: "LOG_EVENT", log: entry }).catch(() => {});
  } catch (_) {}
}

addLog("STATE", "eh-Presensi background initialized");

// Clean up any stale or cached registered content scripts on startup
(async () => {
  try {
    const scripts = await chrome.scripting.getRegisteredContentScripts();
    const staleIds = scripts.map((s) => s.id);
    if (staleIds.length > 0) {
      await chrome.scripting.unregisterContentScripts({ ids: staleIds });
      addLog("STATE", `Purged ${staleIds.length} content script registrations on startup`);
    }
  } catch (_) {}
  try {
    await chrome.storage.local.remove(["vbgEnabled", "vbgMode", "vbgPreset", "vbgCustomImg"]);
  } catch (_) {}
})();

// Curated 50 preset coordinates within 60m diameter (30m radius) of -6.343295, 106.858673
const GEO_LIST = [
  { lat: -6.3432612, lng: 106.8588874 },
  { lat: -6.3431555, lng: 106.8586968 },
  { lat: -6.3435024, lng: 106.8585695 },
  { lat: -6.3431626, lng: 106.8588921 },
  { lat: -6.3432624, lng: 106.8588462 },
  { lat: -6.3432992, lng: 106.8585461 },
  { lat: -6.3432533, lng: 106.858687 },
  { lat: -6.3433556, lng: 106.8584628 },
  { lat: -6.3433624, lng: 106.8585651 },
  { lat: -6.3432851, lng: 106.858917 },
  { lat: -6.3435244, lng: 106.858595 },
  { lat: -6.3431646, lng: 106.8587616 },
  { lat: -6.3430692, lng: 106.8585355 },
  { lat: -6.3432481, lng: 106.8587409 },
  { lat: -6.3434457, lng: 106.8584743 },
  { lat: -6.3435354, lng: 106.858642 },
  { lat: -6.3433282, lng: 106.858869 },
  { lat: -6.3433483, lng: 106.8585148 },
  { lat: -6.3434615, lng: 106.8584912 },
  { lat: -6.343412, lng: 106.8584502 },
  { lat: -6.3432307, lng: 106.8588915 },
  { lat: -6.3431701, lng: 106.8586413 },
  { lat: -6.3432192, lng: 106.8586813 },
  { lat: -6.3432106, lng: 106.8586579 },
  { lat: -6.3431335, lng: 106.85853 },
  { lat: -6.3431361, lng: 106.8587146 },
  { lat: -6.343349, lng: 106.8588023 },
  { lat: -6.3434325, lng: 106.8585039 },
  { lat: -6.3434057, lng: 106.8586583 },
  { lat: -6.3432201, lng: 106.8585933 },
  { lat: -6.3435018, lng: 106.8585009 },
  { lat: -6.3434796, lng: 106.8585921 },
  { lat: -6.3435394, lng: 106.8587135 },
  { lat: -6.3432691, lng: 106.8588003 },
  { lat: -6.3431444, lng: 106.858656 },
  { lat: -6.3433385, lng: 106.8587898 },
  { lat: -6.343063, lng: 106.8585725 },
  { lat: -6.3431618, lng: 106.8584988 },
  { lat: -6.343229, lng: 106.858422 },
  { lat: -6.3431562, lng: 106.858676 },
  { lat: -6.3430935, lng: 106.8586567 },
  { lat: -6.3434185, lng: 106.8588392 },
  { lat: -6.3431277, lng: 106.8587059 },
  { lat: -6.3433111, lng: 106.8584024 },
  { lat: -6.3432713, lng: 106.8587513 },
  { lat: -6.3433591, lng: 106.8586104 },
  { lat: -6.3431822, lng: 106.8584597 },
  { lat: -6.343249, lng: 106.8586226 },
  { lat: -6.343344, lng: 106.8584066 },
  { lat: -6.343499, lng: 106.8588445 }
];

function pickGeo(mode, manualLat, manualLng) {
  if (mode === "manual" && manualLat != null && manualLng != null) {
    const lat = parseFloat(manualLat), lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) return { lat: Number(lat.toFixed(7)), lng: Number(lng.toFixed(7)) };
  }
  const item = GEO_LIST[Math.floor(Math.random() * GEO_LIST.length)];
  return { lat: Number(item.lat.toFixed(7)), lng: Number(item.lng.toFixed(7)) };
}

chrome.debugger.onEvent.addListener((debuggeeId, method, params) => {
  onDebugEvent(debuggeeId, method, params).catch(() => {});
});
chrome.debugger.onDetach.addListener((source) => {
  if (source && source.tabId) attached.delete(source.tabId);
});
chrome.tabs.onRemoved.addListener((tabId) => { spoofOff(tabId); maybeDetachTab(tabId); });
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (spoofTabs.has(tabId) && info.url) registerSpoofOnce(tabId, info.url);
  // Re-inject gate block and geo config on every navigation/reload
  if (info.status === "loading") {
    const t = await getTab(tabId);
    if (!t) return;

    // 1. Sync Gate Block state into page context
    const gateOn = (t.gateBlockEnabled !== undefined) ? !!t.gateBlockEnabled : true;
    try {
      chrome.scripting.executeScript({
        target: { tabId },
        world: "MAIN",
        func: (on) => {
          window.__EH_GATE_BLOCK__ = on;
          try {
            if (typeof localStorage !== "undefined") {
              localStorage.setItem("__EH_GATE_BLOCK__", on ? "1" : "0");
            }
          } catch (_) {}
          if (on && typeof window.__EH_APPLY_GATE_BLOCK__ === "function") {
            window.__EH_APPLY_GATE_BLOCK__();
          } else if (!on && typeof window.__EH_REMOVE_GATE_BLOCK__ === "function") {
            window.__EH_REMOVE_GATE_BLOCK__();
          }
        },
        args: [gateOn],
        injectImmediately: true,
      }).catch(() => {});
    } catch (_) {}

    // 2. Sync Geolocation config
    if (t.geoEnabled) {
      if (t.geoAuto) {
        const g = pickGeo("auto");
        t.geo = g;
      }
      try {
        const cfg = { mode: t.geoAuto ? "auto" : "manual", lat: t.geo.lat, lng: t.geo.lng };
        chrome.scripting.executeScript({
          target: { tabId },
          world: "MAIN",
          func: (c) => { window.__EH_GEO__ = c; },
          args: [cfg],
          injectImmediately: true,
        }).catch(() => {});
      } catch (_) {}
      geoApply(tabId, t.geo).catch(() => {});
    } else if (t.geoEnabled === false && t.geo === null) {
      // Geo explicitly disabled: make sure the page sees disabled state
      try {
        chrome.scripting.executeScript({
          target: { tabId },
          world: "MAIN",
          func: () => { window.__EH_GEO__ = { mode: "off", disabled: true }; },
          injectImmediately: true,
        }).catch(() => {});
      } catch (_) {}
    }
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "JS_ENABLE")  { jsEnable(msg.tabId, msg.rule).then(sendResponse).catch(() => sendResponse({ ok: false, error: "jsEnable failed" })); return true; }
  if (msg.type === "JS_DISABLE") { jsDisable(msg.tabId).then(sendResponse).catch(() => sendResponse({ ok: false, error: "jsDisable failed" })); return true; }
  if (msg.type === "UA_SET")     { uaSet(msg.tabId, msg.ua).then(sendResponse).catch(() => sendResponse({ ok: false, error: "uaSet failed" })); return true; }
  if (msg.type === "UA_CLEAR")   { uaClear(msg.tabId).then(sendResponse).catch(() => sendResponse({ ok: false, error: "uaClear failed" })); return true; }
  if (msg.type === "STATUS")     { sendResponse(status(msg.tabId));                  return false; }
  if (msg.type === "GEO_SET")    { geoSet(msg.tabId, msg.lat, msg.lng, msg.geoAuto, msg.geoStyle).then(sendResponse).catch(() => sendResponse({ ok: false, error: "geoSet failed" })); return true; }
  if (msg.type === "GEO_CLEAR")  { geoClear(msg.tabId).then(sendResponse).catch(() => sendResponse({ ok: false, error: "geoClear failed" })); return true; }
  if (msg.type === "PROXY_SET")  { proxySet(msg.proxyUrl, msg.targetHost, msg.scope).then(sendResponse).catch(() => sendResponse({ ok: false, error: "proxySet failed" })); return true; }
  if (msg.type === "PROXY_TEST") { proxyTest(msg.proxyUrl).then(sendResponse).catch((e) => sendResponse({ ok: false, error: "proxyTest failed: " + e.message })); return true; }
  if (msg.type === "PROXY_CLEAR"){ proxyClear().then(sendResponse).catch(() => sendResponse({ ok: false, error: "proxyClear failed" })); return true; }
  if (msg.type === "GATE_BLOCK_SET") { gateBlockSet(msg.tabId, msg.enabled).then(sendResponse).catch(() => sendResponse({ ok: false, error: "gateBlockSet failed" })); return true; }
  if (msg.action === "INJECT_LOG") { addLog(msg.cat || "INJECT", msg.msg); return false; }
});

// ---------- MV3 keep-alive ----------
// Service worker disuspensi saat idle -> sidepanel sendMessage race (port closed).
// Alarm bangunkan SW tiap 20 detik saat extension aktif dipakai.
chrome.alarms.create("keepalive", { periodInMinutes: 0.3 });
chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === "keepalive") {
    // no-op, cukup bangunkan SW
  }
});

// ---------- helpers ----------
function isHttpUrl(url) {
  return /^https?:/.test(url || "");
}

async function safeGetTab(tabId) {
  try {
    return await chrome.tabs.get(tabId);
  } catch (_) {
    return null;
  }
}

// ---------- state ----------
function status(tabId) {
  const t = tabs.get(tabId) || {};
  return {
    js: !!t.js,
    ua: t.ua || null,
    geo: t.geo || null,
    proxy: t.proxy || null,
    geoEnabled: !!t.geoEnabled,
    gateBlockEnabled: !!t.gateBlockEnabled
  };
}

async function getTab(tabId) {
  let t = tabs.get(tabId);
  if (!t) {
    let gateSaved = false;
    try {
      const d = await chrome.storage.local.get("gateBlockEnabled");
      gateSaved = !!d.gateBlockEnabled;
    } catch (_) {}
    t = {
      js: null,
      ua: null,
      geo: null,
      geoAuto: false,
      geoEnabled: false,
      proxy: null,
      gateBlockEnabled: gateSaved
    };
    tabs.set(tabId, t);
  }
  return t;
}

// ---------- Gatekeeper modal blocker ----------
async function gateBlockSet(tabId, enabled) {
  const t = await getTab(tabId);
  t.gateBlockEnabled = !!enabled;
  await chrome.storage.local.set({ gateBlockEnabled: !!enabled });
  addLog("GATE", `Block iOS Update ${enabled ? "armed / ON" : "disabled / OFF"}`);

  const tab = await safeGetTab(tabId);
  if (tab && isHttpUrl(tab.url)) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        world: "MAIN",
        func: (on) => {
          window.__EH_GATE_BLOCK__ = on;
          try {
            if (typeof localStorage !== "undefined") {
              localStorage.setItem("__EH_GATE_BLOCK__", on ? "1" : "0");
            }
          } catch (_) {}
          if (on) {
            if (typeof window.__EH_APPLY_GATE_BLOCK__ === "function") {
              window.__EH_APPLY_GATE_BLOCK__();
            } else {
              // Standalone fallback if spoof.js not loaded yet
              try {
                var sId = "__eh_gate_block_style__";
                var style = document.getElementById(sId);
                if (!style) {
                  style = document.createElement("style");
                  style.id = sId;
                  style.textContent = [
                    ".swal2-container:has(.ios-appstore-gate-popup),",
                    ".swal2-container:has(.ios-appstore-gate-wrap),",
                    ".swal2-container:has(a[href*='id6800222797']),",
                    ".swal2-container:has(a[href*='epresensi-kemendespdt']),",
                    ".ios-appstore-gate-popup,",
                    ".ios-appstore-gate-wrap {",
                    "  display: none !important;",
                    "  opacity: 0 !important;",
                    "  visibility: hidden !important;",
                    "  pointer-events: none !important;",
                    "  z-index: -999999 !important;",
                    "}"
                  ].join("\n");
                  (document.head || document.documentElement).appendChild(style);
                }
                var candidates = document.querySelectorAll(".ios-appstore-gate-popup, .ios-appstore-gate-wrap, a[href*='id6800222797'], a[href*='epresensi-kemendespdt']");
                var purged = false;
                for (var i = 0; i < candidates.length; i++) {
                  var el = candidates[i];
                  var container = (el.closest && el.closest(".swal2-container")) || el;
                  if (container && container.parentNode) {
                    container.parentNode.removeChild(container);
                    purged = true;
                  }
                }
                var swals = document.querySelectorAll(".swal2-container");
                for (var j = 0; j < swals.length; j++) {
                  var s = swals[j];
                  var title = s.querySelector && s.querySelector("#swal2-title");
                  var htmlCont = s.querySelector && s.querySelector("#swal2-html-container");
                  var fullText = (title ? title.textContent : "") + " " + (htmlCont ? htmlCont.textContent : "");
                  if (
                    fullText.indexOf("Versi Web Sudah Tidak Digunakan") !== -1 ||
                    fullText.indexOf("Akses ePresensi KemendesPDT") !== -1 ||
                    fullText.indexOf("id6800222797") !== -1
                  ) {
                    if (s.parentNode) {
                      s.parentNode.removeChild(s);
                      purged = true;
                    }
                  }
                }
                if (purged) {
                  try {
                    if (typeof window.Swal !== "undefined" && typeof window.Swal.close === "function") {
                      window.Swal.close();
                    }
                  } catch (_) {}
                  var remaining = document.querySelectorAll(".swal2-container");
                  if (!remaining.length) {
                    document.documentElement.classList.remove("swal2-shown", "swal2-height-auto");
                    document.documentElement.style.overflow = "";
                    if (document.body) {
                      document.body.classList.remove("swal2-shown", "swal2-height-auto");
                      document.body.style.overflow = "";
                      document.body.style.paddingRight = "";
                    }
                  }
                }
              } catch (_) {}
            }
          } else {
            if (typeof window.__EH_REMOVE_GATE_BLOCK__ === "function") {
              window.__EH_REMOVE_GATE_BLOCK__();
            } else {
              var s = document.getElementById("__eh_gate_block_style__");
              if (s) s.remove();
            }
          }
        },
        args: [!!enabled]
      });
    } catch (_) {}
  }
  return { ok: true, gateBlockEnabled: !!enabled };
}

// ---------- debugger attach ----------
async function attach(tabId) {
  if (attached.has(tabId)) return;

  const tab = await safeGetTab(tabId);
  if (!tab || !isHttpUrl(tab.url)) {
    throw new Error("tab not attachable (non-http or closed)");
  }

  try {
    await chrome.debugger.attach({ tabId }, "1.3");
  } catch (e) {
    if (/already attached|cannot be attached/i.test(e.message)) {
      attached.add(tabId);
      return;
    }
    throw e;
  }

  attached.add(tabId);
  await chrome.debugger.sendCommand({ tabId }, "Network.enable", {}).catch(() => {});
  await chrome.debugger.sendCommand({ tabId }, "Emulation.enable", {}).catch(() => {});
}

async function maybeDetachTab(tabId) {
  const t = tabs.get(tabId);
  if (t && !t.js && !t.ua && !t.geo && attached.has(tabId)) {
    try { await chrome.debugger.detach({ tabId }); } catch (_) {}
    attached.delete(tabId);
  }
}

// ---------- Geolocation override ----------
// IMPORTANT: geolocation is fully handled by spoof.js (MAIN-world content script)
// which intercepts getCurrentPosition/watchPosition. We must NOT also set a CDP
// Emulation.setGeolocationOverride, because Google Maps prioritizes the CDP
// override over the JS Geolocation API — that would freeze the coordinate and
// ignore our per-reload randomization. So geoApply only ensures the debugger
// state is clean (no CDP override) so the JS path wins.
async function geoApply(tabId, g) {
  try {
    if (attached.has(tabId)) {
      await chrome.debugger.sendCommand(
        { tabId }, "Emulation.clearGeolocationOverride", {}
      ).catch(() => {});
    }
  } catch (_) {
    // ignore
  }
}

async function geoSet(tabId, lat, lng, geoAuto, geoStyle) {
  const t = await getTab(tabId);
  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);
  if (isNaN(numLat) || isNaN(numLng)) return { ok: false, error: "Invalid coordinates" };
  t.geo = { lat: numLat, lng: numLng };
  t.geoAuto = !!geoAuto;
  t.geoEnabled = true;
  t.geoStyle = geoStyle || "ios";
  await chrome.storage.local.set({ geoDisabled: false, geoLat: numLat, geoLng: numLng, geoStyle: t.geoStyle });
  addLog("GEO", `Geo Location set (${geoAuto ? "Auto" : "Manual"} [${t.geoStyle.toUpperCase()}]: ${numLat}, ${numLng})`);
  // Make sure the MAIN-world spoof script is registered (geo works without UA spoof)
  const tab = await safeGetTab(tabId);
  if (tab && isHttpUrl(tab.url)) {
    await registerSpoofOnce(tabId, tab.url);
  }
  await geoApply(tabId, t.geo);
  // reload once so the spoof takes effect on the current page
  if (tab && isHttpUrl(tab.url)) chrome.tabs.reload(tabId).catch(() => {});
  return { ok: true, geo: t.geo };
}

async function geoClear(tabId) {
  const t = await getTab(tabId);
  t.geo = null;
  t.geoAuto = false;
  t.geoEnabled = false;
  await chrome.storage.local.set({ geoDisabled: true });
  addLog("GEO", "Geo Spoof cleared (disabled)");

  // Inject disabled state into MAIN world
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      func: () => { window.__EH_GEO__ = { mode: "off", disabled: true }; },
      injectImmediately: true,
    }).catch(() => {});
  } catch (_) {}

  if (attached.has(tabId)) {
    await chrome.debugger.sendCommand({ tabId }, "Emulation.clearGeolocationOverride", {}).catch(() => {});
  }
  await maybeDetachTab(tabId);

  const tab = await safeGetTab(tabId);
  if (tab && isHttpUrl(tab.url)) chrome.tabs.reload(tabId).catch(() => {});

  return { ok: true };
}

// ---------- JS intercept ----------
async function jsEnable(tabId, rule) {
  const t = await getTab(tabId);
  t.js = rule;
  await attach(tabId);
  await chrome.debugger.sendCommand({ tabId }, "Fetch.enable", {
    patterns: [{ urlPattern: rule.urlPattern, resourceType: "Script", requestStage: "Response" }],
    handleAuthRequests: true,
  });
  addLog("PATCH", `security-guard.js bypass armed — JS prepend active on ${rule.urlPattern}`);
  return { ok: true };
}

async function jsDisable(tabId) {
  const t = await getTab(tabId);
  t.js = null;
  if (attached.has(tabId)) {
    await chrome.debugger.sendCommand({ tabId }, "Fetch.disable", {}).catch(() => {});
  }
  await maybeDetachTab(tabId);
  return { ok: true };
}

// ---------- UA override + strong spoof ----------
async function uaSet(tabId, ua) {
  const t = await getTab(tabId);
  t.ua = ua;
  addLog("UA", `UA Spoof set to ${ua}`);
  addLog("UA", "iOS Safari fingerprint active — navigator/vendor/screen/touch patched, Chromium signals removed");
  await attach(tabId);
  await chrome.debugger
    .sendCommand({ tabId }, "Emulation.setUserAgentOverride", { userAgent: ua, platform: "iPhone" })
    .catch(async () => {
      await chrome.debugger.sendCommand({ tabId }, "Network.setUserAgentOverride", { userAgent: ua });
    });

  // Strip Client Hints (sec-ch-ua*) so server falls back to spoofed UA, not Chromium brand.
  await applyClientHintsStrip();

  const tab = await safeGetTab(tabId);
  if (tab && isHttpUrl(tab.url)) {
    await spoofOn(tabId, tab.url);
    chrome.tabs.reload(tabId).catch(() => {});
  }
  return { ok: true };
}

async function uaClear(tabId) {
  const t = await getTab(tabId);
  t.ua = null;
  addLog("UA", "UA Spoof cleared");
  if (attached.has(tabId)) {
    await chrome.debugger
      .sendCommand({ tabId }, "Emulation.setUserAgentOverride", { userAgent: "" })
      .catch(() => {});
  }
  await spoofOff(tabId);
  await removeClientHintsStrip();
  await maybeDetachTab(tabId);
  return { ok: true };
}

// ---------- Client Hints stripping (DNR) ----------
// Chrome generates sec-ch-ua* from its own binary and sends them as request headers.
// Spoofing navigator.userAgent is NOT enough — these headers still reveal "Chromium".
// Remove them via declarativeNetRequest so the server falls back to the spoofed UA.
const CH_RULE_ID = 9001;
const CH_HEADERS = [
  "sec-ch-ua", "sec-ch-ua-mobile", "sec-ch-ua-platform",
  "sec-ch-ua-arch", "sec-ch-ua-full-version", "sec-ch-ua-platform-version",
  "sec-ch-ua-model", "sec-ch-ua-bitness", "sec-ch-ua-wow64",
];
async function applyClientHintsStrip() {
  try {
    const rules = [{
      id: CH_RULE_ID,
      priority: 1,
      action: {
        type: "modifyHeaders",
        requestHeaders: CH_HEADERS.map((h) => ({ header: h, operation: "remove" })),
      },
      condition: { resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest", "script", "stylesheet", "image", "font", "other"] },
    }];
    await chrome.declarativeNetRequest.updateDynamicRules({ addRules: rules, removeRuleIds: [CH_RULE_ID] });
    addLog("UA", "Client Hints (sec-ch-ua*) stripped from outgoing requests");
  } catch (e) {
    addLog("UA", "CH strip failed: " + e.message);
  }
}
async function removeClientHintsStrip() {
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [CH_RULE_ID] });
  } catch (_) {}
}

// MAIN-world content script: patches navigator/screen/touch at document_start.
// Registered once per host; do NOT unregister/register on every reload (that races
// and drops the script). We only update window.__EH_GEO__ via onUpdated.
async function registerSpoofOnce(tabId, url) {
  let matches = [];
  try {
    const u = new URL(url);
    if (/^https?:$/.test(u.protocol)) matches = [`*://${u.host}/*`];
  } catch (_) {}
  if (!matches.length) return;

  const scriptId = `spoof-${tabId}`;
  const currentMatch = matches[0];
  let existing = [];
  try {
    existing = await chrome.scripting.getRegisteredContentScripts({ ids: [scriptId] });
  } catch (_) {}

  const ready = existing.length > 0 &&
    Array.isArray(existing[0].matches) && existing[0].matches.includes(currentMatch) &&
    Array.isArray(existing[0].js) && existing[0].js.includes("spoof.js");

  if (existing.length > 0 && !ready) {
    try { await chrome.scripting.unregisterContentScripts({ ids: [scriptId] }); } catch (_) {}
  }
  if (!ready) {
    try {
      await chrome.scripting.registerContentScripts([{
        id: scriptId,
        matches,
        js: ["spoof.js"],
        runAt: "document_start",
        world: "MAIN",
      }]);
    } catch (_) {}
  }

  const t = await getTab(tabId);
  const geoCfg = (t.geoEnabled && t.geo)
    ? { mode: t.geoAuto ? "auto" : "manual", lat: t.geo.lat, lng: t.geo.lng }
    : { mode: "off", disabled: true };
  const gateOn = !!t.gateBlockEnabled;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      func: (cfg, gateBlock) => {
        window.__EH_GEO__ = cfg;
        window.__EH_GATE_BLOCK__ = gateBlock;
        if (gateBlock && typeof window.__EH_APPLY_GATE_BLOCK__ === "function") {
          window.__EH_APPLY_GATE_BLOCK__();
        }
      },
      args: [geoCfg, gateOn],
      injectImmediately: true,
    });
  } catch (_) {}
  spoofTabs.add(tabId);
}

async function spoofOn(tabId, url) {
  return registerSpoofOnce(tabId, url);
}

async function spoofOff(tabId) {
  spoofTabs.delete(tabId);
  try { await chrome.scripting.unregisterContentScripts({ ids: [`spoof-${tabId}`] }); } catch (_) {}
}

// ---------- Fetch body rewrite ----------
function utf8ToBase64(str) { return btoa(unescape(encodeURIComponent(str))); }
function base64ToUtf8(b64) { return decodeURIComponent(escape(atob(b64))); }
function byteLength(str) { return new TextEncoder().encode(str).length; }

// ---------- Proxy routing (chrome.proxy) ----------
async function proxySet(proxyUrl, targetHost, scope = "target") {
  if (!proxyUrl) return { ok: false, error: "proxyUrl required" };

  let url = proxyUrl.trim();
  if (!/^https?:\/\//.test(url) && !/^socks[45]:\/\//.test(url)) {
    url = "http://" + url;
  }
  const u = new URL(url);
  const schemeRaw = u.protocol.replace(":", "").toLowerCase();
  const host = u.hostname;
  const port = u.port || (schemeRaw === "https" ? "443" : schemeRaw.startsWith("socks") ? "1080" : "80");

  const schemeMap = { http: "http", https: "https", socks4: "socks4", socks5: "socks5" };
  const scheme = schemeMap[schemeRaw] || "http";

  const host_ = (targetHost || "").trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const proxyServer = { scheme, host, port: parseInt(port, 10) };
  
  const isTargetOnly = (scope === "target") && !!host_;
  const pac = isTargetOnly
    ? `function FindProxyForURL(url, host) { if (host === '${host_}' || host.endsWith('.${host_}')) return '${scheme.toUpperCase()} ${host}:${port}'; return 'DIRECT'; }`
    : `function FindProxyForURL(url, host) { return '${scheme.toUpperCase()} ${host}:${port}'; }`;

  await chrome.proxy.settings.set({
    value: { mode: "pac_script", pacScript: { data: pac } },
    scope: "regular",
  });

  const t = await getTab(0);
  t.proxy = { scheme, host, port };
  addLog("PROXY", `Proxy active: ${scheme.toUpperCase()} ${host}:${port} (${isTargetOnly ? 'target: ' + host_ : 'all traffic'})`);

  return { ok: true, proxy: proxyServer, target: isTargetOnly ? host_ : "*" };
}

async function proxyClear() {
  try {
    await chrome.proxy.settings.clear({ scope: "regular" });
  } catch (_) {}
  const t = await getTab(0);
  t.proxy = null;
  addLog("PROXY", "Proxy Route cleared");
  return { ok: true };
}

// Live benchmark & test proxy connection via stealth tab
async function proxyTest(proxyUrl) {
  if (!proxyUrl) return { ok: false, error: "proxyUrl required" };
  let url = proxyUrl.trim();
  if (!/^https?:\/\//.test(url) && !/^socks[45]:\/\//.test(url)) url = "http://" + url;
  const u = new URL(url);
  const schemeRaw = u.protocol.replace(":", "").toLowerCase();
  const host = u.hostname;
  const port = u.port || (schemeRaw === "https" ? "443" : schemeRaw.startsWith("socks") ? "1080" : "80");
  const schemeMap = { http: "http", https: "https", socks4: "socks4", socks5: "socks5" };
  const scheme = schemeMap[schemeRaw] || "http";

  const pac = `function FindProxyForURL(url, host) { return '${scheme.toUpperCase()} ${host}:${port}'; }`;
  
  // Simpan setting proxy saat ini dulu
  let prevConfig = null;
  try {
    prevConfig = await new Promise((resolve) => chrome.proxy.settings.get({ incognito: false }, resolve));
  } catch (_) {}

  let tab = null;
  try {
    await chrome.proxy.settings.set({
      value: { mode: "pac_script", pacScript: { data: pac } },
      scope: "regular",
    });

    const startTs = Date.now();
    tab = await chrome.tabs.create({ url: "https://api.ipify.org?format=json", active: false });
    
    // Tunggu tab selesai
    let completed = false;
    for (let i = 0; i < 25; i++) {
      await sleep(400);
      try {
        const checkTab = await chrome.tabs.get(tab.id);
        if (checkTab && checkTab.status === "complete") {
          completed = true;
          break;
        }
      } catch (_) { break; }
    }

    if (!completed) {
      return { ok: false, error: "Timeout (proxy lambat / tidak merespons)" };
    }

    const latencyMs = Date.now() - startTs;
    let ip = null;
    try {
      const res = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => (document.body ? document.body.innerText : ""),
      });
      const txt = (res && res[0] && res[0].result) || "";
      const m = txt.match(/"ip"\s*:\s*"([\d.]+)"/);
      if (m) ip = m[1];
    } catch (_) {}

    if (ip) {
      addLog("PROXY", `Test OK: ${scheme.toUpperCase()} ${host}:${port} -> IP ${ip} (${latencyMs}ms)`);
      return { ok: true, ip, latencyMs };
    } else {
      return { ok: false, error: "Gagal membaca IP keluar dari proxy" };
    }
  } catch (err) {
    return { ok: false, error: err.message || "Gagal menghubungkan ke proxy" };
  } finally {
    if (tab && tab.id) {
      chrome.tabs.remove(tab.id).catch(() => {});
    }
    // Pulihkan setting proxy sebelumnya jika ada
    if (prevConfig && prevConfig.value && prevConfig.value.mode) {
      try {
        await chrome.proxy.settings.set({ value: prevConfig.value, scope: "regular" });
      } catch (_) {}
    } else {
      try {
        await chrome.proxy.settings.clear({ scope: "regular" });
      } catch (_) {}
    }
  }
}

async function onDebugEvent(debuggeeId, method, params) {
  if (method !== "Fetch.requestPaused") return;
  const tabId = debuggeeId.tabId;
  const reqId = params.requestId;
  if (!tabId || !reqId) return;

  const t = tabs.get(tabId);
  if (!t || !t.js || !params.responseStatusCode) {
    try {
      await chrome.debugger.sendCommand({ tabId }, "Fetch.continueRequest", { requestId: reqId });
    } catch (_) {}
    return;
  }
  try {
    const result = await chrome.debugger.sendCommand({ tabId }, "Fetch.getResponseBody", { requestId: reqId });
    let body = result.base64Encoded ? base64ToUtf8(result.body) : result.body;

    if (t.js.mode === "append") body = body + "\n" + t.js.replacement;
    else if (t.js.mode === "prepend") body = t.js.replacement + "\n" + body;
    else body = t.js.replacement;

    const skip = /^content-length$|^content-encoding$|^transfer-encoding$/i;
    const headers = (params.responseHeaders || []).filter((h) => !skip.test(h.name));
    headers.push({ name: "Content-Length", value: String(byteLength(body)) });

    await chrome.debugger.sendCommand({ tabId }, "Fetch.fulfillRequest", {
      requestId: reqId,
      responseCode: params.responseStatusCode,
      responseHeaders: headers,
      body: utf8ToBase64(body),
    });
    addLog("PATCH", `Patched JS response on tab #${tabId}`);
  } catch (err) {
    try {
      await chrome.debugger.sendCommand({ tabId }, "Fetch.continueRequest", { requestId: reqId });
    } catch (_) {}
  }
}
