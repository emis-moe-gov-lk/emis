# Theme Verification Checklist

Use this checklist after changing app theme behavior or shared surface styles.

## Build gate
- [ ] Run `npm run build` in `frontend` and confirm it succeeds.
- [ ] Confirm there are no new console errors on load.

## Theme bootstrap
- [ ] Set `localStorage.theme` to `light`, `dark`, and `system` and hard refresh each time.
- [ ] Confirm the initial paint matches the saved theme before React mounts.
- [ ] Confirm `system` follows the OS preference and updates when the OS theme changes.

## Core chrome
- [ ] Confirm the left sidebar background, labels, submenu states, and scrollbar use the dark surface style.
- [ ] Confirm the top header uses the shared shell surface and that search and action buttons remain readable.
- [ ] Confirm the right rail uses the shared shell surface and icons stay visible.
- [ ] Confirm the settings popover and profile popover use dark surfaces, borders, and readable text.

## Content surfaces
- [ ] Confirm teacher and DOS form cards use the shared surface style.
- [ ] Confirm loading and skeleton cards remain readable in both themes.
- [ ] Confirm hover and active states keep sufficient contrast in both themes.

## Accessibility
- [ ] Confirm popovers close with `Escape`.
- [ ] Confirm popover close buttons receive focus when opened.
- [ ] Confirm interactive controls have visible focus rings.
- [ ] Confirm buttons have descriptive labels for screen readers.

## Final check
- [ ] Re-run the app on a hard refresh and verify no white-only surfaces remain in dark mode.
