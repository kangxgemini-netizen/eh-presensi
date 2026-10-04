# UI/UX Consistency Overhaul Implementation Plan

> **For Hermes:** Execute this plan task-by-task. Follow `antislop-code` and `ui-ux-pro-max` standards.

**Goal:** Unify and polish all UI elements across `sidepanel.html` and `sidepanel.js` for 100% icon consistency (solid fill vectors), synchronized spring motion transitions, normalized component hierarchy/radii/spacing, and clean code comment hygiene (anti-slop).

**Architecture:** A lightweight Chrome Manifest V3 sidepanel application built with native CSS custom properties, WAAPI / CSS spring easing, SVG vector normalization, and event-driven state hydration.

**Tech Stack:** HTML5, CSS3 (Modern Flexbox/Grid, CSS custom variables, `overflow: overlay`, WAAPI), Vanilla ES2022 JavaScript, Chrome Extensions Manifest V3 APIs.

---

### Task 1: Audit & Standardize All Icons to 100% Solid Fill Vectors

**Objective:** Replace every remaining stroke/line SVG icon with an equivalent high-contrast, production-grade solid fill vector icon across all components.

**Files:**
- Modify: `sidepanel.html` (SVG elements in cards, buttons, toolbars, footer)
- Test: Chrome DevTools evaluate script & screenshot verification

**Details of icon replacements:**
1. **Google Maps Link Button (`#btn-open-maps`):**
   - Old: Stroke polygon + lines (`points="3 6 9 3..."`).
   - New: Solid fill location pin / map glyph (`Heroicons solid map-pin`).
2. **Security Bypass Card (`#js-toggle` card icon):**
   - Old: Stroke shield outline (`M12 22s8-4...`).
   - New: Solid fill shield-check glyph (`Heroicons solid shield-check`).
3. **Proxy Test Connection Button (`#btn-proxy-test`):**
   - Old: Stroke pulse wave (`M22 12h-4l-3 9...`).
   - New: Solid fill lightning bolt / signal glyph (`Heroicons solid bolt`).
4. **Console Toolbar - Copy Button (`#btn-copy-log`):**
   - Old: Stroke clipboard outline.
   - New: Solid fill clipboard document glyph (`Heroicons solid clipboard-document`).
5. **Console Toolbar - Clear Button (`#btn-clear-log`):**
   - Old: Stroke trash outline.
   - New: Solid fill trash can glyph (`Heroicons solid trash`).
6. **Footer - Check Update Button (`#btn-check-version`):**
   - Old: Stroke refresh outline.
   - New: Solid fill rotate arrow matching master reload button.
7. **Accordion Chevrons (`.chevron-ic`):**
   - Standardize to clean solid fill chevron with smooth 180° rotation on open.

---

### Task 2: Standardize Transitions, Springs, and Physics Across All Components

**Objective:** Unify all interactive transitions to use matching physics curves, synchronized timing, and zero layout shift.

**Files:**
- Modify: `sidepanel.html` (CSS transition definitions)
- Modify: `sidepanel.js` (Tab WAAPI animations, accordion height animations)

**Key parameters:**
- **Tab Slide & Crossfade:** `220ms` incoming, `180ms` outgoing with `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Top Tab Glider:** `280ms` spring slide with `cubic-bezier(0.34, 1.35, 0.64, 1)`.
- **Accordions:** Smooth CSS grid expansion (`grid-template-rows: 0fr -> 1fr`, `240ms cubic-bezier(0.16, 1, 0.3, 1)`) and chevron rotation (`transform: rotate(180deg)`).
- **Toggles & Segmented Pills:** `200ms cubic-bezier(0.34, 1.35, 0.64, 1)`.
- **Buttons (Master, Reload, Secondary):** `150ms ease` with `translateY(-1px)` hover and `scale(0.985)` active press feedback.
- **Scrollbars:** 3-second inactivity auto-hide with `0.28s` opacity fade.

---

### Task 3: Component Hierarchy, Spacing, and Borderless Surface Consistency

**Objective:** Clean up radii, spacing scales, and color variables to create a harmonious Apple/Vercel-grade design system.

**Files:**
- Modify: `sidepanel.html` (CSS design tokens and component rules)

**Design Tokens:**
- `--radius-card: 16px`
- `--radius-control: 12px`
- `--radius-button: 12px`
- `--radius-input: 10px`
- `--radius-pill: 999px`
- Standardized padding: cards `16px`, shell padding `14px 14px 12px`, gaps `10px` and `12px`.
- Consistent typography and weights across all labels, badges, and headers.

---

### Task 4: Anti-Slop Code Hygiene Review

**Objective:** Purge all decorative separator banners, workflow narration, emoji comments, and generic labels from `sidepanel.html` and `sidepanel.js` according to `antislop-code` rules.

**Files:**
- Modify: `sidepanel.html` (remove `/* ===== */` banners, keep concise section labels)
- Modify: `sidepanel.js` (remove `// Step 1:`, `// =====`, decorative emoji, loud comments; retain only technical constraints)

---

### Task 5: Testing, Visual Verification & Release

**Objective:** Run the full test suite (`test_wfh_v2_rewrite.js`, `test_wfh_v2_mode.js`), verify visual rendering in DevTools, bump version to `v2.9.0`, commit, push to GitHub, and create release.

**Verification Steps:**
1. Run Node.js unit tests (expect 10/10 PASS and 14/14 PASS).
2. Inspect sidepanel rendering in Chrome DevTools (Page 9).
3. Validate all icons are solid fill via computed style (`fill: rgb(...)`, `stroke: none`).
4. Validate tab transitions and accordion animations.
5. Create GitHub release `v2.9.0`.
