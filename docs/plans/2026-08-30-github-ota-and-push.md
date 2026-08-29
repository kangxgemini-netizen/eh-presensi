# Spesifikasi & Rencana Implementasi: GitHub OTA Update Checker & Push Repo

## 1. Arsitektur OTA Update Ekstensi
- **Target Repo**: `https://github.com/kangxgemini-netizen/eh-presensi`
- **Mekanisme Check**:
  1. Saat Side Panel dibuka (`load()`), ekstensi mengambil versi remote via GitHub Raw API:
     `https://raw.githubusercontent.com/kangxgemini-netizen/eh-presensi/main/manifest.json`
  2. Bandingkan `remote_version` vs `local_version` (`chrome.runtime.getManifest().version`) menggunakan semver comparator.
  3. Jika `remote_version > local_version`:
     - Tampilkan Alert Banner (Shadcn Style) di bagian paling atas Side Panel.
     - Sediakan tombol **"Update Sekarang"** (membuka repo / panduan `git pull`) dan **"Lihat Changelog"**.
     - Muncul badge titik accent di header.

## 2. Struktur Komponen UI (`sidepanel.html` & `sidepanel.js`)
- **Alert Banner**:
  - Semantic container: `.ota-banner`
  - Info: Versi rilis baru & ringkasan perubahan.
  - Action CTA: Tombol direct link ke repo GitHub / download ZIP.

## 3. Langkah Git & Relogin Akun `kangxgemini-netizen`
1. Otentikasi GitHub CLI (`gh`) ke akun `kangxgemini-netizen` via Device Code Flow.
2. Inisialisasi git di folder extension (`git init`).
3. Set config git user (`kangxgemini-netizen` / `kangxgemini@gmail.com`).
4. Buat repo baru di GitHub `eh-presensi` via `gh repo create kangxgemini-netizen/eh-presensi --public --source=. --push`.
5. Push commit awal versi `v1.4.32` lengkap ke branch `main`.
