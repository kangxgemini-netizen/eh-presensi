# Proxy Route Upgrade (AWS Preset + Manual Custom + Live Health Check) Implementation Plan

> **For Hermes:** Execute this plan directly task-by-task.

**Goal:** Upgrade Proxy Route to use two clear presets (AWS Jakarta & Manual Custom), live latency/IP health check, and explicit routing scope (Target Host vs All Traffic) while removing unstable auto-scraping code.

**Architecture:** 
- Background service worker manages PAC script generation, storage persistence, and executes active health-check pings (`PROXY_TEST`).
- Side panel UI provides intuitive button/pill controls for Preset (AWS / Manual) and Routing Scope (Target Host / All Traffic), plus a live "Test Proxy" button with latency and IP badges.

**Tech Stack:** Chrome Extension Manifest V3, Chrome Proxy API, Chrome Scripting / DeclarativeNetRequest, Vanilla JavaScript / HTML5.

---

### Task 1: Update UI Markup & Styling in `sidepanel.html`

**Files:**
- Modify: `sidepanel.html`

**Actions:**
1. Replace `#proxy-mode` `<select>` dropdown with a `<fieldset>` radio-pill group (`aws` and `manual`).
2. Add `<fieldset>` radio-pill group for Routing Scope (`target` and `all`).
3. Add "Test Proxy" button (`#btn-proxy-test`) and live status badge container (`#proxy-health-badge`).
4. Remove legacy auto-proxy checklist & spinner markup.

---

### Task 2: Implement Background Handlers in `background.js`

**Files:**
- Modify: `background.js`

**Actions:**
1. Clean up unused scraping functions (`fetchGeonode`, `fetchProxyScrape`, `buildAutoPool`, `pickLiveProxy`, `proxyAutoSet`).
2. Update `proxySet(proxyUrl, targetHost, scope)` to generate PAC scripts according to scope (`target` vs `all`).
3. Implement `proxyTest(proxyUrl)` listener (`PROXY_TEST`) to benchmark connection latency and return external IP via `api.ipify.org`.

---

### Task 3: Implement Controller Logic & Health Check in `sidepanel.js`

**Files:**
- Modify: `sidepanel.js`

**Actions:**
1. Add `getProxyPreset()`, `setProxyPreset(v)`, `getProxyScope()`, `setProxyScope(v)` helpers.
2. Wire event listeners for preset change (auto-fill and disable input on `aws`, enable on `manual`).
3. Wire event listener for scope change (`target` vs `all`).
4. Wire "Test Proxy" button (`#btn-proxy-test`) to invoke `PROXY_TEST` and update badge with latency (ms) and IP.
5. Update `applyProxyIfOn()`, `load()`, and `applyAll()`.

---

### Task 4: Verification, Version Bump & Testing

**Files:**
- Modify: `manifest.json`

**Actions:**
1. Syntax check all JS files (`node --check`).
2. Bump version in `manifest.json` to `1.4.27`.
3. Verify end-to-end functionality.
