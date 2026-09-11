# NEXUS

Production-ready responsive implementation of the supplied Figma design.

## Commands

- `npm run dev` — local development server
- `npm test` — contact validation and hosting contract tests
- `npm run build` — optimized production and Sites build

The production contact form posts to `/api/contact`. The edge worker validates and rate-limits requests, rejects honeypot spam, and forwards valid inquiries to `taboopip@gmail.com` through FormSubmit. FormSubmit requires a one-time confirmation from that inbox before it releases queued submissions.

Public production URL: <https://nexus-digital-solutions-anton.rikishini.chatgpt.site/>
