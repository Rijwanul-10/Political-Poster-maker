# PRD.md — Product Requirements Document
## AI Political Poster Maker

---

## 1. Product Summary

A web platform that lets local political workers, committee members, and publicity agents generate ready-to-print political posters — victory day posters, condolence/tribute posters, campaign posters — in minutes, without needing a designer. The user fills a short form (name, designation, party, occasion, photo) and the system uses AI (Gemini) to compose a polished, culturally-correct poster in the visual language of typical Bangladeshi political posters: leader photo cutouts, party/flag motifs, floral borders, bold Bangla headline typography, and a footer credit line.

**Core promise:** *"From form to print-ready poster in under 60 seconds, with zero design skill required."*

---

## 2. Problem Statement

Today, local political workers rely on local print-shop designers (slow, inconsistent quality, costly, requires physical visits) or crude Photoshop/Canva templates that don't match the visual conventions Bangladeshi audiences expect (correct Bangla typography, occasion-appropriate motifs, floral/national-flag color palettes). There is no self-serve tool that:
- Understands the *specific visual grammar* of these posters (photo cutout placement, headline style per occasion, footer credit conventions)
- Guarantees **error-free Bangla text** (a common failure point of pure AI image generation)
- Produces **print-resolution** output ready to send straight to a press

---

## 3. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Fast poster creation | < 60s median time from form submit to preview |
| Print-ready output | 100% of exports ≥ 1200×1600px, PNG/PDF |
| Bangla text accuracy | 0% garbled/misspelled headline text (enforced via HTML/Canvas render, not raw AI image text) |
| First-time success | ≥ 80% of posters accepted without regeneration |
| Visual quality | Output indistinguishable from a professionally designed poster (subjective QA benchmark against reference samples) |
| Retention | ≥ 40% of users return to generate a second poster within 30 days |

---

## 4. Target Users / Personas

1. **Local Committee Publicity Agent** — creates posters for local events (bijoy dibosh, party programs) on tight deadlines, low technical skill, mobile-first.
2. **Party Worker (individual)** — wants a personal congratulatory/condolence poster with their name/designation as requester, for social sharing and physical printing.
3. **Admin/Moderator** (post-MVP) — reviews generated content for prohibited symbols, defamatory content, or unauthorized photo use.

---

## 5. Scope

### 5.1 In Scope — MVP
1. **Template library** — curated templates by occasion: বিজয় দিবস, শোক/স্মরণ, নির্বাচনী প্রচার, শুভেচ্ছা, ঈদ/উৎসব.
2. **User input form** — name, designation/পদবি, party/organization, union/থানা/জেলা, occasion type, headline text (Bangla), up to 3 photo uploads.
3. **AI poster generation pipeline** — Gemini-assisted layout/decoration suggestion + deterministic HTML/Canvas render for guaranteed-correct Bangla text.
4. **Preview & regenerate** — preview before export, limited regeneration retries.
5. **Download/export** — print-ready PNG/JPG (min 1200×1600px) and PDF.
6. **Poster history** — saved per account, re-downloadable.
7. **Auth** — register/login via JWT (email/phone + password).
8. **Basic rate limiting** on generation endpoint.

### 5.2 In Scope — Stretch (post-MVP, if time permits)
- Multiple photo layout options (2-up, 3-up grid)
- Bangla font selection for headline
- Watermark removal for paid tier
- Bulk generation (CSV → batch posters) for committees
- Payment gateway (bKash/Nagad)

### 5.3 Explicitly Out of Scope for MVP
- Admin panel UI (templates seeded via script instead)
- Content moderation queue / flagging workflow
- Usage analytics dashboard
- Payment processing

---

## 6. Functional Requirements

### 6.1 Template Library
- FR-1: System shall list active templates filterable by `occasionType`.
- FR-2: Each template defines `layoutConfig` — photo slot positions/sizes, text slot positions/fonts/max-length, color scheme, decorative asset references.
- FR-3: Template thumbnails shall render in a browsable gallery before user picks one.

### 6.2 Poster Input Form
- FR-4: Form shall capture: name, designation, party/organization, district/থানা/union, occasion type, Bangla headline text, up to 3 photos.
- FR-5: Photo upload shall validate file type (jpg/png), size (≤ 8MB), and minimum resolution suitable for print cropping.
- FR-6: Bangla text fields shall enforce max character counts per template's text slot to avoid overflow.
- FR-7: Form shall be usable end-to-end on mobile viewport (primary usage is mobile).

### 6.3 Generation Pipeline
- FR-8: On submit, system creates a `Poster` record with status `draft` → `generating`.
- FR-9: Gemini is called to (a) suggest photo crop/placement within slots and (b) suggest a decoration/color scheme matching occasion — **not** to render final Bangla text.
- FR-10: Final poster is rendered server-side (Puppeteer/node-canvas) compositing: template background, cropped photos, Gemini-suggested decoration, and user's exact Bangla text via HTML/CSS — guaranteeing spelling accuracy.
- FR-11: On success, status becomes `completed` with `generatedImageUrl`; on failure, `failed` with a logged reason.
- FR-12: Client polls `GET /api/posters/:id` for status until terminal state.

### 6.4 Preview & Regenerate
- FR-13: User sees a full preview before any download.
- FR-14: User may edit text fields and regenerate, up to a configurable retry limit (e.g., 3 per poster).

### 6.5 Export
- FR-15: Export produces PNG/JPG at minimum 1200×1600px.
- FR-16: PDF export wraps the same image at matching print dimensions (stretch-priority, MVP if time allows per phases.md).

### 6.6 History
- FR-17: Authenticated users see a list of their past posters (thumbnail, occasion, date, status) with re-download.

### 6.7 Auth
- FR-18: Register/login via email or phone + password; JWT issued on login, required on all `/api/posters*` and `/api/upload` routes.

---

## 7. Non-Functional Requirements

- **Performance:** Poster generation completes in ≤ 60s at p90.
- **Reliability:** Failed generations must never silently disappear — surfaced status + retry.
- **Security:** JWT-protected routes, signed/short-lived upload URLs, input sanitization on all form fields, rate limiting on `/api/posters` and `/api/upload`.
- **Content safety:** Basic prohibited-word/symbol filter on headline text and party name fields at submission time (lightweight MVP guard ahead of full moderation queue).
- **Scalability:** Stateless Express API behind a queue-friendly generation worker so Gemini/render load can scale horizontally later.
- **Accessibility/UX:** Bangla-first UI copy, large touch targets, works on low-end Android devices/slow connections.
- **Design quality:** Frontend must read as premium/professional on first impression — this is a stated product differentiator, not a nice-to-have (see rules.md §Design Principles).

---

## 8. User Stories (MVP)

1. *As a publicity agent*, I want to pick a "বিজয় দিবস" template, fill in my leader's name and my own designation, upload 2 photos, and get a print-ready poster — so I can send it to the press today.
2. *As a party worker*, I want to generate a condolence poster with a respectful tone and correct spelling of the deceased's name — so I don't have to hire a designer for a time-sensitive tribute.
3. *As a returning user*, I want to see my last 10 posters and re-download any of them — so I don't lose work if my phone storage clears.
4. *As any user*, I want to regenerate a poster if the AI-suggested layout looks off, without starting the form over — so I don't waste time.

---

## 9. Assumptions & Constraints

- Gemini API is used for layout/decoration suggestion only, not final text rendering (see architecture.md §Gemini Integration).
- Cloudinary or S3-compatible storage is assumed available for photo and generated-poster storage.
- MongoDB Atlas + Vercel deployment target per task.md.
- Admin/moderation are explicitly deferred — content-safety is handled via a lightweight submission-time filter only in MVP.

---

## 10. Open Questions (to resolve during build, tracked in memory.md)

- Exact retry limit for regeneration (default proposed: 3).
- Whether PDF export ships in MVP or slips to stretch (task.md lists it under both — phases.md resolves the call).
- Minimum template count for launch (task.md says 2–3 — confirm final count before Phase 1 close).
