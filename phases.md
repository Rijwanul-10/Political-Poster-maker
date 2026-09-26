# phases.md — Development Phases
## AI Political Poster Maker

Each phase ends in a demoable, non-broken state (rules.md §4). Scope follows PRD.md §5 (MVP core; admin/moderation/analytics deferred).

---

## Phase 0 — Foundation & Design System (pre-req for everything)
**Goal:** nothing "feature-y" ships until the visual identity exists — this is what prevents the generic-AI-UI outcome.

- Init Next.js (TypeScript) + Express (TypeScript) monorepo or twin-repo structure; MongoDB Atlas connection verified.
- Define design tokens: color palette (derived tastefully from reference posters, not literal flag colors on UI chrome), type scale, spacing scale, chosen Bangla display + body fonts (documented in memory.md).
- Build core component library: button, input, textarea, file-dropzone, card, status badge, loading/progress states.
- Build the landing page (`/`) to the full design bar in rules.md §1 — this is the reference point for every later screen's quality.
- **Exit criteria:** landing page is visually complete and mobile-tested; component library is usable by later phases.

---

## Phase 1 — Auth + Template System
**Goal:** users can register/log in and browse real templates.

- Mongoose models: `User`, `Template`, `Poster` (schema per architecture.md §4).
- Auth: register/login endpoints, JWT middleware, password hashing.
- File upload endpoint (`POST /api/upload`) to Cloudinary/S3.
- Seed 2–3 templates matching reference poster styles — `layoutConfig` fully defined (photo slots, text slots, decoration options), thumbnail assets in place. Seed via script (`npm run seed:templates`), no admin UI.
- Frontend: `/login`, `/register`, `/templates` gallery screen (filterable by occasion), built with Phase 0's component library.
- **Exit criteria:** a user can register, log in, and browse/select a seeded template with correct thumbnails and occasion filtering.

---

## Phase 2 — Generation Core (the hard part)
**Goal:** the actual AI + render pipeline works end-to-end for one template.

- Poster request form (`/create/[templateId]`): name, designation, party/org, district/থানা/union, occasion, headline text, up to 3 photo uploads — client-validated per template's `maxChars`/photo limits.
- `POST /api/posters` — creates `Poster` doc, triggers generation.
- Gemini integration (`services/geminiService.ts`): JSON-only prompt for photo crop suggestion + decoration/color scheme suggestion; timeout + fallback per architecture.md §6.
- Render pipeline (`services/renderService.ts`): Puppeteer or node-canvas spike — **resolve the serverless-vs-dedicated-server question here** (architecture.md §10 risk #1) before building further phases on top of it. Compose template + photos + Gemini suggestions + user's exact Bangla text → PNG at ≥1200×1600px.
- Wire `GET /api/posters/:id` status polling end-to-end; `GenerationLog` entries written per attempt.
- Submission-time content filter (rules.md §3) applied before generation starts.
- **Exit criteria:** a real poster — correct Bangla spelling, correct occasion visual grammar — can be generated end-to-end from the form for at least one template.

---

## Phase 3 — Preview, Regenerate, Export, History
**Goal:** the full user loop is usable and demoable.

- Preview screen (`/poster/[id]`) with on-brand loading states (rules.md §1.6) while polling.
- Regenerate flow (`POST /api/posters/:id/regenerate`) with retry cap (default 3, confirm in memory.md).
- PNG export finalized at print resolution; PDF export attempted here — if it threatens the deadline, formally move to stretch and log the decision in memory.md (per PRD.md open question).
- `GET /api/posters/user/:userId` + `/history` page — list with thumbnail, occasion, date, re-download.
- `DELETE /api/posters/:id`.
- **Exit criteria:** a user can go template → form → preview → regenerate (if needed) → download → see it later in history.

---

## Phase 4 — Polish, Hardening, Deploy
**Goal:** ship-ready.

- Responsive UI pass across all screens (form, preview, history) — verify against rules.md §1.5 on an actual low-end device or throttled emulation.
- Rate limiting on `/api/posters` and `/api/upload` finalized.
- Error states audited: failed generation, invalid upload, rate-limit hit, expired JWT — each has a real, on-brand UI treatment (rules.md §5).
- Expand seeded templates to full 2–3 (if not already) across the listed occasion categories; sanity-check every occasion's visual grammar against task.md's reference description.
- Deploy: frontend + backend to Vercel, DB to MongoDB Atlas; env vars/secrets configured per environment.
- Smoke test the full user loop on production URLs.
- **Exit criteria:** MVP is live, demoable end-to-end on a real URL, on both desktop and mobile.

---

## Deferred to Post-MVP (explicitly out of phases 0–4)
- Admin panel for template CRUD (seed script substitutes for now)
- Content moderation queue / flagging workflow
- Usage analytics
- Bulk/CSV generation, payment gateway (bKash/Nagad), watermark removal tier
- Multiple photo layout options (2-up/3-up), headline font selection

These stay tracked in memory.md so they aren't lost, but do not block MVP delivery.

---

## Phase Sequencing Notes

- Phase 0 must fully precede Phase 1+ — skipping the design-system phase is the most likely path to a generic-looking result, which violates rules.md §1.
- Phase 2's render-engine decision (Puppeteer vs. node-canvas, serverless vs. dedicated) is the single highest-risk technical decision in the project — treat it as a timeboxed spike, not something to discover mid-Phase-3.
- If time pressure hits, cut stretch features (§ above) before cutting design polish (Phase 0/4) — visual quality is a stated product requirement, not decoration.
