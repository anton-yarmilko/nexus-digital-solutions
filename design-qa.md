# Design QA

## Comparison target

- Source visual truth: `references/Desktop.png` (1440 × 3414), `references/Mobile.png` (390 × 4544), and `references/Mobile - Menu Open.png` (390 × 448), exported directly from the supplied Figma file.
- Implementation: local browser render at `http://localhost:4173/`.
- Comparison surface: `qa-compare.html`, rendered in Chrome with the Figma source and implementation capture side by side.
- Desktop viewport: 1440 × 900 CSS px; full-page implementation content 1440 × 3416 CSS px.
- Mobile viewport: 390 × 850 CSS px; full-page implementation content 390 × 4544 CSS px.
- Browser capture density: 2 device pixels per CSS pixel; both columns were normalized to the same 390 CSS px width for the mobile comparison.
- State: default desktop, default mobile, mobile menu open, contact validation errors, contact delivery states, and both `?cases=0` layouts.

## Findings and history

### Pass 1

- [P2] Mobile case artwork was too tall.
  - Evidence: the implementation used 362 × 242 slots while Figma uses 362 × 171; full-page height was 4685 px instead of 4543.44 px.
  - Fix: changed the mobile artwork aspect ratio to 362/171.

### Pass 2

- Post-fix evidence: implementation full-page height is 4544 CSS px, matching Figma's 4543.44 px after browser rounding.
- Desktop implementation height is 3416 CSS px against Figma's 3413.23 px, a 2.77 px cumulative rounding difference.
- No actionable P0/P1/P2 differences remain.

## Required fidelity surfaces

- Fonts and typography: self-hosted DM Sans variable font, with the Figma weights, sizes, line heights, and letter spacing represented across desktop and mobile.
- Spacing and layout rhythm: section boundaries, 1280 px desktop shell, 362 px mobile shell, card heights, contact composition, and footer dimensions match the source.
- Colors and tokens: `#F7F7F7`, `#0C0C0C`, `#FF5F25`, `#A6A6A6`, borders, and dot texture match the Figma values.
- Image quality and assets: original Figma raster content, logo, avatars, case imagery, thumbnails, icons, and decorative marks are reused as extracted source assets. No placeholders remain.
- Copy and content: visible Figma copy is preserved. Supplied production email and phone details replace the sample contact data; unverified social destinations were removed instead of publishing broken links.

## Interaction and technical checks

- Mobile menu opens, closes, follows the 390 × 448 menu state, closes on Escape, and closes after navigation.
- Required form fields report inline errors and move focus to the first invalid field.
- Valid input is sent to a same-origin edge endpoint. The endpoint independently validates the payload, applies size and per-IP rate limits, rejects honeypot spam, forwards accepted requests to the configured inbox, and handles provider failures without losing the direct email fallback.
- `?cases=0` removes the cases section without breaking the remaining layout.
- Main navigation, section links, skip link, dialogs, hover, focus, and reduced-motion states were checked.
- Browser accessibility tree contains headings, landmarks, labels, image alternatives, and dialog semantics.
- Security headers, `robots.txt`, `sitemap.xml`, canonical metadata, client/server validation, provider failure handling, and SPA fallback behavior have automated coverage.
- No JavaScript errors or warnings appeared during the browser interaction pass.

final result: passed
