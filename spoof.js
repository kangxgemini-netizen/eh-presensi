// spoof.js — runs in the page MAIN world at document_start.
//
// Target: bypass guards that whitelist Apple mobile Safari, e.g. security-guard.js.
// That guard's only gate is isAppleMobileSafari(), which returns true only when:
//   - UA looks like iPhone/iPad/iPod + Safari
//   - navigator.vendor is Apple
//   - NOT a Chromium-like browser:
//       * window.chrome exists            -> Chromium signal
//       * navigator.userAgentData exists  -> Chromium signal (Chromium-only API)
//       * vendor contains "Google"        -> Chromium signal
//       * UA contains Chrome/Chromium/Edg/OPR/Firefox/...
// If we clear those Chromium signals and present a clean iPhone Safari fingerprint,
// the guard takes the "valid iOS Safari" branch and never starts anti-inspect.

(function () {
  "use strict";

  var IOS = {
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1",
    platform: "iPhone",
    vendor: "Apple Computer, Inc.",
    appVersion:
      "5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1",
    maxTouchPoints: 5,
    hardwareConcurrency: 6,
    deviceMemory: 4
  };

  function defineGetter(proto, key, value) {
    try {
      Object.defineProperty(proto, key, {
        get: function () { return value; },
        configurable: true,
        enumerable: true
      });
    } catch (_) {}
  }

  // Force a property to read as `undefined`, shadowing any inherited getter.
  // Used to erase Chromium-only signals (window.chrome, navigator.userAgentData).
  function shadowUndefined(obj, key) {
    try {
      Object.defineProperty(obj, key, {
        get: function () { return undefined; },
        configurable: true,
        enumerable: false
      });
    } catch (_) {
      try {
        obj[key] = undefined;
      } catch (_) {}
    }
  }

  // Report an action back to the background logger (shown in Console Log tab)
  function report(cat, msg) {
    try {
      if (typeof chrome !== "undefined" && chrome.runtime && typeof chrome.runtime.sendMessage === "function") {
        chrome.runtime.sendMessage({ action: "INJECT_LOG", cat: cat, msg: msg });
      }
    } catch (_) {}
  }

  // --- navigator static fingerprint ---
  if (typeof Navigator !== "undefined" && Navigator.prototype) {
    defineGetter(Navigator.prototype, "userAgent", IOS.userAgent);
    defineGetter(Navigator.prototype, "platform", IOS.platform);
    defineGetter(Navigator.prototype, "vendor", IOS.vendor);
    defineGetter(Navigator.prototype, "appVersion", IOS.appVersion);
    defineGetter(Navigator.prototype, "maxTouchPoints", IOS.maxTouchPoints);
    defineGetter(Navigator.prototype, "hardwareConcurrency", IOS.hardwareConcurrency);
    defineGetter(Navigator.prototype, "deviceMemory", IOS.deviceMemory);

    shadowUndefined(Navigator.prototype, "userAgentData");
  }

  // Direct instance overrides (in case page reads navigator directly)
  try {
    defineGetter(navigator, "userAgent", IOS.userAgent);
    defineGetter(navigator, "platform", IOS.platform);
    defineGetter(navigator, "vendor", IOS.vendor);
    defineGetter(navigator, "appVersion", IOS.appVersion);
    defineGetter(navigator, "maxTouchPoints", IOS.maxTouchPoints);
    defineGetter(navigator, "hardwareConcurrency", IOS.hardwareConcurrency);
    defineGetter(navigator, "deviceMemory", IOS.deviceMemory);
    shadowUndefined(navigator, "userAgentData");
  } catch (_) {}

  // CRITICAL: Chromium signal. window.chrome is always present in Chrome;
  // guard reads `!!window.chrome`. Shadow it to undefined on the instance so it
  // shadows the prototype getter.
  try { delete window.chrome; } catch (_) {}
  shadowUndefined(window, "chrome");

  // --- touch support (so touch-capable checks pass) ---
  try {
    if (!("ontouchstart" in window)) {
      Object.defineProperty(window, "ontouchstart", { value: null, writable: true, configurable: true });
      Object.defineProperty(window, "ontouchmove", { value: null, writable: true, configurable: true });
      Object.defineProperty(window, "ontouchend", { value: null, writable: true, configurable: true });
    }
    if (typeof window.TouchEvent === "undefined") {
      window.TouchEvent = function TouchEvent() {};
      window.Touch = function Touch() {};
      window.TouchList = function TouchList() {};
    }
  } catch (_) {}

  // --- devicePixelRatio ---
  try {
    if (!Object.getOwnPropertyDescriptor(window, "devicePixelRatio")) {
      Object.defineProperty(window, "devicePixelRatio", {
        get: function () { return 3; },
        configurable: true
      });
    }
  } catch (_) {}

  // --- screen dimensions (iPhone 12/13/14-ish) ---
  if (typeof Screen !== "undefined" && Screen.prototype) {
    var W = 390, H = 844;
    defineGetter(Screen.prototype, "width", W);
    defineGetter(Screen.prototype, "height", H);
    defineGetter(Screen.prototype, "availWidth", W);
    defineGetter(Screen.prototype, "availHeight", H);
    defineGetter(Screen.prototype, "colorDepth", 24);
    defineGetter(Screen.prototype, "pixelDepth", 24);
    defineGetter(Screen.prototype, "orientation", {
      angle: 0, type: "portrait-primary",
      onchange: null,
      addEventListener: function () {}, removeEventListener: function () {}
    });
  }

  // --- canvas fingerprint noise ---
  // Real devices produce slightly different canvas hashes per render.
  // Add deterministic-per-session noise so the hash isn't stable across reads.
  try {
    // Patch getContext so any 2d context is created with willReadFrequently,
    // silencing the browser's getImageData performance warning.
    var _getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, attrs) {
      if (type === "2d" && attrs && typeof attrs === "object") {
        attrs.willReadFrequently = true;
      } else if (type === "2d") {
        attrs = { willReadFrequently: true };
      }
      return _getContext.call(this, type, attrs);
    };

    var _toDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (type) {
      try {
        var ctx = this.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          var c = ctx.getImageData(0, 0, this.width || 1, this.height || 1);
          // inject 1px noise into the alpha channel of a random pixel
          var i = (Math.random() * c.data.length) & ~3;
          c.data[i + 3] = (c.data[i + 3] + 1) & 255;
          ctx.putImageData(c, 0, 0);
        }
      } catch (_) {}
      return _toDataURL.apply(this, arguments);
    };

    var _getImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function (x, y, w, h) {
      var img = _getImageData.apply(this, arguments);
      try {
        var d = img.data;
        var i = (Math.random() * d.length) & ~3;
        d[i + 3] = (d[i + 3] + 1) & 255;
      } catch (_) {}
      return img;
    };
  } catch (_) {}

  // Read config at call-time.
  //
  // IMPORTANT: this script is registered with world:"MAIN", so chrome.storage is
  // NOT reachable here the way it is in an ISOLATED-world content script. The
  // reliable channel is window.__EH_GEO__, which background.js injects on every
  // navigation (see readGeoMode()/buildGeoCfg()). The storage read below is kept
  // only as a best-effort path for the odd case where it does resolve.
  var _geoCfgCache = null;
  var _geoCfgTs = 0;

  function cfgFromWindow() {
    try {
      var w = (typeof window !== "undefined") ? window.__EH_GEO__ : null;
      return (w && typeof w === "object") ? w : null;
    } catch (_) {
      return null;
    }
  }

  function getGeoCfg() {
    // Prefer the injected config: it is the only source that carries geoMode.
    var injected = cfgFromWindow();
    if (injected) {
      _geoCfgCache = injected;
      _geoCfgTs = Date.now();
      return injected;
    }
    if (_geoCfgCache && (Date.now() - _geoCfgTs) < 500) return _geoCfgCache;
    if (_geoCfgCache) return _geoCfgCache;
    return { mode: "auto", geoMode: "wfo" };
  }

  // Async loader: warm the cache from storage when available, otherwise wait for
  // background to inject window.__EH_GEO__. Either way getGeoCfg() above stays
  // correct because it always re-reads the injected object first.
  function loadGeoCfg() {
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local && chrome.storage.local.get) {
        chrome.storage.local.get(["geoMode", "geoManual", "geoDisabled", "geoLat", "geoLng", "geoStyle"], function (d) {
          if (!d) return;
          var disabled = !!d.geoDisabled;
          var geoMode = disabled ? "off" : (d.geoMode || "wfo");
          var style = d.geoStyle || "ios";
          var mode = disabled ? "off" : (d.geoMode || "auto");
          var cfg = { mode: mode, geoMode: geoMode, disabled: disabled, style: style };
          if (d.geoLat != null && d.geoLng != null) {
            cfg.lat = parseFloat(d.geoLat);
            cfg.lng = parseFloat(d.geoLng);
          } else if (mode === "manual" && d.geoManual) {
            var trimmed = String(d.geoManual).trim();
            var parts = trimmed.includes(",") ? trimmed.split(",") : (trimmed.includes("\t") ? trimmed.split("\t") : trimmed.split(/\s+/));
            if (parts.length >= 2) {
              cfg.lat = parseFloat(parts[0].trim());
              cfg.lng = parseFloat(parts[1].trim());
            }
          }
          _geoCfgCache = cfg;
          _geoCfgTs = Date.now();
          // Only publish when background has not already injected a config,
          // so we never clobber the authoritative geoMode/lat/lng.
          if (!cfgFromWindow()) {
            try { window.__EH_GEO__ = cfg; } catch (_) {}
          }
        });
      }
    } catch (_) {}
  }
  loadGeoCfg();
  // refresh cache periodically in case the user changes config without reload
  try { setInterval(loadGeoCfg, 1000); } catch (_) {}

  // --- GPS spoof (random from curated list) ---
  // Intercept getCurrentPosition/watchPosition and return a coordinate picked
  // from GEO_LIST (or manual override). This works regardless of CDP timing.
  try {
    var GEO_LIST = [
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

    function pickCoord() {
      var cfg = getGeoCfg();
      if (cfg.lat != null && cfg.lng != null) {
        var la = parseFloat(cfg.lat), ln = parseFloat(cfg.lng);
        if (!isNaN(la) && !isNaN(ln)) return { latitude: la, longitude: ln };
      }
      var c = GEO_LIST[Math.floor(Math.random() * GEO_LIST.length)];
      return { latitude: c.lat, longitude: c.lng };
    }

    function fakePos(coord) {
      var c = coord || pickCoord();
      var lat = typeof c.latitude === "number" ? c.latitude : parseFloat(c.latitude);
      var lng = typeof c.longitude === "number" ? c.longitude : parseFloat(c.longitude);
      var coordsObj = {
        latitude: lat,
        longitude: lng,
        altitude: 10,
        accuracy: 5,
        altitudeAccuracy: 5,
        heading: null,
        speed: null
      };

      // Match native GeolocationCoordinates prototype if available
      if (typeof GeolocationCoordinates !== "undefined" && GeolocationCoordinates.prototype) {
        try {
          coordsObj = Object.create(GeolocationCoordinates.prototype, {
            latitude: { value: lat, enumerable: true },
            longitude: { value: lng, enumerable: true },
            accuracy: { value: 5, enumerable: true },
            altitude: { value: 10, enumerable: true },
            altitudeAccuracy: { value: 5, enumerable: true },
            heading: { value: null, enumerable: true },
            speed: { value: null, enumerable: true }
          });
        } catch (_) {}
      }

      var posObj = {
        coords: coordsObj,
        timestamp: Date.now()
      };

      // Match native GeolocationPosition prototype if available
      if (typeof GeolocationPosition !== "undefined" && GeolocationPosition.prototype) {
        try {
          posObj = Object.create(GeolocationPosition.prototype, {
            coords: { value: coordsObj, enumerable: true },
            timestamp: { value: Date.now(), enumerable: true }
          });
        } catch (_) {}
      }

      return posObj;
    }

    // --- Override Geolocation & Permissions API ---
    var targetProto = (typeof Geolocation !== "undefined" && Geolocation.prototype)
      ? Geolocation.prototype
      : navigator.geolocation;

    // Save native implementations before overriding
    var _origGetCurrentPosition = targetProto ? targetProto.getCurrentPosition : null;
    var _origWatchPosition = targetProto ? targetProto.watchPosition : null;
    var _origClearWatch = targetProto ? targetProto.clearWatch : null;
    var _origPermissionsQuery = (typeof Permissions !== "undefined" && Permissions.prototype)
      ? Permissions.prototype.query
      : null;

    function isGeoDisabled() {
      var cfg = getGeoCfg();
      return !!cfg.disabled || cfg.mode === "off";
    }



    report("INJECT", "iOS Safari fingerprint armed — navigator UA/platform/vendor, screen 390x844, touch + Chromium signals (window.chrome, userAgentData) removed");
    report("INJECT", "GPS Location Spoof armed — Geolocation.prototype + Permissions.prototype intercepted");

    if (typeof Permissions !== "undefined" && Permissions.prototype && Permissions.prototype.query) {
      Permissions.prototype.query = function (queryObj) {
        if (!isGeoDisabled() && queryObj && queryObj.name === "geolocation") {
          report("INJECT", "permissions.query(geolocation) → granted (spoofed)");
          return Promise.resolve({
            state: "granted",
            name: "geolocation",
            onchange: null,
            addEventListener: function () {},
            removeEventListener: function () {},
            dispatchEvent: function () { return true; }
          });
        }
        if (_origPermissionsQuery) return _origPermissionsQuery.apply(this, arguments);
        return Promise.reject(new Error("Permissions query not supported"));
      };
    }

    if (targetProto) {
      targetProto.getCurrentPosition = function (success, error, opts) {
        if (isGeoDisabled()) {
          if (_origGetCurrentPosition) return _origGetCurrentPosition.apply(this, arguments);
          return;
        }
        if (typeof success !== "function") return;
        const c = pickCoord();
        setTimeout(function () { success(fakePos(c)); }, 10);
        report("INJECT", "getCurrentPosition intercepted → " + c.latitude + ", " + c.longitude);
      };

      targetProto.watchPosition = function (success, error, opts) {
        if (isGeoDisabled()) {
          if (_origWatchPosition) return _origWatchPosition.apply(this, arguments);
          return 0;
        }
        if (typeof success !== "function") return 0;
        var id = setInterval(function () { success(fakePos()); }, 1000);
        setTimeout(function () { success(fakePos()); }, 10);
        report("INJECT", "watchPosition intercepted → streaming spoofed coords");
        return id;
      };

      targetProto.clearWatch = function (id) {
        if (isGeoDisabled()) {
          if (_origClearWatch) return _origClearWatch.apply(this, arguments);
          return;
        }
        clearInterval(id);
      };
    }

    // Also assign to instance directly as fallback
    if (navigator.geolocation && navigator.geolocation !== targetProto) {
      navigator.geolocation.getCurrentPosition = targetProto.getCurrentPosition;
      navigator.geolocation.watchPosition = targetProto.watchPosition;
      navigator.geolocation.clearWatch = targetProto.clearWatch;
    }
  } catch (_) {}

  // =========================================================================
  // --- SweetAlert2 iOS AppStore Gatekeeper Blocker (Hardened) ---
  // =========================================================================
  var GATE_STYLE_ID = "__eh_gate_block_style__";

  /* =========================================================
     WFH v2 MODE  (opt-in, default OFF)
     Official app v1.0.13 renders the WFH geofence anchor as "R" (Rumah),
     while the still-deployed Presensi Lama build hardcodes "K" (Lokasi
     kantor). When "WFH v2 Mode" is enabled we make the old page behave
     like the new build.

     Design rule: this feature must never be able to block an attendance
     submission. Label swaps are unconditional; anything that touches data
     (coordinates, endpoints) is conservative and falls back to the page's
     original behaviour on ANY uncertainty.
     ========================================================= */

  // Only the legacy Presensi Lama paths need this. The /absen-dev/ build
  // already renders "R" from the server — never touch it, or we would
  // override markup that is already correct.
  function onLegacyWfhPage() {
    try {
      var p = (typeof window !== "undefined" && window.location) ? String(window.location.pathname) : "";
      // Explicitly exclude anything under /absen-dev/
      if (/\/absen-dev\//i.test(p)) return false;
      return /\/cek-lokasi-(wfh|wfa)\/?$/i.test(p);
    } catch (_) {
      return false;
    }
  }

  function isWfhModeActive() {
    try {
      var cfg = getGeoCfg();
      // An explicitly disabled session never relabels, whatever the page is.
      if (cfg && cfg.disabled) return false;
      if (!cfg) return false;
      // geoMode is the business mode (wfo/wfh/manual) pushed by background.js.
      // Fall back to mode for older injected payloads.
      var m = cfg.geoMode || cfg.mode;
      return m === "wfh";
    } catch (_) {
      return false;
    }
  }

  function hasInjectedCfg() {
    try {
      var w = (typeof window !== "undefined") ? window.__EH_GEO__ : null;
      return !!(w && typeof w === "object");
    } catch (_) {
      return false;
    }
  }

  // The master switch. Requires BOTH:
  //   1. the "WFH v2 Mode" toggle to be on, and
  //   2. the user to be in WFH geo mode (or still awaiting injection).
  function wfhV2Enabled() {
    try {
      var w = (typeof window !== "undefined") ? window.__EH_WFH_V2__ : null;
      if (w === undefined || w === null) return false;
      var on = !!w;
      if (!on) return false;
      return isWfhModeActive() || (!hasInjectedCfg() && onLegacyWfhPage());
    } catch (_) {
      return false;
    }
  }

  function relabelWfhMarker() {
    if (!wfhV2Enabled()) return false;
    var changed = false;
    try {
      // Leaflet renders our divIcon as .leaflet-marker-icon > div (the colored badge).
      var badges = document.querySelectorAll(".leaflet-marker-icon div");
      for (var i = 0; i < badges.length; i++) {
        var b = badges[i];
        if (b.textContent === "K" && !b.dataset.ehRelabelled) {
          b.textContent = "R";
          b.dataset.ehRelabelled = "1";
          changed = true;
        }
      }

      // Popup label follows the same wording as the official app.
      var popups = document.querySelectorAll(".leaflet-popup-content");
      for (var j = 0; j < popups.length; j++) {
        var p = popups[j];
        if (p.textContent === "Lokasi kantor") {
          p.textContent = "Rumah WFH";
          changed = true;
        }
      }
    } catch (_) {}
    return changed;
  }

  // Distance label: the old page says "Jarak ke kantor". Under WFH v2 the
  // anchor is conceptually the employee's home, so match the app's wording.
  // Text-only: never touches the computed number itself.
  function relabelWfhDistance() {
    if (!wfhV2Enabled()) return false;
    var changed = false;
    try {
      var walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT);
      var node;
      var guard = 0;
      while ((node = walker.nextNode()) && guard++ < 20000) {
        var t = node.nodeValue;
        if (!t) continue;
        var next = t
          .replace(/Jarak\s+ke\s+kantor/gi, "Jarak ke rumah")
          .replace(/dalam\s+radius\s+lokasi\s+kerja/gi, "dalam radius lokasi rumah");
        if (next !== t) {
          node.nodeValue = next;
          changed = true;
        }
      }
    } catch (_) {}
    return changed;
  }

  try {
    var _wfhRelabelCount = 0;
    var _wfhRelabelTimer = setInterval(function () {
      _wfhRelabelCount++;
      if (_wfhRelabelCount > 40) {
        clearInterval(_wfhRelabelTimer);
        return;
      }
      relabelWfhMarker();
      relabelWfhDistance();
    }, 250);

    var _wfhMarkerObserver = new MutationObserver(function () {
      relabelWfhMarker();
      relabelWfhDistance();
    });
    _wfhMarkerObserver.observe(document.documentElement, { childList: true, subtree: true });

    document.addEventListener("DOMContentLoaded", function () {
      relabelWfhMarker();
      relabelWfhDistance();
    });
    window.addEventListener("load", function () {
      relabelWfhMarker();
      relabelWfhDistance();
    });
  } catch (_) {}

  function isGateBlockEnabled() {
    if (typeof window !== "undefined" && window.__EH_GATE_BLOCK__ !== undefined) {
      return !!window.__EH_GATE_BLOCK__;
    }
    try {
      if (typeof localStorage !== "undefined") {
        var v = localStorage.getItem("__EH_GATE_BLOCK__");
        if (v !== null) return v === "1";
      }
    } catch (_) {}
    return true; // Default active protection against iOS AppStore gatekeeper modal
  }

  function applyGateBlock() {
    if (!isGateBlockEnabled()) return;

    // 1. Surgical CSS: targets ONLY the iOS AppStore gate modal container/wrap.
    // NEVER target generic .swal2-container or #swal2-title, and NEVER hijack body overflow globally!
    try {
      var existingStyle = document.getElementById(GATE_STYLE_ID);
      if (!existingStyle) {
        var style = document.createElement("style");
        style.id = GATE_STYLE_ID;
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
    } catch (_) {}

    // 2. Scan and remove any existing gatekeeper modal in DOM
    purgeGateElements();
  }

  function purgeGateElements() {
    if (!isGateBlockEnabled()) return false;
    var purged = false;
    try {
      // Find elements strictly associated with the iOS AppStore gatekeeper modal
      var candidates = document.querySelectorAll(
        ".ios-appstore-gate-popup, .ios-appstore-gate-wrap, a[href*='id6800222797'], a[href*='epresensi-kemendespdt']"
      );
      for (var i = 0; i < candidates.length; i++) {
        var el = candidates[i];
        var container = (el.closest && el.closest(".swal2-container")) || el;
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
          purged = true;
        }
      }

      // Check specifically for the text of the gatekeeper modal in swal containers
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

      // Only clean up body classes if the gate modal was actually purged AND no other valid modal is showing
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
        report("GATE", "Purged SweetAlert2 iOS AppStore modal from DOM");
      }
    } catch (_) {}
    return purged;
  }

  function removeGateBlock() {
    try {
      var style = document.getElementById(GATE_STYLE_ID);
      if (style) style.remove();
    } catch (_) {}
  }

  window.__EH_APPLY_GATE_BLOCK__ = function () {
    window.__EH_GATE_BLOCK__ = true;
    try { if (typeof localStorage !== "undefined") localStorage.setItem("__EH_GATE_BLOCK__", "1"); } catch (_) {}
    applyGateBlock();
  };
  window.__EH_REMOVE_GATE_BLOCK__ = function () {
    window.__EH_GATE_BLOCK__ = false;
    try { if (typeof localStorage !== "undefined") localStorage.setItem("__EH_GATE_BLOCK__", "0"); } catch (_) {}
    removeGateBlock();
  };

  // Run immediately at document_start
  applyGateBlock();

  // Hook DOMContentLoaded and window load
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", applyGateBlock, { once: true });
    } else {
      applyGateBlock();
    }
    window.addEventListener("load", applyGateBlock, { once: true });
  }

  // Poller interval for first 4 seconds to catch any delayed or asynchronous SweetAlert triggers
  try {
    var _gatePollCount = 0;
    var _gatePollTimer = setInterval(function () {
      _gatePollCount++;
      if (_gatePollCount > 20) {
        clearInterval(_gatePollTimer);
        return;
      }
      if (isGateBlockEnabled()) {
        purgeGateElements();
      }
    }, 200);
  } catch (_) {}

  // MutationObserver to catch dynamic creation instantly without false-positives
  try {
    var gateObserver = new MutationObserver(function (mutations) {
      if (!isGateBlockEnabled()) return;
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        for (var j = 0; j < m.addedNodes.length; j++) {
          var node = m.addedNodes[j];
          if (node.nodeType !== 1) continue;
          if (
            (node.classList && (node.classList.contains("ios-appstore-gate-popup") || node.classList.contains("ios-appstore-gate-wrap") || node.classList.contains("swal2-container") || node.classList.contains("swal2-popup"))) ||
            (node.querySelector && node.querySelector(".ios-appstore-gate-popup, .ios-appstore-gate-wrap, a[href*='id6800222797'], a[href*='epresensi-kemendespdt']")) ||
            (node.textContent && (node.textContent.indexOf("Versi Web Sudah Tidak Digunakan") !== -1 || node.textContent.indexOf("id6800222797") !== -1))
          ) {
            purgeGateElements();
            return;
          }
        }
      }
    });
    gateObserver.observe(document.documentElement, { childList: true, subtree: true });
  } catch (_) {}

  // Hook window.Swal safely without breaking prototypes or legitimate dialogs
  function isBlockedSwalArgs(args) {
    if (!isGateBlockEnabled() || !args || !args.length) return false;
    try {
      for (var i = 0; i < args.length; i++) {
        var a = args[i];
        if (!a) continue;
        if (typeof a === "string") {
          if (
            a.indexOf("ios-appstore") !== -1 ||
            a.indexOf("Versi Web Sudah Tidak Digunakan") !== -1 ||
            a.indexOf("id6800222797") !== -1 ||
            a.indexOf("Akses ePresensi") !== -1
          ) {
            return true;
          }
        } else if (typeof a === "object") {
          var str = "";
          try { str = JSON.stringify(a); } catch (_) {
            str = (a.title || "") + " " + (a.text || "") + " " + (a.html || "");
          }
          if (
            str.indexOf("ios-appstore") !== -1 ||
            str.indexOf("Versi Web Sudah Tidak Digunakan") !== -1 ||
            str.indexOf("id6800222797") !== -1 ||
            str.indexOf("epresensi-kemendespdt") !== -1 ||
            str.indexOf("Akses ePresensi") !== -1
          ) {
            return true;
          }
        }
      }
    } catch (_) {}
    return false;
  }

  function wrapSwal(target) {
    if (!target || target.__eh_proxied__) return target;
    try {
      var proxy = new Proxy(target, {
        apply: function (fn, thisArg, args) {
          if (isBlockedSwalArgs(args)) {
            report("GATE", "Suppressed Swal() call for iOS AppStore gatekeeper");
            return Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true, value: false });
          }
          return Reflect.apply(fn, thisArg, args);
        },
        get: function (obj, prop, receiver) {
          if (prop === "__eh_proxied__") return true;
          if (prop === "fire") {
            var origFire = obj.fire;
            if (typeof origFire === "function") {
              return function () {
                if (isBlockedSwalArgs(arguments)) {
                  report("GATE", "Suppressed Swal.fire() for iOS AppStore gatekeeper");
                  return Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true, value: false });
                }
                return origFire.apply(obj, arguments);
              };
            }
          }
          return Reflect.get(obj, prop, receiver);
        }
      });
      return proxy;
    } catch (_) {
      return target;
    }
  }

  var _swalVal = wrapSwal(window.Swal);

  try {
    Object.defineProperty(window, "Swal", {
      configurable: true,
      enumerable: true,
      get: function () { return _swalVal; },
      set: function (v) { _swalVal = wrapSwal(v); }
    });
    Object.defineProperty(window, "sweetAlert", {
      configurable: true,
      enumerable: true,
      get: function () { return _swalVal; },
      set: function (v) { _swalVal = wrapSwal(v); }
    });
  } catch (_) {
    window.Swal = _swalVal;
  }

})();
