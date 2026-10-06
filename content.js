// content.js — Content script running on presensi.kemendesa.go.id
(function () {
  const REVAMP_STYLE_ID = "__eh_revamp_ui_style__";
  const DUAL_ACTIONS_ID = "eh-absen-dual-actions";
  const CEK_LOKASI_ACTIONS_ID = "eh-cek-lokasi-actions-wrap";
  const RECENT_ABSENSI_ID = "eh-recent-absensi-wrap";

  function isDashboard() {
    const path = (window.location.pathname || "").toLowerCase();
    return path === "" || path === "/" || path.includes("/dashboard") || path.endsWith("/dashboard") || path.includes("index");
  }

  function isCekLokasi() {
    const path = (window.location.pathname || "").toLowerCase();
    return path.includes("cek-lokasi");
  }

  const NAV_ICONS = [
    // 0: Beranda (Solid Home)
    '<svg class="eh-nav-icon" viewBox="0 0 24 24"><path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"/><path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z"/></svg>',
    // 1: Data Absen (Solid Chart Bar)
    '<svg class="eh-nav-icon" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm4.5 9a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v3a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-3zm4.5-4.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v7.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-7.5zm4.5-3a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V7.5z" clip-rule="evenodd"/></svg>',
    // 2: Ubah Password (Solid Lock)
    '<svg class="eh-nav-icon" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clip-rule="evenodd"/></svg>',
    // 3: Keluar (Solid Logout)
    '<svg class="eh-nav-icon" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.44l-1.72-1.72a.75.75 0 010-1.06z" clip-rule="evenodd"/></svg>'
  ];

  const CSS = `
    /* ========================================================
       Global Base & Typography System (UI/UX Pro Max)
       ======================================================== */
    html.eh-revamp-active,
    body.eh-revamp-active {
      background: #f8fafc !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
    }

    /* Container constraint */
    .eh-revamp-active .dashboard-app,
    body.eh-revamp-active .dashboard-app,
    .eh-revamp-active .app,
    body.eh-revamp-active .app {
      max-width: 420px !important;
      margin: 0 auto !important;
      padding-bottom: 128px !important;
      box-sizing: border-box !important;
    }

    /* ========================================================
       1. Header: Logo Paling Kiri, Hamburger Paling Kanan
       ======================================================== */
    /* Scoped to a header that actually holds the logo: the site also uses the
       class name for page title bars (e.g. /absensi "Riwayat Absensi") that
       must keep their own native layout. */
    .eh-revamp-active .dash-header:has(img),
    body.eh-revamp-active .dash-header:has(img) {
      padding: 10px 0 6px 0 !important;
      position: relative !important;
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }

    .eh-revamp-active .dash-header > div:has(> img),
    body.eh-revamp-active .dash-header > div:has(> img) {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 0 !important;
      margin: 0 !important;
      gap: 0 !important;
      width: 100% !important;
      box-sizing: border-box !important;
      position: relative !important;
    }

    .eh-revamp-active .dash-header img,
    body.eh-revamp-active .dash-header img {
      height: 52px !important;
      width: auto !important;
      object-fit: contain !important;
      display: block !important;
      margin: 0 !important;
      cursor: pointer !important;
      user-select: none !important;
      -webkit-tap-highlight-color: transparent !important;
      transition: opacity 0.15s ease, transform 0.15s ease !important;
      flex-shrink: 0 !important;
    }

    .eh-revamp-active .dash-header img:active,
    body.eh-revamp-active .dash-header img:active {
      opacity: 0.8 !important;
      transform: scale(0.97) !important;
    }

    /* Navbar Center Time & Date */
    .eh-nav-clock {
      position: absolute !important;
      left: 50% !important;
      top: 50% !important;
      transform: translate(-50%, -50%) !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      pointer-events: none !important;
      user-select: none !important;
      line-height: 1.15 !important;
      white-space: nowrap !important;
      z-index: 1 !important;
    }

    .eh-nav-clock-time {
      font-size: 15.5px !important;
      font-weight: 800 !important;
      color: #0f172a !important;
      letter-spacing: 0.02em !important;
      font-variant-numeric: tabular-nums !important;
    }

    .eh-nav-clock-date {
      font-size: 11px !important;
      font-weight: 500 !important;
      color: #64748b !important;
      margin-top: 1px !important;
    }

    .eh-revamp-active .dash-header #avatar,
    body.eh-revamp-active .dash-header #avatar,
    .eh-revamp-active #avatar,
    body.eh-revamp-active #avatar {
      display: none !important;
    }

    /* Completely hide the text div immediately following the logo img */
    .eh-revamp-active .dash-header img + div,
    body.eh-revamp-active .dash-header img + div,
    .eh-revamp-active .eh-brand-title {
      display: none !important;
    }

    /* Hamburger Menu Button (Pojok Kanan Sejajar Logo) — icon only:
       no background, no stroke, no shadow; only the tap-target area remains. */
    .eh-hamburger-btn {
      width: 42px !important;
      height: 42px !important;
      border-radius: 14px !important;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      outline: none !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      flex-shrink: 0 !important;
      margin: 0 0 0 auto !important;
      padding: 0 !important;
      color: #1e293b !important;
      transition: color 0.15s ease, opacity 0.15s ease, transform 0.15s ease !important;
      -webkit-tap-highlight-color: transparent !important;
      user-select: none !important;
    }

    .eh-hamburger-btn:hover {
      color: #0f172a !important;
      opacity: 0.72 !important;
    }

    .eh-hamburger-btn:active,
    .eh-hamburger-btn.is-active {
      color: #2563eb !important;
      transform: scale(0.95) !important;
    }

    /* Dropdown Nav Menu */
    .eh-nav-dropdown {
      display: none;
      position: absolute !important;
      top: calc(100% + 8px) !important;
      right: 0 !important;
      width: 250px !important;
      background: #ffffff !important;
      border-radius: 18px !important;
      box-shadow: 0 16px 40px -6px rgba(15, 23, 42, 0.22), 0 4px 16px rgba(15, 23, 42, 0.08) !important;
      border: 1px solid rgba(226, 232, 240, 0.95) !important;
      padding: 8px !important;
      box-sizing: border-box !important;
      z-index: 999999 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    }

    .eh-nav-dropdown.is-open {
      display: block !important;
      animation: ehDropdownIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
    }

    @keyframes ehDropdownIn {
      from {
        opacity: 0;
        transform: translateY(-8px) scale(0.94);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Backdrop Overlay */
    .eh-nav-backdrop {
      display: none;
      position: fixed !important;
      inset: 0 !important;
      background: rgba(15, 23, 42, 0.32) !important;
      backdrop-filter: blur(2px) !important;
      -webkit-backdrop-filter: blur(2px) !important;
      z-index: 999998 !important;
    }

    .eh-nav-backdrop.is-open {
      display: block !important;
    }

    /* ========================================================
       2. Profil Pengguna (2 Baris 1 Kolom Terpusat)
       ======================================================== */
    .eh-revamp-active.user-card,
    .eh-revamp-active .user-card,
    body.eh-revamp-active .user-card,
    html.eh-revamp-active .user-card {
      padding: 24px 20px !important;
      border-radius: 20px !important;
      background: #ffffff !important;
      box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04) !important;
      border: 1px solid rgba(226, 232, 240, 0.85) !important;
      margin-top: 10px !important;
      margin-bottom: 16px !important;
    }

    .eh-revamp-active .user-top,
    body.eh-revamp-active .user-top,
    html.eh-revamp-active .user-top {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      gap: 14px !important;
      width: 100% !important;
    }

    .eh-revamp-active .user-top .user-action,
    body.eh-revamp-active .user-top .user-action,
    html.eh-revamp-active .user-top .user-action {
      order: 1 !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      width: 100% !important;
      margin: 0 !important;
    }

    .eh-revamp-active .user-top .user-action .user-photo,
    body.eh-revamp-active .user-top .user-action .user-photo,
    html.eh-revamp-active .user-top .user-action .user-photo {
      width: 96px !important;
      height: 96px !important;
      border-radius: 50% !important;
      object-fit: cover !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
      display: block !important;
      margin: 0 auto !important;
      border: 3px solid #ffffff !important;
      outline: 1px solid rgba(226, 232, 240, 0.8) !important;
    }

    .eh-revamp-active .user-top .user-text,
    body.eh-revamp-active .user-top .user-text,
    html.eh-revamp-active .user-top .user-text {
      order: 2 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      width: 100% !important;
      gap: 4px !important;
    }

    .eh-revamp-active .user-top .user-text strong,
    .eh-revamp-active .user-top .user-text #pegawaiNama,
    body.eh-revamp-active .user-top .user-text strong,
    body.eh-revamp-active .user-top .user-text #pegawaiNama,
    html.eh-revamp-active .user-top .user-text strong,
    html.eh-revamp-active .user-top .user-text #pegawaiNama {
      font-size: 17px !important;
      font-weight: 700 !important;
      text-align: center !important;
      line-height: 1.3 !important;
      color: #0f172a !important;
      letter-spacing: -0.01em !important;
    }

    .eh-revamp-active .user-top .user-text p,
    .eh-revamp-active .user-top .user-text #pegawaiJabatan,
    body.eh-revamp-active .user-top .user-text p,
    body.eh-revamp-active .user-top .user-text #pegawaiJabatan,
    html.eh-revamp-active .user-top .user-text p,
    html.eh-revamp-active .user-top .user-text #pegawaiJabatan {
      font-size: 13.5px !important;
      text-align: center !important;
      margin: 0 !important;
      color: #475569 !important;
      font-weight: 500 !important;
    }

    .eh-revamp-active .user-top .user-text small,
    .eh-revamp-active .user-top .user-text #pegawaiUnit,
    body.eh-revamp-active .user-top .user-text small,
    body.eh-revamp-active .user-top .user-text #pegawaiUnit,
    html.eh-revamp-active .user-top .user-text small,
    html.eh-revamp-active .user-top .user-text #pegawaiUnit {
      font-size: 11.5px !important;
      text-align: center !important;
      color: #64748b !important;
      max-width: 420px !important;
      margin: 0 auto !important;
      line-height: 1.4 !important;
    }

    /* ========================================================
       3. Hapus/Sembunyikan Kartu Jam (Clock Card) pada Revamp UI
       ======================================================== */
    .eh-revamp-active .clock-card,
    body.eh-revamp-active .clock-card,
    html.eh-revamp-active .clock-card {
      display: none !important;
    }

    /* ========================================================
       4. Tombol Absen Dashboard (Fixed Bottom Single CTA Bar)
       ======================================================== */
    /* Hide #btnAbsen ONLY on Dashboard */
    .eh-revamp-active .dashboard-app #btnAbsen,
    body.eh-revamp-active .dashboard-app #btnAbsen {
      display: none !important;
    }

    .eh-absen-actions-wrap {
      position: fixed !important;
      bottom: 0px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: 100% !important;
      max-width: 420px !important;
      box-sizing: border-box !important;
      z-index: 9999 !important;
      background: linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, rgba(248, 250, 252, 0.45) 30%, rgba(248, 250, 252, 0.92) 65%, rgb(248, 250, 252) 85%, rgb(248, 250, 252) 100%) !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border: none !important;
      box-shadow: none !important;
      padding: 64px 16px calc(14px + env(safe-area-inset-bottom, 0px)) 16px !important;
      margin: 0px !important;
      display: flex !important;
      flex-direction: column !important;
      pointer-events: none !important;
    }

    .eh-btn-cta-single {
      pointer-events: auto !important;
      width: 100% !important;
      height: 52px !important;
      padding: 0 20px !important;
      border-radius: 16px !important;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
      color: #ffffff !important;
      font-size: 15.5px !important;
      font-weight: 700 !important;
      border: none !important;
      box-shadow: 0 8px 24px -4px rgba(37, 99, 235, 0.4) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 10px !important;
      cursor: pointer !important;
      user-select: none !important;
      -webkit-tap-highlight-color: transparent !important;
      touch-action: manipulation !important;
      transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    .eh-btn-cta-single:hover {
      box-shadow: 0 10px 28px -4px rgba(37, 99, 235, 0.5) !important;
      filter: brightness(1.03) !important;
    }

    .eh-btn-cta-single:active {
      transform: scale(0.97) !important;
    }

    .eh-btn-cta-single svg {
      flex-shrink: 0 !important;
    }

    /* ========================================================
       5. Section Container Khusus 5 List Riwayat Presensi
       ======================================================== */
    .eh-recent-card {
      margin-top: 18px !important;
      margin-bottom: 24px !important;
      padding: 18px 16px !important;
      border-radius: 20px !important;
      background: #ffffff !important;
      border: 1px solid rgba(226, 232, 240, 0.85) !important;
      box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04) !important;
    }

    .eh-recent-head {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      min-height: 40px !important;
      padding-bottom: 12px !important;
      margin-bottom: 14px !important;
      border-bottom: 1px solid #f1f5f9 !important;
      box-sizing: border-box !important;
    }

    .eh-recent-head-title {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      font-size: 15px !important;
      font-weight: 700 !important;
      color: #0f172a !important;
      letter-spacing: -0.01em !important;
      line-height: 1 !important;
    }

    .eh-recent-head-icon-wrap {
      width: 32px !important;
      height: 32px !important;
      border-radius: 9px !important;
      background: #dbeafe !important;
      color: #2563eb !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex-shrink: 0 !important;
    }

    .eh-recent-head-icon {
      width: 18px !important;
      height: 18px !important;
      fill: #2563eb !important;
      flex-shrink: 0 !important;
    }

    .eh-recent-link {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: 28px !important;
      gap: 4px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      color: #2563eb !important;
      text-decoration: none !important;
      padding: 0 10px !important;
      border-radius: 8px !important;
      background: #eff6ff !important;
      line-height: 1 !important;
      box-sizing: border-box !important;
      transition: background 0.15s ease !important;
    }

    .eh-recent-link:hover {
      background: #dbeafe !important;
    }

    .eh-link-arrow {
      width: 14px !important;
      height: 14px !important;
      flex-shrink: 0 !important;
    }

    .eh-recent-body {
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
    }

    .eh-recent-row {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 10px 12px !important;
      border-radius: 12px !important;
      background: #f8fafc !important;
      border: 1px solid #f1f5f9 !important;
      transition: background 0.15s ease !important;
    }

    .eh-recent-row:hover {
      background: #f1f5f9 !important;
    }

    .eh-recent-col-info {
      display: flex !important;
      flex-direction: column !important;
      gap: 3px !important;
    }

    .eh-recent-date-text {
      font-size: 13px !important;
      font-weight: 700 !important;
      color: #1e293b !important;
      line-height: 1.2 !important;
    }

    .eh-recent-times {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      font-size: 11.5px !important;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace !important;
      font-variant-numeric: tabular-nums !important;
      color: #64748b !important;
      font-weight: 600 !important;
    }

    .eh-time-slot {
      display: inline-flex !important;
      align-items: center !important;
      gap: 4px !important;
    }

    .eh-time-sep {
      color: #cbd5e1 !important;
      font-size: 10px !important;
    }

    .eh-dot {
      width: 6px !important;
      height: 6px !important;
      border-radius: 50% !important;
      display: inline-block !important;
    }

    .eh-dot-in { background: #10b981 !important; }
    .eh-dot-out { background: #3b82f6 !important; }

    .eh-status-pill {
      font-size: 10.5px !important;
      font-weight: 700 !important;
      padding: 4px 10px !important;
      border-radius: 9999px !important;
      letter-spacing: 0.02em !important;
      line-height: 1 !important;
      display: inline-block !important;
    }

    .eh-pill-hadir {
      background: #ecfdf5 !important;
      color: #047857 !important;
      border: 1px solid #a7f3d0 !important;
    }

    .eh-pill-wfh {
      background: #eff6ff !important;
      color: #1d4ed8 !important;
      border: 1px solid #bfdbfe !important;
    }

    .eh-pill-libur {
      background: #f1f5f9 !important;
      color: #64748b !important;
      border: 1px solid #e2e8f0 !important;
    }

    .eh-pill-danger {
      background: #fff1f2 !important;
      color: #be123c !important;
      border: 1px solid #fecdd3 !important;
    }

    /* ========================================================
       6. CTA Button Cek Lokasi (WFO & WFH) — Fixed Bottom CTA Bar
       ======================================================== */
    .eh-revamp-active #btnAbsen:not(.dashboard-app #btnAbsen),
    .eh-revamp-active #btnBukaKamera,
    .eh-revamp-active #btnAbsenSekarang {
      pointer-events: auto !important;
      width: 100% !important;
      height: 52px !important;
      padding: 0 20px !important;
      border-radius: 16px !important;
      font-size: 15.5px !important;
      font-weight: 700 !important;
      border: none !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
      margin: 0 !important;
      transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1) !important;
      user-select: none !important;
      touch-action: manipulation !important;
      -webkit-tap-highlight-color: transparent !important;
    }

    /* Keep hidden dev button hidden unless explicitly opened */
    .eh-revamp-active #btnAbsenDev,
    body.eh-revamp-active #btnAbsenDev {
      display: none !important;
    }

    /* Disabled / Checking Location */
    .eh-revamp-active #btnAbsen:disabled:not(.dashboard-app #btnAbsen),
    .eh-revamp-active #btnAbsen.btn-disabled:not(.dashboard-app #btnAbsen),
    .eh-revamp-active #btnBukaKamera:disabled,
    .eh-revamp-active .btn-disabled {
      background: #e2e8f0 !important;
      background-image: none !important;
      color: #94a3b8 !important;
      box-shadow: none !important;
      cursor: not-allowed !important;
      opacity: 0.85 !important;
      transform: none !important;
    }

    /* Ready / Location verified -> "Lanjutkan" */
    .eh-revamp-active #btnAbsen:not(:disabled):not(.btn-disabled):not(.dashboard-app #btnAbsen),
    .eh-revamp-active #btnBukaKamera:not(:disabled),
    .eh-revamp-active .btn-primary:not(:disabled):not(.btn-disabled),
    .eh-revamp-active .btn-success:not(:disabled):not(.btn-disabled) {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 8px 24px -4px rgba(37, 99, 235, 0.42), 0 2px 6px -1px rgba(37, 99, 235, 0.2) !important;
    }

    .eh-revamp-active #btnAbsen:not(:disabled):not(.btn-disabled):active:not(.dashboard-app #btnAbsen),
    .eh-revamp-active #btnBukaKamera:not(:disabled):active {
      transform: scale(0.97) !important;
      box-shadow: 0 4px 12px -2px rgba(37, 99, 235, 0.3) !important;
    }

    /* ========================================================
       Cek Lokasi Full Height & Flex Fill Map Layout
       ======================================================== */
    .eh-revamp-active .app:has(#mapBox),
    body.eh-revamp-active .app:has(#mapBox) {
      min-height: 100vh !important;
      height: 100vh !important;
      display: flex !important;
      flex-direction: column !important;
      padding: 10px 16px 110px 16px !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
    }

    .eh-revamp-active .app:has(#mapBox) .dash-header,
    body.eh-revamp-active .app:has(#mapBox) .dash-header {
      margin-bottom: 6px !important;
      flex-shrink: 0 !important;
    }

    /* Hide clock/profile card on Cek Lokasi */
    .eh-revamp-active .app:has(#mapBox) .card:has(.clock-wrap),
    body.eh-revamp-active .app:has(#mapBox) .card:has(.clock-wrap),
    .eh-revamp-active .app:has(#mapBox) .card:has(#userPhoto),
    body.eh-revamp-active .app:has(#mapBox) .card:has(#userPhoto),
    .eh-revamp-active .app:has(#mapBox) .card:not(#absenCard):not(#faceCard),
    body.eh-revamp-active .app:has(#mapBox) .card:not(#absenCard):not(#faceCard) {
      display: none !important;
    }

    .eh-revamp-active #absenCard,
    body.eh-revamp-active #absenCard {
      flex: 1 !important;
      display: flex !important;
      flex-direction: column !important;
      margin: 0 !important;
      min-height: 0 !important;
      box-sizing: border-box !important;
    }

    .eh-revamp-active #absenCard > br,
    body.eh-revamp-active #absenCard > br {
      display: none !important;
    }

    /* Cek Lokasi Map & Status */
    .eh-revamp-active #mapBox,
    body.eh-revamp-active #mapBox {
      flex: 1 !important;
      width: 100% !important;
      height: 100% !important;
      min-height: 260px !important;
      border-radius: 18px !important;
      overflow: hidden !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06) !important;
      margin: 12px 0 0 0 !important;
      box-sizing: border-box !important;
    }

    .eh-revamp-active .status-box,
    body.eh-revamp-active .status-box {
      border-radius: 14px !important;
      padding: 12px 16px !important;
      font-weight: 600 !important;
      font-size: 13px !important;
      line-height: 1.4 !important;
      border: 1px solid #e2e8f0 !important;
    }

    .eh-revamp-active .status-box.ok,
    body.eh-revamp-active .status-box.ok {
      background: #ecfdf5 !important;
      color: #065f46 !important;
      border-color: #a7f3d0 !important;
    }

    .eh-revamp-active .status-box.fail,
    body.eh-revamp-active .status-box.fail {
      background: #fff1f2 !important;
      color: #9f1239 !important;
      border-color: #fecdd3 !important;
    }

    .eh-revamp-active .btn-outline,
    body.eh-revamp-active .btn-outline {
      border-radius: 12px !important;
      font-weight: 600 !important;
      font-size: 13px !important;
      padding: 8px 14px !important;
      border: 1px solid #cbd5e1 !important;
      color: #475569 !important;
      background: #ffffff !important;
    }

    /* Ubah Password Form Fields */
    .eh-revamp-active .input,
    body.eh-revamp-active .input {
      border-radius: 14px !important;
      padding: 14px 16px !important;
      border: 1px solid #cbd5e1 !important;
      font-size: 14px !important;
      outline: none !important;
      transition: border-color 0.2s, box-shadow 0.2s !important;
    }

    .eh-revamp-active .input:focus,
    body.eh-revamp-active .input:focus {
      border-color: #2563eb !important;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
    }

    .eh-revamp-active #btnUbahPassword,
    body.eh-revamp-active #btnUbahPassword {
      border-radius: 16px !important;
      padding: 15px !important;
      font-size: 15px !important;
      font-weight: 700 !important;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 8px 20px -4px rgba(37, 99, 235, 0.4) !important;
      border: none !important;
      width: 100% !important;
      cursor: pointer !important;
    }

    /* ========================================================
       7. Bottom Nav Hidden (Replaced by Header Hamburger Menu)
       ======================================================== */
    .eh-revamp-active .bottom-nav,
    body.eh-revamp-active .bottom-nav,
    html.eh-revamp-active .bottom-nav {
      display: none !important;
    }

    /* ========================================================
       8. Bottom Sheet — Pilih Jenis Absen (WFO / WFH)
       ======================================================== */
    .eh-sheet-backdrop {
      position: fixed;
      inset: 0;
      z-index: 2147483000;
      background: rgba(15, 23, 42, 0.48);
      -webkit-backdrop-filter: blur(2px);
      backdrop-filter: blur(2px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }

    .eh-sheet-backdrop.is-open {
      opacity: 1;
      pointer-events: auto;
    }

    .eh-absen-sheet {
      position: fixed;
      left: 50%;
      bottom: 0;
      z-index: 2147483001;
      width: 100%;
      max-width: 440px;
      transform: translate(-50%, 110%);
      background: #ffffff;
      border-radius: 24px 24px 0 0;
      box-shadow: 0 -18px 44px rgba(15, 23, 42, 0.2);
      padding: 10px 18px calc(22px + env(safe-area-inset-bottom, 0px));
      font-family: inherit;
      transition: transform 0.34s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .eh-absen-sheet.is-open {
      transform: translate(-50%, 0);
    }

    .eh-sheet-grabber {
      width: 42px;
      height: 5px;
      border-radius: 999px;
      background: #e2e8f0;
      margin: 0 auto 14px;
    }

    .eh-sheet-title {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 5px;
      letter-spacing: -0.2px;
    }

    .eh-sheet-sub {
      font-size: 13px;
      color: #64748b;
      margin: 0 0 16px;
      line-height: 1.45;
    }

    .eh-sheet-opt {
      display: flex;
      align-items: center;
      gap: 13px;
      width: 100%;
      text-align: left;
      cursor: pointer;
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      padding: 13px;
      margin-bottom: 11px;
      font-family: inherit;
      transition: border-color 0.16s ease, background-color 0.16s ease, transform 0.12s ease;
    }

    .eh-sheet-opt:hover {
      background: #f8fbff;
      transform: translateY(-1px);
    }

    .eh-sheet-opt:active {
      transform: scale(0.985);
    }

    .eh-sheet-opt[data-mode="wfo"]:hover {
      border-color: #93c5fd;
    }

    .eh-sheet-opt[data-mode="wfh"]:hover {
      background: #f6fffb;
      border-color: #a7f3d0;
    }

    .eh-sheet-opt-icon {
      width: 42px;
      height: 42px;
      border-radius: 13px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .eh-sheet-opt-icon svg {
      width: 21px;
      height: 21px;
      display: block;
    }

    .eh-sheet-opt[data-mode="wfo"] .eh-sheet-opt-icon {
      background: #eff6ff;
      color: #2563eb;
    }

    .eh-sheet-opt[data-mode="wfh"] .eh-sheet-opt-icon {
      background: #ecfdf5;
      color: #059669;
    }

    .eh-sheet-opt-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .eh-sheet-opt-title {
      font-size: 14.5px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.25;
    }

    .eh-sheet-opt-desc {
      font-size: 12.2px;
      color: #64748b;
      line-height: 1.4;
    }

    .eh-sheet-opt-arrow {
      width: 18px;
      height: 18px;
      fill: #94a3b8;
      flex-shrink: 0;
    }

    .eh-sheet-cancel {
      width: 100%;
      height: 46px;
      margin-top: 4px;
      border: none;
      background: transparent;
      border-radius: 14px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 700;
      color: #64748b;
      cursor: pointer;
      transition: background-color 0.15s ease, color 0.15s ease;
    }

    .eh-sheet-cancel:hover {
      background: #f1f5f9;
      color: #334155;
    }
  `;

  const HAMBURGER_ID = "ehHamburgerBtn";
  const NAV_DROPDOWN_ID = "ehNavMenuDropdown";
  const NAV_BACKDROP_ID = "ehNavBackdrop";

  function setupHeaderTypography(on) {
    const currentPath = (window.location.pathname || "").toLowerCase();
    if (currentPath.includes("login") || currentPath.includes("auth")) return;

    // The site reuses the class `dash-header` for a second, unrelated element:
    // on /absensi it is the page title bar ("Riwayat Absensi" + Kembali) and
    // holds no logo. Treating it as the global navbar restyles a page title
    // and — because the logo lookup bails out — never creates the nav clock or
    // the hamburger, which is why those pages had no navbar. Only adopt a
    // header that actually carries the logo; otherwise inject our own above
    // the page content and leave the page's own title bar untouched.
    const foundHeader = document.querySelector(".dash-header");
    const foundImg = foundHeader
      ? foundHeader.querySelector('img[src*="logo.png"]') || foundHeader.querySelector("img")
      : null;
    let dashHeader =
      foundHeader && (foundHeader.dataset.ehInjected === "1" || foundImg) ? foundHeader : null;

    const targetContainer =
      document.querySelector(".dashboard-app") ||
      document.querySelector(".app") ||
      document.body;
    if (!targetContainer) return;

    if (!dashHeader) {
      if (!on) return;
      dashHeader = document.createElement("div");
      dashHeader.className = "dash-header";
      dashHeader.dataset.ehInjected = "1";
      dashHeader.innerHTML = `
        <div style="align-items: center !important; gap: 14px; padding: 0px !important; position: relative; margin: 0px !important; box-sizing: border-box !important; display: flex !important; justify-content: space-between !important; width: 100% !important;">
          <img src="/assets/logo.png" alt="Logo" style="height: 52px !important; width: auto !important; object-fit: contain !important; margin: 0px auto 0px 0px !important; display: block !important;">
        </div>
      `;
      targetContainer.insertBefore(dashHeader, targetContainer.firstChild);
    } else if (on && dashHeader.parentElement === targetContainer && targetContainer.firstChild !== dashHeader) {
      targetContainer.insertBefore(dashHeader, targetContainer.firstChild);
    }

    const avatar = document.getElementById("avatar");
    if (avatar) avatar.style.display = on ? "none" : "";

    // Remove any previously injected brand title
    const brandH2 = dashHeader.querySelector(".eh-brand-title");
    if (brandH2) brandH2.remove();

    let img = dashHeader.querySelector('img[src*="logo.png"]') || dashHeader.querySelector("img");
    if (!img) img = on ? ensureHeaderLogo(dashHeader) : null;
    if (!img) return;

    const container = img.parentElement;
    const textDiv = img.nextElementSibling;

    if (!on) {
      if (window.__ehNavClockInterval) {
        clearInterval(window.__ehNavClockInterval);
        window.__ehNavClockInterval = null;
      }
      const navClock = document.getElementById("ehNavClock");
      if (navClock) navClock.remove();

      if (dashHeader.dataset.ehInjected === "1") {
        dashHeader.remove();
        return;
      }
      // Native header restored: drop the dashboard-click hijack so the logo
      // behaves like the site's own again once revamp is off.
      if (img._ehClickBound) {
        if (img._ehClickH) img.removeEventListener("click", img._ehClickH);
        if (img._ehKeyH) img.removeEventListener("keydown", img._ehKeyH);
        img._ehClickBound = false;
        img._ehClickH = null;
        img._ehKeyH = null;
        img.style.removeProperty("cursor");
        img.removeAttribute("role");
        img.removeAttribute("tabindex");
        img.removeAttribute("aria-label");
      }
      if (textDiv) textDiv.style.removeProperty("display");
      if (container) {
        container.style.removeProperty("display");
        container.style.removeProperty("justify-content");
        container.style.removeProperty("width");
      }
      const btn = document.getElementById(HAMBURGER_ID);
      if (btn) btn.remove();
      const menu = document.getElementById(NAV_DROPDOWN_ID);
      if (menu) menu.remove();
      const backdrop = document.getElementById(NAV_BACKDROP_ID);
      if (backdrop) backdrop.remove();
      dashHeader.style.paddingRight = "";
      return;
    }

    // Hide text div — but never hide our own injected bits: `textDiv` is
    // `img.nextElementSibling`, and on pages where we build the header row as
    // [logo, clock] that sibling IS the nav clock, which then vanished while
    // every other page kept it (it is appended last there).
    const isOurs =
      !!textDiv &&
      (textDiv.dataset.ehInjected === "1" ||
        /^eh/i.test(textDiv.id || "") ||
        (typeof textDiv.className === "string" && /(^|\s)eh-/.test(textDiv.className)));
    if (
      textDiv &&
      !isOurs &&
      textDiv.id !== HAMBURGER_ID &&
      !textDiv.classList.contains("eh-nav-dropdown")
    ) {
      textDiv.style.setProperty("display", "none", "important");
    }

    // Container: Logo on far left, clock in center, hamburger on far right
    dashHeader.style.setProperty("display", "block", "important");
    dashHeader.style.setProperty("width", "100%", "important");
    dashHeader.style.setProperty("padding", "10px 0 6px 0", "important");
    dashHeader.style.setProperty("box-sizing", "border-box", "important");

    if (container) {
      container.style.position = "relative";
      container.style.setProperty("display", "flex", "important");
      container.style.setProperty("align-items", "center", "important");
      container.style.setProperty("justify-content", "space-between", "important");
      container.style.setProperty("width", "100%", "important");
      container.style.setProperty("padding", "0", "important");
      container.style.setProperty("margin", "0", "important");
      container.style.setProperty("box-sizing", "border-box", "important");
    }

    // Logo on far left & clickable to /dashboard
    img.style.setProperty("margin", "0", "important");
    img.style.setProperty("height", "52px", "important");
    img.style.setProperty("width", "auto", "important");
    img.style.setProperty("object-fit", "contain", "important");
    img.style.setProperty("display", "block", "important");
    img.style.setProperty("cursor", "pointer", "important");
    img.setAttribute("role", "button");
    img.setAttribute("tabindex", "0");
    img.setAttribute("aria-label", "Kembali ke Dashboard");

    if (!img._ehClickBound) {
      img._ehClickBound = true;
      img._ehClickH = (e) => {
        e.preventDefault();
        window.location.href = "/dashboard";
      };
      img._ehKeyH = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.location.href = "/dashboard";
        }
      };
      img.addEventListener("click", img._ehClickH);
      img.addEventListener("keydown", img._ehKeyH);
    }

    // Navbar Center: Time and Date — parented to the header root, not to the
    // logo's row, so the "hide text div" pass (img.nextElementSibling) can
    // never pick the clock up as text. `.dash-header` is position:relative,
    // so the absolute centering keeps working either way.
    let navClock = document.getElementById("ehNavClock");
    if (!navClock) {
      navClock = document.createElement("div");
      navClock.id = "ehNavClock";
      navClock.className = "eh-nav-clock";
    }
    if (navClock.parentElement !== dashHeader) dashHeader.appendChild(navClock);

    const navDays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const navMonths = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    function updateNavClock() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      const dayName = navDays[now.getDay()];
      const dateNum = now.getDate();
      const monthName = navMonths[now.getMonth()];
      const year = now.getFullYear();
      const timeStr = `${h}.${m}.${s}`;
      const dateStr = `${dayName}, ${dateNum} ${monthName} ${year}`;

      const el = document.getElementById("ehNavClock");
      if (!el) return;

      let timeEl = document.getElementById("ehNavTime");
      let dateEl = document.getElementById("ehNavDate");
      if (!timeEl || !dateEl || !el.contains(timeEl) || !el.contains(dateEl)) {
        el.innerHTML = `<div id="ehNavTime" class="eh-nav-clock-time"></div><div id="ehNavDate" class="eh-nav-clock-date"></div>`;
        timeEl = document.getElementById("ehNavTime");
        dateEl = document.getElementById("ehNavDate");
        if (!timeEl || !dateEl) return;
      }

      // Write through a single text node (characterData, invisible to our
      // childList observer) and only when the value changed. An unconditional
      // innerHTML rewrite here feeds the MutationObserver a fresh mutation on
      // every call, which loops back into setupHeaderTypography and starves
      // the main thread — that was the page freeze.
      function setText(target, str) {
        if (target.textContent === str) return;
        const onlyText = target.childNodes.length === 1 && target.firstChild.nodeType === 3;
        if (onlyText) {
          target.firstChild.data = str;
        } else {
          target.textContent = str;
        }
      }
      setText(timeEl, timeStr);
      setText(dateEl, dateStr);
    }

    updateNavClock();

    if (!window.__ehNavClockInterval) {
      window.__ehNavClockInterval = setInterval(updateNavClock, 1000);
    }

    // Clean any old spacers
    const spacer = container.querySelector(".eh-header-spacer");
    if (spacer) spacer.remove();

    // 1. Create or get Backdrop
    let backdrop = document.getElementById(NAV_BACKDROP_ID);
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = NAV_BACKDROP_ID;
      backdrop.className = "eh-nav-backdrop";
      document.body.appendChild(backdrop);
    }

    // 2. Create or get Hamburger Button
    let btn = document.getElementById(HAMBURGER_ID);
    if (!btn) {
      btn = document.createElement("button");
      btn.id = HAMBURGER_ID;
      btn.type = "button";
      btn.className = "eh-hamburger-btn";
      btn.setAttribute("aria-label", "Buka Menu Navigasi");
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" style="width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round;">
          <path d="M4 7h16M4 12h16M4 17h16"/>
        </svg>
      `;
      container.appendChild(btn);
    }

    // 3. Create or get Dropdown Menu
    let menu = document.getElementById(NAV_DROPDOWN_ID);
    if (!menu) {
      menu = document.createElement("div");
      menu.id = NAV_DROPDOWN_ID;
      menu.className = "eh-nav-dropdown";

      const currentPath = (window.location.pathname || "").toLowerCase();
      const isBeranda = currentPath.includes("dashboard") || currentPath === "/" || currentPath === "";
      const isDataAbsen = currentPath.includes("absensi");
      const isPassword = currentPath.includes("ubah-password");

      menu.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <a href="/dashboard" id="ehNavBeranda" style="display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 12px; text-decoration: none; color: #1e293b; ${isBeranda ? "background: #eff6ff;" : ""}">
            <div style="width: 32px; height: 32px; border-radius: 10px; background: ${isBeranda ? "#dbeafe" : "#f1f5f9"}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: ${isBeranda ? "#2563eb" : "#64748b"};">
              <svg style="width: 17px; height: 17px; fill: currentColor;" viewBox="0 0 24 24"><path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"/><path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z"/></svg>
            </div>
            <div style="display: flex; flex-direction: column; flex: 1; min-width: 0;">
              <span style="font-size: 13px; font-weight: ${isBeranda ? "700" : "600"}; color: ${isBeranda ? "#1d4ed8" : "#0f172a"}; line-height: 1.2;">Beranda</span>
              <span style="font-size: 10.5px; color: ${isBeranda ? "#3b82f6" : "#64748b"};">Halaman utama</span>
            </div>
            <svg style="width: 13px; height: 13px; fill: none; stroke: ${isBeranda ? "#93c5fd" : "#cbd5e1"}; stroke-width: 2.2; stroke-linecap: round;" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </a>

          <a href="/absensi" id="ehNavDataAbsen" style="display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 12px; text-decoration: none; color: #1e293b; ${isDataAbsen ? "background: #eff6ff;" : ""}">
            <div style="width: 32px; height: 32px; border-radius: 10px; background: ${isDataAbsen ? "#dbeafe" : "#f1f5f9"}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: ${isDataAbsen ? "#2563eb" : "#64748b"};">
              <svg style="width: 17px; height: 17px; fill: currentColor;" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm4.5 9a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v3a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-3zm4.5-4.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v7.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-7.5zm4.5-3a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V7.5z" clip-rule="evenodd"/></svg>
            </div>
            <div style="display: flex; flex-direction: column; flex: 1; min-width: 0;">
              <span style="font-size: 13px; font-weight: ${isDataAbsen ? "700" : "600"}; color: ${isDataAbsen ? "#1d4ed8" : "#0f172a"}; line-height: 1.2;">Data Absen</span>
              <span style="font-size: 10.5px; color: ${isDataAbsen ? "#3b82f6" : "#64748b"};">Rekap & riwayat tukin</span>
            </div>
            <svg style="width: 13px; height: 13px; fill: none; stroke: ${isDataAbsen ? "#93c5fd" : "#cbd5e1"}; stroke-width: 2.2; stroke-linecap: round;" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </a>

          <a href="/ubah-password" id="ehNavUbahPassword" style="display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 12px; text-decoration: none; color: #1e293b; ${isPassword ? "background: #eff6ff;" : ""}">
            <div style="width: 32px; height: 32px; border-radius: 10px; background: ${isPassword ? "#dbeafe" : "#fef3c7"}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: ${isPassword ? "#2563eb" : "#d97706"};">
              <svg style="width: 17px; height: 17px; fill: currentColor;" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clip-rule="evenodd"/></svg>
            </div>
            <div style="display: flex; flex-direction: column; flex: 1; min-width: 0;">
              <span style="font-size: 13px; font-weight: ${isPassword ? "700" : "600"}; color: ${isPassword ? "#1d4ed8" : "#0f172a"}; line-height: 1.2;">Ubah Password</span>
              <span style="font-size: 10.5px; color: ${isPassword ? "#3b82f6" : "#64748b"};">Pengaturan sandi</span>
            </div>
            <svg style="width: 13px; height: 13px; fill: none; stroke: ${isPassword ? "#93c5fd" : "#cbd5e1"}; stroke-width: 2.2; stroke-linecap: round;" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </a>

          <div style="height: 1px; background: #f1f5f9; margin: 4px 6px;"></div>

          <button type="button" id="ehNavLogout" style="display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 12px; border: none; background: transparent; cursor: pointer; text-align: left; width: 100%;">
            <div style="width: 32px; height: 32px; border-radius: 10px; background: #fff1f2; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #e11d48;">
              <svg style="width: 17px; height: 17px; fill: currentColor;" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.44l-1.72-1.72a.75.75 0 010-1.06z" clip-rule="evenodd"/></svg>
            </div>
            <div style="display: flex; flex-direction: column; flex: 1; min-width: 0;">
              <span style="font-size: 13px; font-weight: 700; color: #e11d48; line-height: 1.2;">Keluar</span>
              <span style="font-size: 10.5px; color: #f43f5e;">Akhiri sesi</span>
            </div>
            <svg style="width: 13px; height: 13px; fill: none; stroke: #fecdd3; stroke-width: 2.2; stroke-linecap: round;" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      `;
      container.appendChild(menu);
    }

    // Toggle navigation logic
    function toggleNavMenu(show) {
      const isCurrentlyOpen = menu.classList.contains("is-open");
      const next = show !== undefined ? show : !isCurrentlyOpen;
      if (next) {
        menu.classList.add("is-open");
        backdrop.classList.add("is-open");
        btn.classList.add("is-active");
      } else {
        menu.classList.remove("is-open");
        backdrop.classList.remove("is-open");
        btn.classList.remove("is-active");
      }
    }

    btn.onclick = (e) => {
      e.stopPropagation();
      toggleNavMenu();
    };

    backdrop.onclick = () => {
      toggleNavMenu(false);
    };

    if (!window.__ehEscBound) {
      window.__ehEscBound = true;
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          const m = document.getElementById(NAV_DROPDOWN_ID);
          const b = document.getElementById(NAV_BACKDROP_ID);
          const h = document.getElementById(HAMBURGER_ID);
          if (m) m.classList.remove("is-open");
          if (b) b.classList.remove("is-open");
          if (h) h.classList.remove("is-active");
        }
      });
    }

    const logoutBtn = menu.querySelector("#ehNavLogout");
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        if (typeof window.logout === "function") window.logout();
        else if (typeof logout === "function") logout();
        else {
          localStorage.clear();
          window.location.href = "/";
        }
      };
    }
  }

  // ------------------------------------------------------------------
  // Header helpers
  // ------------------------------------------------------------------

  // Restore the logo when a header exists without one, so the navbar row
  // (logo + centered clock + hamburger) can be built on every presensi page.
  function ensureHeaderLogo(header) {
    if (!header) return null;
    let row = header.querySelector(":scope > .eh-header-row");
    if (!row) {
      row = document.createElement("div");
      row.className = "eh-header-row";
      row.style.setProperty("display", "flex", "important");
      row.style.setProperty("align-items", "center", "important");
      row.style.setProperty("justify-content", "space-between", "important");
      row.style.setProperty("width", "100%", "important");
      row.style.setProperty("position", "relative", "important");
      header.insertBefore(row, header.firstChild);
    }
    const img = document.createElement("img");
    img.src = "/assets/logo.png";
    img.alt = "Logo";
    row.insertBefore(img, row.firstChild);
    return img;
  }

  // Self-heal: if the navbar clock is gone (page re-render / SPA route change)
  // rebuild it through the same path that normally creates it.
  function ensureNavClock() {
    if (!document.documentElement.classList.contains("eh-revamp-active")) return;
    if (document.getElementById("ehNavClock")) return;
    setupHeaderTypography(true);
  }

  // ------------------------------------------------------------------
  // Bottom sheet — pilih jenis absen (WFO / WFH)
  // ------------------------------------------------------------------
  const ABSEN_SHEET_BACKDROP_ID = "ehAbsenSheetBackdrop";
  const ABSEN_SHEET_ID = "ehAbsenSheet";

  function buildAbsenModeSheet() {
    let backdrop = document.getElementById(ABSEN_SHEET_BACKDROP_ID);
    if (backdrop) return backdrop;

    backdrop = document.createElement("div");
    backdrop.id = ABSEN_SHEET_BACKDROP_ID;
    backdrop.className = "eh-sheet-backdrop";
    backdrop.innerHTML = `
      <div class="eh-absen-sheet" id="${ABSEN_SHEET_ID}" role="dialog" aria-modal="true" aria-label="Pilih jenis absen">
        <div class="eh-sheet-grabber"></div>
        <div class="eh-sheet-title">Mau absen yang mana?</div>
        <div class="eh-sheet-sub">Pilih dulu jenis kehadiran hari ini sebelum lanjut ke halaman absen.</div>

        <button type="button" class="eh-sheet-opt" data-mode="wfo">
          <span class="eh-sheet-opt-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd">
              <path d="M3 21V7.6L12 3l9 4.6V21h-6.5v-5.5h-5V21H3Zm3.5-14h2.5v2.5H6.5V7Zm0 3.75h2.5v2.5H6.5v-2.5Zm0 3.75h2.5v2.5H6.5v-2.5Zm8.5-7.5H17V9.5h-2.5V7Zm0 3.75H17v2.5h-2.5v-2.5Zm0 3.75H17v2.5h-2.5v-2.5Z"/>
            </svg>
          </span>
          <span class="eh-sheet-opt-body">
            <span class="eh-sheet-opt-title">WFO</span>
            <span class="eh-sheet-opt-desc">Dari kantor — lokasi diverifikasi di titik lokasi.</span>
          </span>
          <svg class="eh-sheet-opt-arrow" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clip-rule="evenodd"/></svg>
        </button>

        <button type="button" class="eh-sheet-opt" data-mode="wfh">
          <span class="eh-sheet-opt-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd">
              <path d="M12 2.6 2.6 10.3V21a1 1 0 0 0 1 1h16.8a1 1 0 0 0 1-1V10.3L12 2.6Zm-1.8 18.9v-4.3a1.8 1.8 0 0 1 3.6 0v4.3h-3.6Z"/>
            </svg>
          </span>
          <span class="eh-sheet-opt-body">
            <span class="eh-sheet-opt-title">WFH</span>
            <span class="eh-sheet-opt-desc">Dari rumah — titik lokasi mengikuti pengaturan spoof.</span>
          </span>
          <svg class="eh-sheet-opt-arrow" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clip-rule="evenodd"/></svg>
        </button>

        <button type="button" class="eh-sheet-cancel" data-mode="cancel">Batal</button>
      </div>
    `;
    document.body.appendChild(backdrop);

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        closeAbsenModeSheet();
        return;
      }
      const opt = e.target.closest(".eh-sheet-opt, .eh-sheet-cancel");
      if (!opt || !backdrop.contains(opt)) return;
      if (opt.dataset.mode === "cancel") {
        closeAbsenModeSheet();
        return;
      }
      closeAbsenModeSheet();
      goAbsenMode(opt.dataset.mode);
    });

    return backdrop;
  }

  function openAbsenModeSheet() {
    if (!document.documentElement.classList.contains("eh-revamp-active")) return;
    if (!isDashboard()) return;
    const backdrop = buildAbsenModeSheet();
    requestAnimationFrame(() => {
      backdrop.classList.add("is-open");
      const sheet = document.getElementById(ABSEN_SHEET_ID);
      if (sheet) sheet.classList.add("is-open");
    });
  }

  function closeAbsenModeSheet() {
    const backdrop = document.getElementById(ABSEN_SHEET_BACKDROP_ID);
    if (!backdrop) return;
    backdrop.classList.remove("is-open");
    const sheet = document.getElementById(ABSEN_SHEET_ID);
    if (sheet) sheet.classList.remove("is-open");
  }

  function removeAbsenModeSheet() {
    const backdrop = document.getElementById(ABSEN_SHEET_BACKDROP_ID);
    if (backdrop) backdrop.remove();
  }

  // Mirror the site's own guard: pilihAbsen() refuses to run until the
  // pegawai record is loaded, otherwise /cek-lokasi lands on an empty state.
  function goAbsenMode(mode) {
    let pegawai = null;
    try {
      pegawai = JSON.parse(localStorage.getItem("pegawai") || "null");
    } catch (_) {
      pegawai = null;
    }
    if (!pegawai) {
      const err = document.getElementById("absenError");
      if (err) {
        err.textContent = "Data pegawai belum dimuat. Tunggu sebentar lalu coba lagi.";
        err.style.display = "block";
      } else {
        window.alert("Data pegawai belum dimuat. Tunggu sebentar lalu coba lagi.");
      }
      return;
    }
    try {
      sessionStorage.setItem("ehAbsenMode", mode === "wfh" ? "WFH" : "WFO");
    } catch (_) {
      /* ignore */
    }
    window.location.href = mode === "wfh" ? "/cek-lokasi-wfh" : "/cek-lokasi";
  }

  // One capture-phase listener covers every absen entry point on the dashboard,
  // including the site's own #btnAbsen whose inline onclick lives in the page's
  // JS world and can only be stopped from the DOM side. It is a no-op on
  // /cek-lokasi, where the button is the already-chosen "Lanjutkan" step.
  document.addEventListener(
    "click",
    (e) => {
      if (!document.documentElement.classList.contains("eh-revamp-active")) return;
      if (!isDashboard()) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (!target.closest("#btnAbsen, #ehBtnAbsenSingle, #btnAbsenSekarang")) return;
      e.preventDefault();
      e.stopPropagation();
      openAbsenModeSheet();
    },
    true
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAbsenModeSheet();
  });

  function setupDualButtons() {
    // Only inject on Dashboard!
    if (!isDashboard()) {
      teardownDualButtons();
      return;
    }

    const btnAbsen = document.getElementById("btnAbsen");
    if (!btnAbsen || !btnAbsen.parentElement) return;

    let dualWrap = document.getElementById(DUAL_ACTIONS_ID);
    if (!dualWrap) {
      dualWrap = document.createElement("div");
      dualWrap.id = DUAL_ACTIONS_ID;
      dualWrap.className = "eh-absen-actions-wrap";
      dualWrap.innerHTML = `
        <button type="button" class="eh-btn-cta-single" id="ehBtnAbsenSingle">
          <svg style="width: 20px; height: 20px; fill: currentColor;" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
          <span>Absen Sekarang</span>
          <svg style="width: 18px; height: 18px; fill: currentColor; margin-left: 2px;" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/>
          </svg>
        </button>
      `;

      btnAbsen.parentElement.appendChild(dualWrap);

      const singleBtn = document.getElementById("ehBtnAbsenSingle");
      if (singleBtn && !singleBtn._ehSheetBound) {
        singleBtn._ehSheetBound = true;
        singleBtn.addEventListener("click", () => {
          openAbsenModeSheet();
        });
      }
    }
  }

  function teardownDualButtons() {
    const dualWrap = document.getElementById(DUAL_ACTIONS_ID);
    if (dualWrap) dualWrap.remove();
    const cekWrap = document.getElementById(CEK_LOKASI_ACTIONS_ID);
    if (cekWrap && !isCekLokasi()) cekWrap.remove();
  }

  function setupCekLokasiCta() {
    if (!isCekLokasi()) return;

    teardownDualButtons();

    const devBtn = document.getElementById("btnAbsenDev");
    if (devBtn) devBtn.style.setProperty("display", "none", "important");

    // Hide clock/profile card on Cek Lokasi
    const clockCard = document.querySelector(".app .card:has(.clock-wrap)") || document.querySelector(".clock-wrap")?.closest(".card");
    if (clockCard) {
      clockCard.style.setProperty("display", "none", "important");
    }

    const btn = document.getElementById("btnAbsen") || document.getElementById("btnBukaKamera");
    if (!btn) return;

    // Wrap in fixed bottom container
    let wrap = document.getElementById(CEK_LOKASI_ACTIONS_ID);
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = CEK_LOKASI_ACTIONS_ID;
      wrap.className = "eh-absen-actions-wrap";
      btn.parentElement.insertBefore(wrap, btn);
      wrap.appendChild(btn);
    } else if (btn.parentElement !== wrap) {
      wrap.appendChild(btn);
    }

    // Ensure it is visible and has flex display
    btn.style.setProperty("display", "flex", "important");

    function formatBtnContent() {
      if (!btn || btn.querySelector("svg")) return;
      const rawText = (btn.textContent || "").trim();
      const label = rawText || "Lanjutkan";
      btn.dataset.ehEnhanced = "1";
      btn.innerHTML = `<span>${label}</span><svg style="width:18px;height:18px;fill:currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/></svg>`;
    }

    formatBtnContent();

    if (!btn._ehObserver) {
      btn._ehObserver = new MutationObserver(() => {
        if (!btn.querySelector("svg")) {
          formatBtnContent();
        }
      });
      btn._ehObserver.observe(btn, { childList: true });
    }

    // Clean trailing br tags inside card
    document.querySelectorAll("#absenCard > br").forEach((br) => {
      br.style.setProperty("display", "none", "important");
    });

    // Ensure Leaflet recalculates dimensions when mapBox container expands
    const mapBox = document.getElementById("mapBox");
    if (mapBox && !mapBox._ehResized) {
      mapBox._ehResized = true;
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100);
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 400);
    }
  }

  let recentFetching = false;
  async function setupRecentAbsensi() {
    if (!isDashboard()) {
      const existing = document.getElementById(RECENT_ABSENSI_ID);
      if (existing) existing.remove();
      return;
    }

    let recentWrap = document.getElementById(RECENT_ABSENSI_ID);
    if (!recentWrap) {
      recentWrap = document.createElement("div");
      recentWrap.id = RECENT_ABSENSI_ID;
      recentWrap.className = "eh-recent-card";
      
      const appEl = document.querySelector(".dashboard-app");
      if (appEl) {
        appEl.appendChild(recentWrap);
      }
    }

    if (recentFetching || recentWrap.dataset.loaded === "1") return;
    // Bounded retry: the observer used to re-run this on every DOM mutation,
    // turning a missing token or failed fetch into a skeleton rewrite +
    // refetch storm. Three attempts per page load keeps the self-heal without
    // the storm.
    const attempts = Number(recentWrap.dataset.attempts || 0);
    if (attempts >= 3) return;
    recentFetching = true;
    recentWrap.dataset.attempts = String(attempts + 1);

    // Render skeleton state
    recentWrap.innerHTML = `
      <div class="eh-recent-head">
        <div class="eh-recent-head-title">
          <div class="eh-recent-head-icon-wrap">
            <svg viewBox="0 0 24 24" fill="currentColor" class="eh-recent-head-icon"><path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z"/><path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3a.75.75 0 011.5 0v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3h-13.5a3 3 0 01-3-3V7.5a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zm13.5 6.75H3.75v9.75c0 .414.336.75.75.75h15c.414 0 .75-.336.75-.75V9z" clip-rule="evenodd"/></svg>
          </div>
          <span>Riwayat Presensi</span>
        </div>
        <a href="/absensi" class="eh-recent-link">
          <span>Lihat Semua</span>
          <svg viewBox="0 0 20 20" fill="currentColor" class="eh-link-arrow"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/></svg>
        </a>
      </div>
      <div class="eh-recent-body">
        <div style="font-size:12.5px;color:#94a3b8;padding:12px 0;text-align:center;">Memuat riwayat presensi...</div>
      </div>
    `;

    try {
      const token = localStorage.getItem("token");
      const pegawai = JSON.parse(localStorage.getItem("pegawai") || "{}");
      const pegawaiId = pegawai.id;
      if (!token || !pegawaiId) {
        recentFetching = false;
        return;
      }

      const now = new Date();
      const namaBulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
      const bulan = namaBulan[now.getMonth()];
      const tahun = String(now.getFullYear());

      const formBody = new URLSearchParams();
      formBody.append("Tahun", tahun);
      formBody.append("Bulan", bulan);
      formBody.append("PegawaiId", String(pegawaiId));

      const [tukinRes, wfhRes] = await Promise.all([
        fetch("https://presensi.kemendesa.go.id/api/proxy/get-tukinlist", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", "Authorization": "Bearer " + token },
          body: formBody.toString()
        }).then(r => r.json()).catch(() => null),
        fetch("https://presensi.kemendesa.go.id/api/holidays/wfh", {
          headers: { "Authorization": "Bearer " + token }
        }).then(r => r.json()).catch(() => null)
      ]);

      const rawList = tukinRes?.Data?.Tukin?.Potongan || [];
      const wfhDates = Array.isArray(wfhRes?.data) ? wfhRes.data.map(item => {
        const d = new Date(item);
        if (isNaN(d.getTime())) return null;
        return `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`;
      }).filter(Boolean) : [];

      const pastAndToday = rawList.filter(item => {
        const parts = (item.Tanggal || "").split("-");
        return parts.length === 3 && parseInt(parts[0], 10) <= now.getDate();
      });

      let chosen = [];
      if (pastAndToday.length >= 5) {
        chosen = pastAndToday.slice(-5).reverse();
      } else {
        chosen = [...pastAndToday].reverse();
        const upcoming = rawList.filter(item => {
          const parts = (item.Tanggal || "").split("-");
          return parts.length === 3 && parseInt(parts[0], 10) > now.getDate();
        }).slice(0, 5 - chosen.length);
        chosen = [...chosen, ...upcoming];
      }

      const escapeHtml = str => String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const itemsHtml = chosen.map(item => {
        const tgl = item.Tanggal || "";
        const isWfh = wfhDates.includes(tgl) || String(item.Status||"").toUpperCase().includes("WFH");
        let statusText = isWfh ? "WFH" : (item.Status || "");
        const ket = String(item.KeteranganPotongan || "").trim();
        if (!statusText) {
          if (ket.toLowerCase().includes("libur")) statusText = "LIBUR";
          else if (item.IN || item.OUT) statusText = "HADIR";
          else statusText = "-";
        }

        let statusPillClass = "status-other";
        if (statusText === "HADIR" || statusText === "NORMAL" || statusText === "WFO") statusPillClass = "eh-pill-hadir";
        else if (statusText === "WFH") statusPillClass = "eh-pill-wfh";
        else if (statusText === "LIBUR") statusPillClass = "eh-pill-libur";
        else if (statusText.toLowerCase().includes("alpa") || statusText.toLowerCase().includes("kurang")) statusPillClass = "eh-pill-danger";

        const jamIn = item.IN && item.IN.trim() ? item.IN : "--:--";
        const jamOut = item.OUT && item.OUT.trim() ? item.OUT : "--:--";

        return `
          <div class="eh-recent-row">
            <div class="eh-recent-col-info">
              <div class="eh-recent-date-text">${escapeHtml(item.Hari || "")}, ${escapeHtml(item.Tanggal || "")}</div>
              <div class="eh-recent-times">
                <span class="eh-time-slot"><span class="eh-dot eh-dot-in"></span>${escapeHtml(jamIn)}</span>
                <span class="eh-time-sep">•</span>
                <span class="eh-time-slot"><span class="eh-dot eh-dot-out"></span>${escapeHtml(jamOut)}</span>
              </div>
            </div>
            <div class="eh-recent-col-status">
              <span class="eh-status-pill ${statusPillClass}">${escapeHtml(statusText)}</span>
            </div>
          </div>
        `;
      }).join("");

      recentWrap.innerHTML = `
        <div class="eh-recent-head">
          <div class="eh-recent-head-title">
            <div class="eh-recent-head-icon-wrap">
              <svg viewBox="0 0 24 24" fill="currentColor" class="eh-recent-head-icon"><path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z"/><path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3a.75.75 0 011.5 0v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3h-13.5a3 3 0 01-3-3V7.5a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zm13.5 6.75H3.75v9.75c0 .414.336.75.75.75h15c.414 0 .75-.336.75-.75V9z" clip-rule="evenodd"/></svg>
            </div>
            <span>Riwayat Presensi</span>
          </div>
          <a href="/absensi" class="eh-recent-link">
            <span>Lihat Semua</span>
            <svg viewBox="0 0 20 20" fill="currentColor" class="eh-link-arrow"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/></svg>
          </a>
        </div>
        <div class="eh-recent-body">
          ${itemsHtml || '<div style="font-size:12.5px;color:#94a3b8;padding:12px 0;text-align:center;">Belum ada data presensi</div>'}
        </div>
      `;
      recentWrap.dataset.loaded = "1";
    } catch (e) {
      console.warn("setupRecentAbsensi error:", e);
    } finally {
      recentFetching = false;
    }
  }

  function setupBottomNav(on) {
    const navItems = document.querySelectorAll(".bottom-nav .nav-item");
    if (!navItems || navItems.length === 0) return;

    navItems.forEach((btn, idx) => {
      if (on) {
        if (!btn.dataset.ehOriginal) {
          btn.dataset.ehOriginal = btn.innerHTML;
        }
        const span = btn.querySelector("span");
        const label = span ? span.textContent.trim() : "";
        if (NAV_ICONS[idx]) {
          // Idempotent: only rewrite when the markup actually differs, so a
          // refresh pass over stable state emits no mutation.
          const desired = `${NAV_ICONS[idx]}<span>${label}</span>`;
          if (btn.innerHTML !== desired) btn.innerHTML = desired;
        }
      } else {
        if (btn.dataset.ehOriginal) {
          btn.innerHTML = btn.dataset.ehOriginal;
          delete btn.dataset.ehOriginal;
        }
      }
    });
  }

  function applyRevamp(on) {
    let existing = document.getElementById(REVAMP_STYLE_ID);
    if (!on) {
      if (existing) existing.remove();
      document.documentElement.classList.remove("eh-revamp-active");
      if (document.body) document.body.classList.remove("eh-revamp-active");
      teardownDualButtons();
      const recent = document.getElementById(RECENT_ABSENSI_ID);
      if (recent) recent.remove();
      const clockCard = document.querySelector(".clock-card");
      if (clockCard) clockCard.style.removeProperty("display");
      removeAbsenModeSheet();
      setupBottomNav(false);
      setupHeaderTypography(false);
      return;
    }

    if (!existing) {
      existing = document.createElement("style");
      existing.id = REVAMP_STYLE_ID;
      existing.textContent = CSS;
      (document.head || document.documentElement).appendChild(existing);
    }
    document.documentElement.classList.add("eh-revamp-active");
    if (document.body) document.body.classList.add("eh-revamp-active");

    const clockCard = document.querySelector(".clock-card");
    if (clockCard) clockCard.style.setProperty("display", "none", "important");

    setupHeaderTypography(true);
    if (isDashboard()) {
      setupDualButtons();
      setupRecentAbsensi();
    } else if (isCekLokasi()) {
      setupCekLokasiCta();
    }
    setupBottomNav(true);
  }

  // MutationObserver to re-apply dynamic buttons/nav when DOM re-renders in SPA.
  // Guard rails (all three are required — dropping any one restores the freeze):
  //   1. Coalesce bursts with a trailing timer so one pass covers many mutations.
  //   2. Disconnect while the pass runs: our own writes (nav clock, recent card,
  //      bottom nav, header) must not be recorded, or the callback re-enters
  //      itself until the microtask queue starves and the page hangs.
  //   3. Every writer below is idempotent, so a pass that finds stable state
  //      writes nothing and the loop terminates.
  let observer = null;
  let revampRefreshTimer = null;
  const OBSERVER_OPTS = { childList: true, subtree: true };

  function runRevampRefresh() {
    if (!document.documentElement.classList.contains("eh-revamp-active")) return;
    if (observer) observer.disconnect();
    try {
      setupHeaderTypography(true);
      ensureNavClock();
      const clockCard = document.querySelector(".clock-card");
      if (clockCard) clockCard.style.setProperty("display", "none", "important");
      if (!isDashboard()) closeAbsenModeSheet();
      if (isDashboard()) {
        const dualWrap = document.getElementById(DUAL_ACTIONS_ID);
        const btnAbsen = document.getElementById("btnAbsen");
        if (btnAbsen && !dualWrap) {
          setupDualButtons();
        }
        setupRecentAbsensi();
      } else if (isCekLokasi()) {
        teardownDualButtons();
        setupCekLokasiCta();
      }
      const navWithEmoji = document.querySelector(".bottom-nav .nav-item:not([data-eh-original])");
      if (navWithEmoji) {
        setupBottomNav(true);
      }
    } finally {
      if (observer) {
        const node = document.body || document.documentElement;
        if (node) observer.observe(node, OBSERVER_OPTS);
      }
    }
  }

  function scheduleRevampRefresh() {
    if (revampRefreshTimer) return;
    revampRefreshTimer = setTimeout(() => {
      revampRefreshTimer = null;
      runRevampRefresh();
    }, 120);
  }

  function cancelRevampRefresh() {
    if (revampRefreshTimer) {
      clearTimeout(revampRefreshTimer);
      revampRefreshTimer = null;
    }
  }

  function startObserver() {
    if (observer || typeof MutationObserver === "undefined") return;
    observer = new MutationObserver(scheduleRevampRefresh);

    const targetNode = document.body || document.documentElement;
    if (targetNode) {
      observer.observe(targetNode, OBSERVER_OPTS);
    }
  }

  // Initial check from chrome.storage
  try {
    chrome.storage.local.get(["revampUiEnabled"], (res) => {
      if (res && res.revampUiEnabled) {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () => {
            applyRevamp(true);
            startObserver();
          });
        } else {
          applyRevamp(true);
          startObserver();
        }
      }
    });
  } catch (_) {}

  // Listen for real-time toggle changes from sidepanel
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && "revampUiEnabled" in changes) {
        const on = !!changes.revampUiEnabled.newValue;
        applyRevamp(on);
        if (on) {
          startObserver();
        } else if (observer) {
          cancelRevampRefresh();
          observer.disconnect();
          observer = null;
        }
      }
    });
  } catch (_) {}
})();
