# Design Spec: Proxy Route Upgrade (AWS Preset + Manual Custom + Live Health Check)

- **Date:** 2026-08-30
- **Status:** Approved
- **Target Files:** `sidepanel.html`, `sidepanel.js`, `background.js`, `manifest.json`

## 1. Overview
Upgrade fitur Proxy Route pada ekstensi Chrome `eh-Presensi` agar lebih handal, jelas, dan transparan. Menghapus scraper proxy publik yang rentan mati/lambat, menggantinya dengan arsitektur dua preset (AWS Jakarta & Manual Custom), live health check latency/IP, dan kontrol scope routing (Target Host vs All Traffic).

## 2. UI & Controls (`sidepanel.html`)
1. **Preset Selector (Button/Radio Pill Group)**:
   - `AWS Jakarta` (Default, URL `socks5://43.218.127.193:443`)
   - `Manual Custom` (Bebas input proxy URL)
2. **Routing Scope Selector (Button/Radio Pill Group)**:
   - `Target Host Only` (Default target: `presensi.kemendesa.go.id`)
   - `All Traffic` (Seluruh trafik browser lewat proxy)
3. **Interactive Actions & Feedback**:
   - Tombol **"Test Proxy"** (icon Lucide Activity/Refresh)
   - Badge Live Status:
     - `Idle / Off`
     - `Testing... (spinner)`
     - `Connected (XX ms) · IP: X.X.X.X` (Success / Hijau)
     - `Failed (Error reason)` (Destructive / Merah)

## 3. Background Engine (`background.js`)
1. **Cleanup**:
   - Hapus fungsi scraper `fetchGeonode()`, `fetchProxyScrape()`, `buildAutoPool()`, checklist animation, dan dependency scraping eksternal.
2. **Live Health Check Handler (`PROXY_TEST`)**:
   - Menerima message `{ type: "PROXY_TEST", proxyUrl, scope }`.
   - Menguji konektivitas proxy via request stealth terukur ke endpoint resolusi IP (`https://api.ipify.org?format=json`).
   - Menghitung latency round-trip dalam milidetik (`ms`).
   - Mengembalikan payload: `{ ok: true, ip: string, latencyMs: number }` atau `{ ok: false, error: string }`.
3. **PAC Script Generation (`PROXY_SET`)**:
   - Jika `scope === "target"`:
     `function FindProxyForURL(url, host) { if (host === '${targetHost}' || host.endsWith('.${targetHost}')) return '${SCHEME} ${HOST}:${PORT}'; return 'DIRECT'; }`
   - Jika `scope === "all"`:
     `function FindProxyForURL(url, host) { return '${SCHEME} ${HOST}:${PORT}'; }`

## 4. Frontend State & Controller (`sidepanel.js`)
1. Helper `getProxyPreset()`, `setProxyPreset(v)`, `getProxyScope()`, `setProxyScope(v)`.
2. Sync input field interactivity: saat preset `aws`, input `proxy-url` disabled & opacity 0.6; saat preset `manual`, input aktif.
3. Event listener untuk tombol "Test Proxy" dan auto-test trigger saat toggle proxy dinyalakan.
4. Auto-update badge status dan log category `PROXY`.

## 5. Verification & Rollout Plan
1. Syntax check JavaScript (`node --check`).
2. Tes mode AWS Jakarta: klik "Test Proxy" -> verifikasi output IP `43.218.127.193` dan latency < 150ms.
3. Tes mode Manual: input custom proxy -> verifikasi pengujian berhasil/gagal sesuai status server.
4. Tes switch scope Target Host vs All Traffic -> verifikasi pada `presensi.kemendesa.go.id` dan `mylocation.org`.
5. Bump version di `manifest.json`.
