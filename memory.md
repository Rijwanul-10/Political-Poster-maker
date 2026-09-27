# memory.md — Project Memory / Decision Log
## AI Political Poster Maker

Purpose: a single living file tracking decisions, open questions, and state across work sessions, so context isn't lost between sessions (human or AI-assisted). Update this file at the end of every work session — don't let it go stale.

---

## 1. Decisions Log

| Date | Decision | Reasoning |
|---|---|---|
| (seed) | Gemini used for layout/decoration suggestion only; final Bangla text rendered deterministically via HTML/CSS + Puppeteer/node-canvas | Raw AI image generation corrupts Bangla script; correctness is non-negotiable (architecture.md §6, rules.md §2) |
| (seed) | Admin panel, moderation queue, analytics deferred post-MVP; template management via seed script instead | Keep MVP shippable within deadline (task.md §7) |
| (seed) | Cloudinary preferred over raw S3 for MVP | Simpler signed-upload DX (architecture.md §9) |
| 2026-09-27 | Bangla fonts: Hind Siliguri (Body/UI) + Tiro Bangla (Display/Headline) | Clean, legible rendering in web UI and headless Puppeteer |
| 2026-09-27 | Render engine: Puppeteer on dedicated Express backend | Zero font rendering corruption, reliable headless canvas capture |
| 2026-09-27 | Regeneration retry cap: 3 per poster | Defined in Poster schema and enforced in `/api/posters/:id/regenerate` |
| 2026-09-27 | Client-side photo validation: Max 3 photos, Max 8MB each | Implemented in `/poster/create` with real-time feedback |

---

## 2. Session Notes

### Session 1 — Frontend & Backend Full Wiring
- Fixed MongoDB Atlas connection in backend `src/index.ts`.
- Seeded templates to database (`npm run seed:templates`).
- Built complete Next.js frontend:
  - AuthContext (`context/AuthContext.tsx`) with localStorage JWT persistence.
  - API client helper (`lib/api.ts`).
  - Navigation header (`components/Navbar.tsx`).
  - Bengali Political Poster Maker Landing Page (`app/page.tsx`).
  - Login (`app/login/page.tsx`) & Register (`app/register/page.tsx`) pages.
  - Template gallery with occasion filter tabs (`app/templates/page.tsx`).
  - Poster creation with client-side photo count/size validation (`app/poster/create/page.tsx`).
  - Real-time poster polling, download, and regenerate preview page (`app/poster/[id]/page.tsx`).
  - Created root `package.json` with convenience scripts.
- Verified both backend (`http://localhost:5000`) and frontend (`http://localhost:3000`) return 200 OK.
