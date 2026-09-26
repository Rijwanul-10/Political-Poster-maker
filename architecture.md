# architecture.md — System Architecture
## AI Political Poster Maker

---

## 1. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js (TypeScript) | App Router, mobile-first, deployed on Vercel |
| Backend | Express.js (TypeScript) | Separate deployable, also on Vercel (serverless functions) or a small Node server |
| Database | MongoDB (Mongoose) | Atlas-hosted |
| AI | Google Gemini API | Used narrowly — see §6 |
| Render engine | Puppeteer (headless Chromium) *or* node-canvas | Renders final poster HTML/CSS → image, guaranteeing Bangla text fidelity |
| File storage | Cloudinary (preferred) or S3-compatible bucket | Original photo uploads + generated poster images |
| Auth | JWT | Email/phone + password (OTP is a stretch alternative) |
| Fonts | Self-hosted Bangla webfonts (e.g., Hind Siliguri, Noto Sans Bengali, Tiro Bangla) | Bundled into the render pipeline, not reliant on system fonts |

---

## 2. High-Level System Diagram (textual)

```
┌────────────┐      HTTPS       ┌──────────────────┐
│  Next.js   │ ───────────────► │   Express API     │
│  Frontend  │ ◄─────────────── │  (TypeScript)      │
└────────────┘      JSON        └─────────┬─────────┘
                                            │
                 ┌──────────────────────────┼───────────────────────────┐
                 ▼                          ▼                           ▼
         ┌───────────────┐        ┌─────────────────┐         ┌─────────────────┐
         │   MongoDB      │        │  Gemini API      │         │ Cloudinary / S3  │
         │  (Mongoose)    │        │ (layout/decor     │         │ (photos +        │
         │  Users/        │        │  suggestion only) │         │  generated       │
         │  Templates/    │        └─────────────────┘         │  posters)         │
         │  Posters/      │                 │                   └─────────────────┘
         │  GenerationLog │                 ▼
         └───────────────┘        ┌─────────────────┐
                                    │ Render Worker     │
                                    │ (Puppeteer /      │
                                    │  node-canvas)     │
                                    │ HTML+CSS→PNG/PDF  │
                                    └─────────────────┘
```

---

## 3. Request/Generation Flow

1. **Client** submits poster form → `POST /api/upload` for each photo (returns Cloudinary/S3 URL) → `POST /api/posters` with form data + photo URLs + templateId.
2. **API** creates `Poster` doc with `status: draft`, immediately flips to `generating`, and kicks off the generation job (synchronous for MVP; queue-based if latency requires it later).
3. **Generation job**:
   a. Fetch `Template.layoutConfig`.
   b. Call **Gemini** with template metadata + occasion + photo URLs → get back: suggested crop/focal-point per photo, suggested decoration/color accent (JSON response, not an image).
   c. Merge Gemini's suggestions into the template's HTML/CSS layout (photo slots get crop coordinates; decoration layer gets chosen accent).
   d. Inject the user's **exact** Bangla text into fixed text slots — no AI text generation/rendering, avoiding spelling corruption.
   e. Render the composed HTML via Puppeteer at print resolution (≥1200×1600px), export PNG.
   f. (Stretch/MVP-conditional) Convert PNG → PDF.
   g. Upload result to Cloudinary/S3, save `generatedImageUrl` on the `Poster` doc, set `status: completed`.
   h. Log the attempt in `GenerationLog` (prompt used, tokens, latency, success).
4. **Client** polls `GET /api/posters/:id` until `status` is terminal (`completed`/`failed`), then shows preview.
5. **Regenerate**: `POST /api/posters/:id/regenerate` re-runs steps 3b–3h with edited fields, up to the retry cap.

---

## 4. Database Schema (MongoDB / Mongoose)

### User
```
{
  name: String,
  email: String,        // unique, sparse
  phone: String,        // unique, sparse
  passwordHash: String,
  role: 'user' | 'admin',
  createdAt: Date
}
```

### Template
```
{
  title: String,
  occasionType: 'bijoy_dibosh' | 'shok_sriti' | 'nirbachoni_procar' | 'shuvessa' | 'eid_utsob',
  thumbnailUrl: String,
  layoutConfig: {
    canvas: { width: Number, height: Number },
    photoSlots: [{ id, x, y, width, height, shape: 'cutout'|'rect'|'circle' }],
    textSlots: [{ id, x, y, maxWidth, maxChars, fontFamily, fontSize, color, role: 'headline'|'name'|'designation'|'footer' }],
    decoration: { baseAssets: [String], colorSchemeOptions: [String] }
  },
  isActive: Boolean
}
```

### Poster
```
{
  userId: ObjectId (ref User),
  templateId: ObjectId (ref Template),
  formData: {
    name, designation, party, district, union, occasionType, headlineText
  },
  uploadedPhotoUrls: [String],
  geminiSuggestion: { crops: [...], colorScheme: String },  // cached
  generatedImageUrl: String,
  generatedPdfUrl: String,   // optional
  status: 'draft' | 'generating' | 'completed' | 'failed',
  regenerateCount: Number,
  createdAt: Date
}
```

### GenerationLog *(optional, cost tracking)*
```
{
  posterId: ObjectId (ref Poster),
  geminiPromptUsed: String,
  tokensUsed: Number,
  latencyMs: Number,
  success: Boolean,
  createdAt: Date
}
```

---

## 5. API Contract (Express)

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/templates                 # ?occasion=bijoy_dibosh
GET    /api/templates/:id

POST   /api/upload                    # multipart photo → { url }

POST   /api/posters                   # create + trigger generation
GET    /api/posters/:id               # poll status/result
GET    /api/posters/user/:userId      # history
POST   /api/posters/:id/regenerate
DELETE /api/posters/:id

# Deferred to post-MVP admin
POST   /api/admin/templates
PATCH  /api/admin/templates/:id
DELETE /api/admin/templates/:id
GET    /api/admin/posters
```

All `/api/posters*` and `/api/upload` routes require `Authorization: Bearer <JWT>`.

---

## 6. Gemini Integration — Design Decision

**Chosen approach: Option B — AI-assisted layout + deterministic HTML/Canvas render.**

- Gemini is called **once per generation** (or once per template, cached, to control cost) to return **structured JSON**, not pixels:
  - Suggested crop box / focal point per uploaded photo (so faces aren't cut off inside circular/cutout slots).
  - Suggested decorative color scheme or background variant matching the occasion's mood.
- The **actual poster** — including all Bangla text — is composed by the app itself via an HTML/CSS template rendered through Puppeteer (or drawn via node-canvas), using the user's exact input strings.
- **Why:** raw AI image generation of Bangla script is unreliable (misspellings, malformed conjuncts). Deterministic rendering guarantees correctness while Gemini still contributes real creative value (composition/color).
- **Cost control:** template-level decoration outputs (background/color scheme per occasion) are cached and reused across users where the template hasn't changed; only per-user photo-crop suggestions are called fresh each time.
- Gemini calls are wrapped with structured-output prompting (see anthropic_api pattern: instruct Gemini to return JSON only) and defensive parsing with a safe fallback (default crop = center-crop, default scheme = template default) if the call fails or times out — generation must never hard-fail just because Gemini is slow.

---

## 7. Frontend Architecture (Next.js)

- **Routes:**
  - `/` — landing/marketing (this is the first-impression page — see rules.md §Design Principles)
  - `/templates` — gallery, filter by occasion
  - `/create/[templateId]` — form + live preview panel
  - `/poster/[id]` — result/preview/regenerate/export
  - `/history` — user's past posters
  - `/login`, `/register`
- **State:** form state local (React state/Context); poster generation status via polling hook (`usePosterStatus(id)`).
- **Design system:** shared Tailwind config + component library (buttons, cards, form fields, upload dropzone, status/loading states) so every screen — not just the poster output — feels considered and premium.
- **Image handling:** client-side compression/preview before upload to keep upload fast on mobile networks.

---

## 8. Backend Architecture (Express)

- Layered: `routes → controllers → services → models`.
- `services/geminiService.ts` — isolated Gemini client, JSON-only prompting, retry/fallback logic.
- `services/renderService.ts` — Puppeteer/node-canvas rendering, isolated so the render engine can be swapped later.
- `services/storageService.ts` — abstraction over Cloudinary/S3 so provider can change without touching controllers.
- `middleware/auth.ts` — JWT verification.
- `middleware/rateLimit.ts` — applied to `/api/posters` and `/api/upload`.
- `middleware/contentFilter.ts` — lightweight prohibited-word/symbol check on `formData.headlineText` / `party` before generation starts.

---

## 9. Deployment

- Frontend → Vercel.
- Backend → Vercel serverless functions (Puppeteer needs a compatible runtime — e.g., `@sparticuz/chromium` for serverless Chromium — or a small dedicated Node server/container if Puppeteer proves too heavy for serverless cold starts; decision logged in memory.md once benchmarked).
- Database → MongoDB Atlas.
- File storage → Cloudinary (simpler signed-upload DX than raw S3 for MVP).

---

## 10. Key Architectural Risks

1. **Puppeteer on serverless** — cold starts / binary size can be painful on Vercel. Fallback: node-canvas (no headless browser) if this becomes a blocker — flagged for a spike early in Phase 2.
2. **Gemini latency** — must not block the whole request; poll-based status pattern already isolates this.
3. **Bangla font embedding** — fonts must be bundled/embedded in the render environment, not assumed present on the render server's OS.
