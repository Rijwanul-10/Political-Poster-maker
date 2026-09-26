# rules.md — Project Rules & Standards
## AI Political Poster Maker

These rules apply to every phase in phases.md. When in doubt, favor: correctness of Bangla text > visual polish > feature breadth.

---

## 1. Design Principles (non-negotiable)

The frontend is a product differentiator, not a container for functionality. Every screen must look intentionally designed — not a default Bootstrap/Tailwind scaffold.

1. **First-impression rule:** the landing page and the poster-generation screen are judged first. They must use real visual hierarchy, generous whitespace, a considered type scale, and a distinct color identity (not generic blue-on-white SaaS defaults) — inspired by the reference posters' palette (flag colors: deep green/red, gold accents, floral motifs) applied tastefully to UI chrome, not literally slapped on.
2. **Typography:** pick one strong Bangla display font for headline-related UI text and one clean Bangla+Latin body font. No default system font stacks. Font pairing must be deliberate and documented in memory.md once chosen.
3. **No template look:** avoid the "obvious AI-generated UI" tell — no purple-gradient hero, no generic card-grid-with-shadow-everywhere without variation, no centered-emoji-icon feature blocks. Use asymmetry, real imagery (sample posters), and custom iconography where feasible.
4. **Motion with purpose:** subtle transitions on generation status changes (draft → generating → completed) and preview reveal — never decorative motion with no functional cue.
5. **Mobile-first, always:** most target users are on mid/low-end Android phones. Every screen is designed for a narrow viewport first, then expanded — never the reverse.
6. **Loading states are designed, not default:** the AI generation wait (~seconds) must have a purposeful, on-brand loading state (progress messaging tied to actual pipeline steps: "Placing photos…", "Choosing colors…", "Rendering poster…") — never a bare spinner.
7. **Every deliverable poster must visually match the reference conventions** in task.md: large Bangla headline, 2–3 leader photo cutouts along the top, party symbol/flag graphic, decorative background, footer bar with requester name/designation/organization and a "প্রচারে" credit line. Deviating from this grammar is a functional bug, not a style choice.

---

## 2. Coding Standards

### General
- TypeScript strict mode on both frontend and backend — no `any` without a documented reason.
- One clear responsibility per file/module; services isolated per external dependency (Gemini, storage, render engine) as defined in architecture.md §8, so any one integration can be swapped without touching controllers/routes.
- Environment variables for all secrets (Gemini key, DB URI, JWT secret, storage credentials) — never hardcoded, never committed.

### Frontend (Next.js/TypeScript)
- Shared design tokens (colors, spacing, type scale) centralized in one Tailwind config / theme file — no ad-hoc magic numbers in components.
- Component library built before feature screens (button, input, upload dropzone, card, status badge) so visual consistency is structural, not accidental.
- All Bangla-facing copy stored in a single i18n/strings file, not scattered inline — this project is Bangla-first, English is secondary if present at all.
- Forms validate client-side before submit (required fields, photo count/size, text length vs. template's `maxChars`) to avoid failed generations from preventable input errors.

### Backend (Express/TypeScript)
- Routes stay thin; all logic lives in `services/`.
- Every external call (Gemini, storage, render) wrapped with timeout + fallback — a slow/failed AI call must degrade gracefully (see architecture.md §6), never crash the request.
- All `/api/posters*` and `/api/upload` behind JWT auth middleware and rate limiting.
- Input validation (e.g., zod or Joi schemas) on every POST/PATCH body before it touches the database.
- No secrets or raw Gemini prompts logged to client-visible responses; `GenerationLog` is server-side only.

### Bangla Text Handling (critical rule)
- **User-entered Bangla text is never passed through AI image generation for final rendering.** It is placed via the deterministic HTML/CSS render pipeline only (architecture.md §6). This rule may not be relaxed for convenience even in a stretch feature.
- All text slots enforce `maxChars` from `Template.layoutConfig` to prevent overflow/clipping in the final render.

---

## 3. Content Safety Rules (MVP-level, lightweight)

Full moderation queue is post-MVP (see PRD.md §5.3), but MVP still enforces baseline safety:

1. A submission-time filter checks `headlineText`, `party`, and `designation` fields against a maintained blocklist (hate speech terms, banned symbol names) before generation starts; a match blocks submission with a clear message — not a silent failure.
2. Uploaded photos are not analyzed for content in MVP (deferred — noted as a known gap in memory.md), but upload size/type limits are enforced to prevent abuse.
3. Every generated poster is tagged with the requesting `userId` and timestamp in the DB — traceability is in place from day one even without an admin UI to act on it.
4. No poster claims official government/EC (Election Commission) affiliation by default — template copy/footer must never imply official endorsement.

---

## 4. Git / Workflow Rules

- Conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`) so phase progress is legible in history.
- Each phase in phases.md ends with a working, demoable state — no phase should leave the app in a broken/non-running state at handoff.
- Seed script for templates lives in its own `scripts/` entry, runnable idempotently (`npm run seed:templates`) — this stands in for the deferred admin UI.

---

## 5. Definition of Done (per feature)

A feature is "done" only when:
1. It works end-to-end on a mobile viewport.
2. Bangla text renders correctly (spelling, no clipping) in the final export.
3. Errors (failed generation, invalid upload, rate limit hit) show a real UI state, not a console error or blank screen.
4. It matches the visual bar in §1 — not just "functions," but looks intentional.
