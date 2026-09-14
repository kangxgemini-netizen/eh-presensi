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

  // --- GPS spoof (random from curated list) ---
  // Intercept getCurrentPosition/watchPosition and return a coordinate picked
  // from GEO_LIST (or manual override). This works regardless of CDP timing.
  try {
    var GEO_LIST = [
      { lat: -6.34326123634936, lng: 106.85888739468149 },
      { lat: -6.34315550962773, lng: 106.85869684957954 },
      { lat: -6.3435024086635, lng: 106.85856946085879 },
      { lat: -6.34316261500587, lng: 106.8588920937062 },
      { lat: -6.34326238121559, lng: 106.85884624591483 },
      { lat: -6.34329924404357, lng: 106.85854614131384 },
      { lat: -6.34325330185886, lng: 106.85868697157417 },
      { lat: -6.34335560307944, lng: 106.8584628294717 },
      { lat: -6.34336238029577, lng: 106.85856507415986 },
      { lat: -6.3432850913222, lng: 106.85891702309317 },
      { lat: -6.34352444514515, lng: 106.85859499422284 },
      { lat: -6.34316457230047, lng: 106.8587616077868 },
      { lat: -6.34306915482371, lng: 106.85853552146274 },
      { lat: -6.34324808661052, lng: 106.85874087007217 },
      { lat: -6.3434456538863, lng: 106.858474318075 },
      { lat: -6.34353542319374, lng: 106.85864202613418 },
      { lat: -6.34332821401204, lng: 106.85886895323162 },
      { lat: -6.34334831442434, lng: 106.85851483388454 },
      { lat: -6.34346152565975, lng: 106.85849121697217 },
      { lat: -6.34341198600928, lng: 106.85845019056016 },
      { lat: -6.34323069299665, lng: 106.85889147922678 },
      { lat: -6.34317012683962, lng: 106.85864125503029 },
      { lat: -6.34321923439124, lng: 106.85868127512751 },
      { lat: -6.3432105777466, lng: 106.8586579145958 },
      { lat: -6.34313349500822, lng: 106.85853004135139 },
      { lat: -6.34313613338896, lng: 106.85871456944612 },
      { lat: -6.34334903080669, lng: 106.85880229850547 },
      { lat: -6.34343252500506, lng: 106.85850386495824 },
      { lat: -6.34340565334838, lng: 106.85865831409927 },
      { lat: -6.34322007168938, lng: 106.8585932664165 },
      { lat: -6.34350178968459, lng: 106.85850087437389 },
      { lat: -6.34347959241269, lng: 106.85859209265188 },
      { lat: -6.34353939420489, lng: 106.85871353193008 },
      { lat: -6.34326913340198, lng: 106.85880028365209 },
      { lat: -6.34314440869325, lng: 106.8586560399998 },
      { lat: -6.34333850589112, lng: 106.85878975231718 },
      { lat: -6.34306300141186, lng: 106.85857254724138 },
      { lat: -6.34316181208189, lng: 106.85849881382788 },
      { lat: -6.34322903395307, lng: 106.85842202705827 },
      { lat: -6.34315617633922, lng: 106.85867596023621 },
      { lat: -6.34309350377378, lng: 106.85865673450442 },
      { lat: -6.34341852072691, lng: 106.85883922885313 },
      { lat: -6.34312765165464, lng: 106.85870586542033 },
      { lat: -6.34331111927116, lng: 106.85840236153707 },
      { lat: -6.3432712682261, lng: 106.85875128746896 },
      { lat: -6.34335913527716, lng: 106.85861042330552 },
      { lat: -6.34318218956627, lng: 106.85845972879626 },
      { lat: -6.34324895658539, lng: 106.8586226498143 },
      { lat: -6.34334398401921, lng: 106.85840658909143 },
      { lat: -6.34349902087856, lng: 106.85884452124772 }
    ];

    // Read config at call-time directly from chrome.storage.local.
    // Content scripts have storage access, so this is race-free: every reload
    // re-reads the latest config without depending on background injection timing.
    var _geoCfgCache = null;
    var _geoCfgTs = 0;
    function getGeoCfg() {
      // synchronous best-effort: use last cached value if fresh (<500ms)
      if (_geoCfgCache && (Date.now() - _geoCfgTs) < 500) return _geoCfgCache;
      // try synchronous storage if available
      try {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local && chrome.storage.local.get) {
          // chrome.storage.local.get is async; we attempt a sync read via the
          // internal promise and fall back to cached/window-injected value.
        }
      } catch (_) {}
      if (_geoCfgCache) return _geoCfgCache;
      try { return (typeof window !== "undefined" && window.__EH_GEO__) || { mode: "auto" }; }
      catch (_) { return { mode: "auto" }; }
    }

    // Async loader: warm the cache from storage at script start and whenever possible.
    function loadGeoCfg() {
      try {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local && chrome.storage.local.get) {
          chrome.storage.local.get(["geoMode", "geoManual", "geoDisabled"], function (d) {
            var disabled = !!d.geoDisabled;
            var mode = disabled ? "off" : (d.geoMode || (window.__EH_GEO__ && window.__EH_GEO__.mode) || "auto");
            var cfg = { mode: mode, disabled: disabled };
            if (mode === "manual" && d.geoManual) {
              var parts = String(d.geoManual).split(",");
              if (parts.length >= 2) {
                cfg.lat = parseFloat(parts[0].trim());
                cfg.lng = parseFloat(parts[1].trim());
              }
            }
            _geoCfgCache = cfg;
            _geoCfgTs = Date.now();
            try { window.__EH_GEO__ = cfg; } catch (_) {}
          });
        }
      } catch (_) {}
    }
    loadGeoCfg();
    // refresh cache periodically in case the user changes config without reload
    try { setInterval(loadGeoCfg, 1000); } catch (_) {}

    function pickCoord() {
      var cfg = getGeoCfg();
      if (cfg.mode === "manual" && cfg.lat != null && cfg.lng != null) {
        var la = parseFloat(cfg.lat), ln = parseFloat(cfg.lng);
        if (!isNaN(la) && !isNaN(ln)) return { latitude: la, longitude: ln };
      }
      var c = GEO_LIST[Math.floor(Math.random() * GEO_LIST.length)];
      return { latitude: c.lat, longitude: c.lng };
    }

    function fakePos(coord) {
      var c = coord || pickCoord();
      var coordsObj = {
        latitude: c.latitude,
        longitude: c.longitude,
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
            latitude: { value: c.latitude, enumerable: true },
            longitude: { value: c.longitude, enumerable: true },
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

    // Report an action back to the background logger (shown in Console Log tab)
    function report(cat, msg) {
      try {
        if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ action: "INJECT_LOG", cat: cat, msg: msg });
        }
      } catch (_) {}
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
        report("INJECT", "getCurrentPosition intercepted → " + c.latitude.toFixed(6) + ", " + c.longitude.toFixed(6));
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

  function isGateBlockEnabled() {
    if (typeof window !== "undefined" && window.__EH_GATE_BLOCK__ !== undefined) {
      return !!window.__EH_GATE_BLOCK__;
    }
    return true; // Default ON
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
        if (title && title.textContent && title.textContent.indexOf("ePresensi Versi Web Sudah Tidak Digunakan") !== -1) {
          if (s.parentNode) {
            s.parentNode.removeChild(s);
            purged = true;
          }
        }
      }

      // Only clean up body classes if the gate modal was actually purged AND no other valid modal is showing
      if (purged) {
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

  window.__EH_APPLY_GATE_BLOCK__ = applyGateBlock;
  window.__EH_REMOVE_GATE_BLOCK__ = removeGateBlock;

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
            (node.classList && (node.classList.contains("ios-appstore-gate-popup") || node.classList.contains("ios-appstore-gate-wrap"))) ||
            (node.querySelector && node.querySelector(".ios-appstore-gate-popup, .ios-appstore-gate-wrap, a[href*='id6800222797'], a[href*='epresensi-kemendespdt']")) ||
            (node.textContent && node.textContent.indexOf("ePresensi Versi Web Sudah Tidak Digunakan") !== -1)
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
            a.indexOf("Akses ePresensi KemendesPDT melalui browser pada iPhone") !== -1
          ) {
            return true;
          }
        } else if (typeof a === "object") {
          var title = a.title;
          if (typeof title === "string" && title.indexOf("Versi Web Sudah Tidak Digunakan") !== -1) {
            return true;
          }
          var text = a.text;
          if (typeof text === "string" && (text.indexOf("Versi Web Sudah Tidak Digunakan") !== -1 || text.indexOf("Akses ePresensi") !== -1)) {
            return true;
          }
          var html = a.html;
          if (typeof html === "string" && (html.indexOf("ios-appstore") !== -1 || html.indexOf("id6800222797") !== -1 || html.indexOf("Versi Web") !== -1)) {
            return true;
          }
          if (a.customClass) {
            var cc = typeof a.customClass === "string" ? a.customClass : (a.customClass.popup || "");
            if (typeof cc === "string" && cc.indexOf("ios-appstore") !== -1) {
              return true;
            }
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
