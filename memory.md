# memory.md — Project Memory / Decision Log
## AI Political Poster Maker

Purpose: a single living file tracking decisions, open questions, and state across work sessions, so context isn't lost between sessions (human or AI-assisted). Update this file at the end of every work session — don't let it go stale.

---

## How to use this file
- **Decisions Log** — append-only; once a decision is made, record it here with the date and reasoning. Don't delete old entries even if superseded — mark them superseded instead.
- **Open Questions** — move items here as they arise; move them to Decisions Log once resolved.
- **Deferred Items** — the canonical list of what's intentionally out of MVP scope (mirrors PRD.md §5.3 / phases.md's deferred section — kept here too so it's visible without cross-referencing).
- **Session Notes** — short dated entries: what was done, what's next.

---

## 1. Decisions Log

| Date | Decision | Reasoning |
|---|---|---|
| (seed) | Gemini used for layout/decoration suggestion only; final Bangla text rendered deterministically via HTML/CSS + Puppeteer/node-canvas | Raw AI image generation corrupts Bangla script; correctness is non-negotiable (architecture.md §6, rules.md §2) |
| (seed) | Admin panel, moderation queue, analytics deferred post-MVP; template management via seed script instead | Keep MVP shippable within deadline (task.md §7) |
| (seed) | Cloudinary preferred over raw S3 for MVP | Simpler signed-upload DX (architecture.md §9) |
| *(pending)* | Bangla font pairing (display + body) | To be finalized in Phase 0 — record choice here once picked |
| *(pending)* | Render engine: Puppeteer vs. node-canvas; serverless vs. dedicated server | To be resolved via Phase 2 spike (phases.md, architecture.md §10 risk #1) — record outcome + benchmark numbers here |
| *(pending)* | Regeneration retry cap | Default proposed 3 in PRD.md — confirm or change here |
| *(pending)* | PDF export: ships in MVP Phase 3 or slips to stretch | Decide during Phase 3; log the call and why |
| *(pending)* | Final seeded template count (2 vs. 3) and which occasions covered first | Confirm before Phase 1 close |

---

## 2. Open Questions

- [ ] What exact Bangla fonts are licensed/available for embedding in the Puppeteer render environment?
- [ ] Does Vercel serverless support Puppeteer at acceptable cold-start latency, or is a small dedicated Node server needed for the render worker?
- [ ] What's the actual Gemini model/endpoint being used, and what's its JSON-mode reliability in practice — needs a small spike before Phase 2 is fully trusted?
- [ ] Confirm OTP vs. password-only auth for MVP (task.md mentions both as options).

---

## 3. Deferred Items (post-MVP)
- Admin panel for template CRUD
- Content moderation queue
- Usage analytics
- Multiple photo layout options (2-up, 3-up grid)
- Bangla font selection for headline (user-facing choice, distinct from the Phase 0 fixed-font decision above)
- Watermark removal for paid tier
- Bulk generation (CSV → batch posters)
- Payment gateway (bKash/Nagad)

---

## 4. Known Gaps / Accepted Risk (MVP)
- Uploaded photos are not content-analyzed (only type/size validated) — unauthorized-photo-use risk accepted for MVP per rules.md §3.2.
- Content filter is a basic blocklist, not a full moderation pipeline — accepted per PRD.md §5.3.

---

## 5. Session Notes

### Session 0 — Planning
- Reviewed task.md; produced PRD.md, architecture.md, rules.md, phases.md, memory.md.
- No code written yet.
- **Next:** begin Phase 0 (design system + landing page) per phases.md.

*(Add new dated entries below as work progresses — keep each entry short: what changed, what's next.)*
