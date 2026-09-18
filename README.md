# eh-Presensi

Extension Chrome Manifest V3 buat bantu pegawai yang struggle di jalanan menuju kantor — spoof device iOS Safari, bypass JS guard, spoof GPS (auto/manual), dan route traffic lewat proxy IP Jakarta.

**Version label** `vX.X.X` ditampilkan di pojok kanan bawah side panel (diambil live dari `manifest.json` via `chrome.runtime.getManifest().version`).

---

## Changelog

### v2.0.4 (2026-09-14)
- **Normalisasi Desimal GPS (7 Digit):** Seluruh koordinat GPS pada preset WFO (Kalibata & Kalisari), anchor, spoof engine, dan input manual distandardisasi menjadi tepat 7 digit desimal (misalnya `-6.2547403, 106.7249433`).
- **Natural Sensor Emulation:** Menghapus artefak kalkulasi floating-point 14-16 desimal yang tidak wajar agar data koordinat yang dikirim ke API presensi terbaca otentik seperti sensor GPS fisik smartphone.

### v2.0.3 (2026-09-14)
- **Startup Dynamic Script Purge:** Pembersihan total cache registrasi dynamic content script (`chrome.scripting.unregisterContentScripts`) pada saat background worker startup. Hal ini menjamin pembaharuan kode `spoof.js` langsung dieksekusi secara instan oleh browser tanpa tersangkut cache internal LevelDB per tab.
- **Hardened Injection Synchronization:** Sinkronisasi bersih modul spoofing iOS Safari dan anti-gatekeeper SweetAlert2 di setiap refresh tab.

### v2.0.2 (2026-09-14)
- **Hotfix Swal Proxy Scoping:** Memindahkan fungsi report logger ke root scope IIFE di `spoof.js` guna mencegah exception `ReferenceError: report is not defined` saat gatekeeper modal dicegah pada halaman ubah password (`/ubah-password`).
- **Zero-Interruption Page Lifecycle:** Memastikan alur ganti password dan pemanggilan SweetAlert status presensi berjalan mulus tanpa hambatan error konsol.

### v2.0.1 (2026-09-14)
- **Stability & Blocker Hardening:** Selektor bedah khusus untuk iOS AppStore Gatekeeper tanpa merusak modal dialog SweetAlert lainnya (konfirmasi kehadiran, dialog radius, notifikasi error).
- **CDP Request Recovery:** Penanganan error `-32602` (`Invalid InterceptionId`) saat reload/navigasi cepat agar tidak memicu unhandled promise exception.
- **UI Refinements:** Tombol Reload Tab dipindah ke samping kanan tombol Bypass All sebagai icon button mandiri dengan animasi spin interaktif.
- **Transparent ES6 Proxy Hooking:** Mengganti monkey-patching `Swal` dengan ES6 `Proxy` untuk kompatibilitas penuh method dan prototype SweetAlert bawaan website.

### v2.0.0 (2026-09-14)
- **Block iOS AppStore Gate:** Menambahkan modul pemblokir modal SweetAlert2 ("ePresensi Versi Web Sudah Tidak Digunakan") dan backdrop overlay-nya agar presensi tetap lancar saat spoofing iOS Safari. Dilengkapi toggle ON/OFF independen di Side Panel dan integrasi ke master Bypass All.
- **Dual Direct Navigation CTA:** Shortcut 2 kolom di bawah tombol Bypass All untuk navigasi instan tab aktif ke `https://presensi.kemendesa.go.id/absen-dev/dashboard` ("Buka Absen-Dev") dan `https://presensi.kemendesa.go.id/dashboard` ("Buka Presensi Lama").
- **Engine Hardening:** Pembersihan otomatis script registrasi dinamis saat background worker startup.

### v1.4.39 (2026-08-30)
- **Instant Real-Time OTA Fetcher:** Menggunakan GitHub Releases REST API (/releases/latest) dengan bypass cache CDN agar rilis baru terdeteksi secara instan.
- **Dynamic Release Notes Accordion:** Render catatan rilis langsung di banner warning update tanpa perlu berpindah tab.

### v1.4.38 (2026-08-30)
- **Bypass All Module Isolation:** Tombol master hanya menghitung 3 modul inti (iOS Safari UA, Guard Neutralizer, GPS Spoof), sepenuhnya independen dari Proxy Route.
- **Deactivate All State:** Tombol bertransformasi menjadi 'Deactivate All' dengan style merah saat 3 modul aktif.

### v1.4.29 (2026-08-30)
- **Full Manual Proxy Route (UI/UX Polish):** Menghapus preset hardcoded AWS, menyediakan input langsung yang responsif (`socks5://..` atau `http://..`) dengan input hint, inline testing button, dan real-time error indicator.
- **Routing Scope Selector:** Tetap menyediakan pilihan `Target Host Only` vs `All Traffic`.

### v1.4.28 (2026-08-30)
- **UI Consistency Polish:** Menyeragamkan ukuran `min-height` dan padding button-pill Anchor (Kalibata / Kalisari) agar proporsional dan konsisten dengan seluruh form control.

### v1.4.27 (2026-08-30)
- **Upgrade Proxy Route & Live Health-Check:** Preset AWS Jakarta (`socks5://43.218.127.193:443`) dan Manual Custom via button-pill group. Pilihan routing scope (`Target Host Only` vs `All Traffic`). Tombol **Test Connection** dengan pengujian latency (ms) dan deteksi IP keluar real-time. Hapus scraper auto publik yang lambat/rentan mati.

### v1.4.26 (2026-08-30)
- **Modernisasi UI shadcn:** Mode GPS (`WFO`/`WFH`/`Manual`) dan Anchor (`Kalibata`/`Kalisari`) menggunakan Button/Radio-Pill group.
- **Porting GPS Location Spoof:** 30 titik acak Kalibata (-6.2549, 106.8514) dan Kalisari (-6.3430, 106.8590) radius 20m, WFH koordinat, dan validasi koordinat manual.
- **Rollback Baseline Core v1.4.23:** Memulihkan core background dan document_start spoofing ke basis v1.4.23 yang teruji 100% bypass fingerprint iOS Safari dan security guard.

### v1.4.36 (2026-08-29)
- **Fix crash + spoof reliability:** sidepanel.js:1136 gak lagi baca `$("geo-mode").value` (ID sudah jadi radio `name=geo-mode`) — pakai `state.geoMode`. spoof.js gate polling 3s di `document_start` biar iOS Safari fingerprint jalan pas reload/Bypass All (storage belum ready).

### v1.4.35 (2026-08-29)
- **Icon extension:** logoipsum-353 (biru #1D3AA7) → `icon-16/48/128.png`, register di `action.default_icon` + `icons`. GPS UI: label "Free" → "Manual".

### v1.4.34 (2026-08-29)
- **spoof.js GATED by toggle:** UA (iOS Safari fingerprint) patch ONLY kalau `ua` ada di storage; GPS patch ONLY kalau `!geoDisabled`. Toggle OFF → spoof.js gak patch apa-apa (page liat Chrome asli). Fix "spoof jalan padahal belum toggle".

### v1.4.33 (2026-08-29)
- **Auto-persist spoof (fix "harus bypass lagi tiap reload"):** `spoof.js` sekarang static `content_script` (`document_start`, MAIN world) untuk `presensi.kemendesa.go.id` — auto-jalan tiap page load walau service worker restart. Geo + UA config auto-apply dari `chrome.storage.local` di `onUpdated` (gak nunggu klik). `spoof.js` fix mode `wfo/wfh/free` + `geoAnchor` (WFO_PRESETS 60 titik, WFH cache storage).

### v1.4.32 (2026-08-22)
- **GPS UI redesign (Shadcn-style):** Geo Config selalu terbuka (gak collapsible). Radio group jadi pill (`.radio-pill`) dengan `FieldSet`/`legend` + `aria-label`, focus-visible ring. Display coords: `WFO · Kalibata · -6.254909, 106.851431`. Manual input: `aria-invalid` + check icon class-based + hint caption.

### v1.4.31 (2026-08-22)
- **GPS spoof redesign:** Mode WFO / WFH / Free + anchor Kalibata / Kalisari. WFO = 30 titik precompute radius 20m. WFH = 30 titik max 45km divalidasi Nominatim (bukan jalan/sungai), cache di storage. Free = input manual bebas.

### v1.4.30 (2026-08-09)
- **UI overhaul: Lucide outline-only.** Semua icon jadi stroke `currentColor`, `fill: none` (style Lucide murni). Hapus emoji 🗑️⚡💀🔑⏳✅, chevron `▼` → Lucide `chevron-down`, tab Controls → `sliders-horizontal` asli.
- Proxy profil: tombol test/hapus pakai Lucide (`zap`/`trash`), indikator mati `alert-circle` (merah), auth `lock`.
- **Import/Export proxy list.** Paste banyak proxy sekaligus (satu per baris, format `host:port` / `socks5://host:port`, note setelah `#`) → auto-parse jadi profil. Export semua profil ke clipboard.
- **Latency + one-click test.** Tiap profil nunjukkin `ms` (disimpan `latencyMap`), tombol ⚡ buat test cepat tanpa activate. Toast notif HIDUP/DEAD di pojok bawah.
- **Round-robin antar proxy hidup.** Toggle di UI → ganti proxy tiap 5 menit ke proxy hidup berbeda (alarm `proxyRr`).
- **Auto mode simpan proxy sukses** (`lastAutoProxy`) buat fallback/reuse.
- **Konfirmasi hapus profil** (gak salah hapus).
- **Proxy health checker otomatis.** Alarm tiap 60 detik cek proxy aktif masih hidup (via tab stealth). Kalau mati → auto-failover ke preset lain yang hidup, terakhir fallback AWS `43.218.127.193:443`. Log + badge update otomatis.
- **Tombstone dead proxies.** Host:port yang gagal live-test ditandai mati (cooldown 30 menit). Auto mode langsung skip yang barusan mati (gak buang waktu test), profil list nunjukin 💀.
- **Auto-activate preset default (AWS Jakarta).** Saat load, kalau belum ada profil aktif, preset pertama (AWS) langsung di-activate → proxy stabil jalan tanpa klik.
- **Clean renderProxyDetail:** guard null elemen `proxy-url` (anti-crash kalau DOM berubah).
- **FIX crash sidepanel.js:706.** Tambah helper `escapeHtml()` (sebelumnya undefined → error pas render list profil proxy). Sekarang preset list + manual detail jalan normal.
- **Preset proxy ke local storage.** Daftar profil otomatis terisi: AWS `43.218.127.193:443` (stabil) + 3 proxy ID hidup (`157.66.192.115:8080`, `180.148.25.190:3128`, `114.141.54.221:8080`). Klik item → activate, 🗑️ → delete. Flag `profilesSeeded` cegah inject ulang.
- **Proxy hidup terverifikasi:** AWS stabil 24/7; 3 ID http hidup saat dicek (free, umur pendek → auto-fallback AWS kalau mati).
- **Upgrade proxy engine (adapt season-framework/proxy-switcher).**
  - **Saved proxy profiles**: simpan beberapa proxy manual (list, klik activate, 🗑️ delete). Tombol "+ Simpan proxy ini".
  - **Manual detail info**: saat proxy AKTIF, card bawah nunjukkin `Protokol · Latency (ms) · IP keluar · Lokasi (city, ISP, country)`.
  - **Policy mode**: Whitelist (cuma Target Host lewat proxy) / Blacklist (semua trafik lewat proxy, domain di-bypass).
  - **Auth credentials**: centang "Proxy ber-auth" → isi username/password → auto-login via `onAuthRequired`.
  - **Badge indicator**: icon toolbar nunjukkin `ON` (blacklist) / `WL` (whitelist) warna hijau saat proxy aktif.
  - **Live state restore**: proxy tetap nyala setelah restart Chrome.
  - **Proxy-error detection**: kalau proxy mati → auto-fallback ke AWS `43.218.127.193:443`.
- **Proxy langsung tanpa tunnel (otomatis, gak perlu setup manual).** Default `socks5://43.218.127.193:443` (SOCKS di port 443, tembus ISP). 3proxy di-compile di AWS (port 443, systemd persistent). Instance lama `16.78.6.181` dibuang (egress TCP rusak).
- **Proxy Route conditional (site-specific).** Default Target Host = `presensi.kemendesa.go.id` → cuma site itu lewat proxy, sisanya DIRECT. Kosongkan = semua trafik. Field Target Host TETAP kelihatan di Auto mode.
- **Auto proxy (proxy ID gratis ≤100km).** Anchor = GPS spoof AKTIF (auto random 50 preset ATAU manual input), fallback titik default. Filter `haversineKm(anchor, proxyGeo) ≤ 100km`, live-test lewat tab stealth, PAC conditional dari Target Host.
- **Auto UI progress.** Checklist 5 tahap (① ambil daftar ② filter radius ③ test ④ terapkan ⑤ verifikasi IP) muncul SATU PER SATU + delay 3 detik, spinner muter, auto-reload tab pas AKTIF. Hint: mylocation.org gak berubah kalau Target Host = presensi (site-specific).
- **iOS Safari fingerprint clean.** DNR strip `sec-ch-ua*` (Client Hints) saat UA Spoof ON → server fallback ke UA iPhone Safari. Butuh permission `declarativeNetRequestWithHostAccess` + hapus `"fetch"` dari resourceTypes (MV3 invalid).
- **Proxy status real-time + migration.** Card update langsung pas ketik/toggle/mode. Auto-migrate storage lama `127.0.0.1:1080` / `16.78.6.181` → AWS. MV3 keep-alive alarm + guard `lastError` (fix "message port closed").
- **Proxy Config Manual/Auto.** Manual → input URL + Target Host; Auto → disable manual + tombol Auto (ID ≤100km). applyAll hormati proxy-mode.
- **Bypass All CTA auto-reload.** Klik Bypass All → `applyAll()` lalu auto-reload tab aktif biar seluruh config (UA/JS/Geo/Proxy) langsung jalan di halaman.
- **Catatan:** "Mode development aktif" di website = environment server (bukan extension). Free proxy (Auto) umur pendek → pakai Manual AWS untuk IP stabil.

### v1.4.1 (2026-08-06)
- **Console Log fill container height.**
  - Hapus `min-height: 320px` / `max-height: 480px` di `.log-container`.
  - Pakai `flex: 1; min-height: 0` → kotak log otomatis mentok ke bawah side panel, tanpa ruang kosong.

### v1.4.0 (2026-08-06)
- **Geo Manual: hapus label "Valid & Aktif".**
  - Text + icon checklist terpisah di samping label dihapus.
  - Feedback validasi tetap di dalam field input (border hijau + icon checklist pojok kanan).

### v1.3.9 (2026-08-06)
- **Console Log jadi 2-row layout.**
  - Row 1: `[Time]` + badge kategori.
  - Row 2: deskripsi pesan (full text, bisa wrap).

### v1.3.8 (2026-08-06)
- **CTA Bypass All dapat state Active / Deactivate.**
  - Belum semua nyala → tombol biru "Bypass All" (shield icon).
  - Ke-4 toggle ON → tombol merah "Deactivate" (power-off icon); klik untuk matiin semua.
  - State dihitung otomatis di `render()` berdasarkan `count === 4`.

### v1.3.7 (2026-08-06)
- **Short information di tiap card fitur.**
  - iOS Safari Fingerprint: "Mengubah user-agent menjadi iPhone serta melakukan purge window.chrome agar tidak terdeteksi sebagai simulator atau browser desktop."
  - security-guard.js Bypass: "Menyisipkan patch di awal file JS untuk menetralkan pemeriksaan debugger dan anti-inspect agar halaman tetap bisa dimuat normal."
  - GPS Location Spoof: "Memalsukan koordinat GPS melalui intercept Geolocation API dan Permissions agar terbaca sebagai lokasi Jakarta yang dipilih."
  - Proxy Route (IP Jakarta): "Mengalirkan seluruh traffic browser melalui proxy SOCKS5 Jakarta agar alamat IP terbaca berasal dari Indonesia."
  - Deskripsi yang tadinya `nowrap` diubah jadi wrap.

### v1.3.6 (2026-08-06)
- **Console Log menampilkan kemampuan ke-4 fungsi utama.**
  - `INJECT`: iOS Safari fingerprint armed + GPS Location Spoof armed.
  - `PATCH`: security-guard.js bypass armed.
  - `PROXY`: "Proxy Route (IP Jakarta) active".
  - `UA`: iOS Safari fingerprint active.

### v1.3.5 (2026-08-06)
- **Console Log menampilkan respon ekstensi ke halaman.**
  - `spoof.js` kirim laporan via `chrome.runtime.sendMessage({action:"INJECT_LOG"})`.
  - Background log sebagai kategori baru `INJECT` (badge cyan).
  - Contoh: `getCurrentPosition intercepted → -6.343261, 106.858887`, `permissions.query(geolocation) → granted (spoofed)`.

### v1.3.4 (2026-08-06)
- **FIX krusial: Toggle Geo Spoof ON/OFF sekarang beneran jalan.**
  - Root cause: `registerSpoofOnce` di background tiap reload tab selalu inject `{mode:"auto"}` ke `window.__EH_GEO__`, menimpa state disabled. Akibatnya matiin toggle geo gak pernah mati karena reload balik nyala.
  - Tambah flag state `geoEnabled` di background (terpisah dari koordinat `geo`).
  - `registerSpoofOnce` & handler `onUpdated` reload sekarang inject config berdasarkan `geoEnabled` beneran: ON → koordinat, OFF → `{mode:"off", disabled:true}`.
  - `geoSet`/`geoClear` set `geoEnabled` true/false.
- Version label `vX.X.X` sekarang tampil di side panel (bukan hardcoded).

### v1.3.3 (2026-08-06)
- **FIX Toggle Geo OFF tidak mengembalikan GPS asli.**
  - `spoof.js` simpan referensi native (`_origGetCurrentPosition`, `_origWatchPosition`, `_origPermissionsQuery`).
  - Saat `disabled:true` / `mode:"off"`, spoof.js panggil fungsi native browser → GPS kembali asli 100%.
  - `geoClear` inject `{mode:"off",disabled:true}` + set `geoDisabled:true` di storage + reload tab.

### v1.3.2 (2026-08-06)
- Preset GPS diubah jadi **50 koordinat acak** dalam radius 30m (diameter 60m) dari titik pusat `-6.343295, 106.858673`.
- Applied ke `background.js`, `sidepanel.js`, `spoof.js`, `popup.js`.

### v1.3.1 (2026-08-06)
- **FIX input manual GPS tidak berfungsi + visual feedback.**
  - `parseGeoCoord` diperketat dengan validasi range lat/lng.
  - `validateAndApplyGeoManual()`: saat input valid → field jadi hijau + icon checklist hijau `✓` + badge "Valid & Aktif" + koordinat langsung di-apply real-time ke tab aktif (tanpa toggle ulang).
  - Setiap ketik di `geo-manual` atau ganti mode ke Manual → kalau toggle GPS ON, koordinat langsung push via `GEO_SET`.

### v1.3.0 (2026-08-06)
- **Side Panel + Console Log.**
  - `manifest.json`: tambah permission `sidePanel`, `side_panel.default_path = sidepanel.html`, hapus `default_popup`.
  - `background.js`: `chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true})` — klik icon extension langsung buka side panel.
  - Logging engine `addLog(category, message, level)` → simpan 100 log terbaru di `chrome.storage.local` + broadcast `LOG_EVENT`.
  - `sidepanel.html` / `sidepanel.js`: 2 tab (Controls + Console Log) dengan filter kategori, Clear/Copy log.
  - `popup.html` di-redirect jadi pesan arahan ke Side Panel.

### v1.2.x (sebelumnya)
- GPS spoof dari `geospoof` open-source: override `Geolocation.prototype`, `Permissions.prototype.query`, prototype-matched `GeolocationPosition`/`GeolocationCoordinates`.
- Strong iOS spoof (hapus sinyal Chromium: `window.chrome`, `navigator.userAgentData`).
- JS Response Override via CDP Fetch (prepend patch `security-guard.js`).

---

## Fitur

1. **JS Response Override** — intercept response JS via CDP Fetch, prepend patch ke `security-guard.js`.
2. **Strong iOS Spoof** — content script MAIN-world patch `navigator`/`screen`/touch + hapus sinyal Chromium sebelum page script jalan. Plus **Client Hints stripping**: `sec-ch-ua*` di-REMOVE via declarativeNetRequest saat UA Spoof ON, jadi server fallback ke UA iPhone Safari (gak deteksi "Chromium"). Native iOS Safari clean di Network Inspector.
3. **Geolocation Spoof** — 50 preset acak (radius 60m) atau manual (`lat, lng`), toggle ON/OFF beneran.
4. **Proxy Route** — route traffic via proxy IP Indonesia. Di Proxy Config ada selector **Mode**: **Manual** (isi `socks5://host:port` / `host:port` + Target Host, wajib diisi) atau **Auto** (input manual di-disable, extension cari proxy ID hidup dalam radius 100km dari titik GPS spoof, test koneksi beneran, lalu set yang jalan). Default Manual: `socks5://43.218.127.193:443` + Target Host `presensi.kemendesa.go.id` (HANYA site itu yang lewat proxy, sisanya DIRECT). Kosongkan Target Host = semua trafik lewat proxy.
5. **Side Panel UI** — Controls + Console Log real-time.
6. **Bypass All** — nyalain/matiin semua toggle sekaligus (state Active/Deactivate).

---

## Proxy Sendiri (Direct SOCKS — otomatis, gak perlu setup)

Extension connect **langsung** ke SOCKS proxy di AWS Jakarta via port 443 (yang tembus ISP, gak kayak port 1080/8443 yang sering diblokir DPI). Gak perlu SSH tunnel, gak perlu script manual, gak perlu setup di OS lain.

**Cara pakai:**
1. Buka Proxy Config → Mode: **Manual**
2. Proxy URL: `socks5://43.218.127.193:443` (sudah default)
3. Toggle Proxy Route ON → IP keluar = `43.218.127.193` (Jakarta)

**Infra:** Instance `i-0c86dec9fd612a9f1` (PublicIP `43.218.127.193`, t3.micro free tier, ap-southeast-3c). 3proxy di-compile dari source, bind port 443, systemd persistent (`WantedBy=multi-user.target` → otomatis jalan saat instance reboot).

**Cross-device:** Install extension di laptop/Windows lain → proxy tetap `socks5://43.218.127.193:443` → IP keluar sama (43.218.127.193). Gak perlu bawa apa-apa selain extension.

---

## Cara Load (Unpacked)
1. Buka `chrome://extensions`
2. Aktifkan **Developer mode** (kanan atas)
3. Klik **Load unpacked** → pilih folder `eh-presensi`
4. Klik icon extension di toolbar → Side Panel langsung kebuka di kanan

---

## Tutorial Penggunaan

### A. Bypass Presensi (Cepat — Rekomendasi)
1. Buka `presensi.kemendesa.go.id` di tab.
2. Klik icon extension → Side Panel kebuka.
3. Klik tombol besar **Bypass All** (biru).
   - Semua toggle (UA Spoof, JS Override, Geo Spoof, Proxy) nyala sekaligus.
   - Tab otomatis **reload** → config langsung jalan di halaman.
4. Cek Console Log (tab Log): harus ada badge `INJECT`, `PATCH`, `PROXY`, `UA`, `GEO`.
5. Lakukan presensi seperti biasa. Selesai.

Untuk matiin semua: klik tombol merah **Deactivate**.

### B. Spoof Device jadi iOS Safari (Agar gak ke-deteksi Chromium)
1. Di card **iOS Safari Fingerprint**, toggle **ON**.
2. Extension hapus sinyal Chromium (`window.chrome`, `navigator.userAgentData`) + strip `sec-ch-ua*` via DNR.
3. Cek di DevTools → Network → buka request ke `presensi.kemendesa.go.id` → header `sec-ch-ua` **tidak ada**, `user-agent` = iPhone Safari.

### C. Spoof GPS Lokasi
1. Di card **GPS Location Spoof**, toggle **ON**.
2. Pilih mode:
   - **Auto**: koordinat acak dalam radius 60m dari titik pusat Jakarta (otomatis tiap reload).
   - **Manual**: isi `lat, lng` (misal `-6.343295, 106.858673`) → field jadi hijau + centang ✓ = valid & aktif.
3. Buka situs yang butuh lokasi → bakal baca koordinat spoof, bukan GPS asli.

Catatan: Proxy Auto (bagian D) pakai titik GPS spoof ini sebagai **anchor radius 100km** untuk cari proxy. Jadi set GPS dulu sebelum Auto proxy biar akurat.

### D. Proxy IP Jakarta
**Manual (stabil, rekomendasi untuk presensi beneran):**
1. Proxy Config → Mode: **Manual**.
2. Proxy URL: `socks5://43.218.127.193:443` (sudah default).
3. Target Host: `presensi.kemendesa.go.id` (cuma site itu lewat proxy) — atau **kosongkan** kalau mau semua trafik (Blacklist mode).
4. Toggle **Proxy Route** ON → card bawah nampilin detail: `Protokol: socks5 · Latency: 120ms · IP keluar: 43.218.127.193 · Lokasi: Jakarta, Amazon, ID`.
5. Icon toolbar nunjukkin badge hijau `WL` (whitelist) atau `ON` (blacklist).
6. Klik **"+ Simpan proxy ini"** → proxy masuk ke list profil tersimpan. Next time tinggal klik list item untuk activate.
7. Kalau proxy butuh auth: centang **"Proxy ber-auth"** → isi username/password → otomatis login (gak ada prompt).

**Auto (gratis, experiment):**
1. Proxy Config → Mode: **Auto**.
2. Target Host tetap kelihatan (default `presensi.kemendesa.go.id`). Kosongkan kalau mau tes IP di semua situs.
3. Klik **Auto (ID ≤100km)**.
4. Checklist 5 tahap muncul satu per satu (delay 3 detik):
   ```
   ⏳ ① Mengambil daftar proxy ID
   ✅ ① ...
   ⏳ ② Memfilter radius 100km
   ...
   ✅ ⑤ Memverifikasi IP keluar
   ```
5. Kalau dapat proxy → tab reload otomatis, card nampilin `AKTIF: http x.x.x.x:port (Ykm, IP z.z.z.z)`.
6. Catatan: proxy gratisan umur pendek. Kalau mylocation.org tetap IP asli → proxy mati, pakai Manual AWS.

### E. Cek Status Real-time
- Card **Proxy Route** bawah: update langsung pas lo ketik URL / ganti mode / toggle.
- Tab **Log**: semua event (INJECT/PATCH/PROXY/UA/GEO) muncul real-time dengan timestamp + badge kategori.

---

## File
- `manifest.json` — config + version
- `background.js` — service worker: CDP Fetch, Emulation, geo state, logging, side panel
- `sidepanel.html` / `sidepanel.js` — UI side panel (Controls + Console Log)
- `popup.html` — fallback pesan (side panel mode)
- `spoof.js` — MAIN-world device fingerprint + geolocation patch
- `popup.js` — legacy popup logic (mirror)
- `proxy-auto.js` — modul auto-proxy (fetch ID + geolocate + filter radius + live-test); di-inline ke background.js saat build
