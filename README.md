# NEXUS — Responsive Digital Studio Website

A non-commercial portfolio project implementing the supplied [Figma design](https://www.figma.com/design/43neuBRQ2gq0kVngOUs08v/Design-Test?node-id=0-1) as a responsive, accessible React website.

**Live demo:** <https://nexus-digital-solutions-anton.rikishini.chatgpt.site/>

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
- OpenAI Sites deployment

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

The current verification baseline is 10 passing tests and 0 known dependency vulnerabilities.

## Project status

The public demo is deployed globally. Its contact form validates input, rejects honeypot submissions, and sends valid inquiries to the configured project inbox through FormSubmit.

## Non-commercial notice

This repository is published as a non-commercial design implementation and portfolio demonstration. Visual direction and marketing copy originate from the supplied design test. No affiliation with a commercial NEXUS business is claimed, and the included design assets are not offered for resale or commercial reuse.
