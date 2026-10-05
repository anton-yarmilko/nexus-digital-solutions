# NEXUS — Responsive Digital Studio Website

A non-commercial portfolio project implementing the supplied [Figma design](https://www.figma.com/design/43neuBRQ2gq0kVngOUs08v/Design-Test?node-id=0-1) as a responsive, accessible React website.

**Live demo:** <https://nexus-anton.pages.dev/>

The interface identifies this as Anton Yarmilko's independent, non-commercial portfolio implementation. Design-reference images are not client-work claims; unsupported customer counts, ratings and the placeholder phone number have been removed. Contact messages go to the maintainer through the existing FormSubmit flow.

## Highlights

- Responsive desktop and mobile layouts based on the original design.
- Accessible navigation, semantic sections, keyboard support, and reduced-motion handling.
- Validated contact form with honeypot spam protection and FormSubmit email delivery.
- Self-hosted DM Sans fonts and optimized local visual assets.
- SEO metadata, `robots.txt`, sitemap, CSP, and security headers.
- Automated tests for contact handling and the production hosting worker.

## Technology

- React 19
- Vite 6
- JavaScript and CSS
- Node.js test runner
- Cloudflare Pages deployment; existing Sites packaging retained

## Local development

```bash
npm ci
npm run dev
```

Production verification:

```bash
npm test
npm run build
npm audit --omit=dev
```

The publication-metadata candidate adds regression checks for the Pages discovery links and factual portfolio descriptions. The September dependency audit reported 0 known vulnerabilities; no new audit is claimed for this migration.

## Project status

The public demo is hosted on Cloudflare Pages with automatic deployments from GitHub `main`. HTTP and desktop/mobile smoke checks on 2026-10-05 confirmed the initial deployment and security headers. A push to `main` changes the public demo, so review and version updates before pushing.

The contact form validates input, rejects honeypot submissions, and is configured to send valid inquiries to the maintainer through FormSubmit. Delivery from the new Pages origin has not been tested; do not interpret local tests or empty-form validation as proof of message delivery.

## Non-commercial notice

This repository is published as a non-commercial design implementation and portfolio demonstration. Visual direction and marketing copy originate from the supplied design test. No affiliation with a commercial NEXUS business is claimed, and the included design assets are not offered for resale or commercial reuse.
