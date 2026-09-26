# design.md — Visual Design System
## AI Political Poster Maker

This file is the single source of truth for visual design decisions — the concrete spec that Phase 0 (phases.md) implements and that every later screen is checked against (rules.md §1, §5). Where this file and rules.md overlap, this file wins on specifics (exact values); rules.md wins on principles.

---

## 1. Design Direction

**Feeling to evoke:** civic pride, trust, and craft — not "tech startup," not "government form." The reference posters (bold Bangla headline, leader photo cutouts, floral borders, flag-color palette, footer credit line) are the aesthetic DNA. The UI borrows their *confidence and warmth*, not their literal density — the app itself should feel calm, premium, and fast; the *posters it produces* carry the bold decorative language.

**One-line brief:** *"A calm, confident, Bangla-first tool that makes something visually loud (the poster) through an interface that is visually quiet and precise."*

**Avoid:** generic SaaS blue/purple gradients, centered-icon feature grids, default shadcn look with no customization, stock illustration packs, Latin-first layouts with Bangla as an afterthought.

---

## 2. Color System

### 2.1 Brand palette (UI chrome — used tastefully, not literally)
| Token | Hex (proposed) | Use |
|---|---|---|
| `--color-primary` | #0B6E4F (deep green) | Primary actions, links, active states — echoes flag green without being flag-literal |
| `--color-primary-dark` | #084C37 | Hover/pressed states, dark headers |
| `--color-accent` | #C8102E (deep red) | Sparingly — key CTAs, status "urgent/failed," occasion tags for condolence/tribute |
| `--color-gold` | #D4A017 | Decorative accents, dividers, premium/stretch-tier badges — echoes floral-border gold |
| `--color-ink` | #1A1A1A | Primary text |
| `--color-ink-soft` | #4A4A4A | Secondary text |
| `--color-surface` | #FFFFFF | Cards, form surfaces |
| `--color-surface-warm` | #FBF8F2 | Page background — warm off-white, not clinical white |
| `--color-border` | #E5E0D5 | Hairline borders, dividers |
| `--color-success` | #1E7A3D | Generation completed |
| `--color-warning` | #B8860B | Regeneration/retry states |
| `--color-danger` | #C8102E | Failed generation, validation errors |

**Rule:** no more than one saturated accent color (`--color-accent` or `--color-gold`) visible per screen at a time, outside of the poster preview itself. The UI stays restrained so the *poster* is the visual payload.

### 2.2 Dark mode
Not required for MVP (phases.md does not scope it). If added post-MVP, invert `--color-surface`/`--color-surface-warm` to deep green-black (`#0D1410`) rather than pure black, to stay on-brand.

---

## 3. Typography

### 3.1 Font pairing (to be confirmed in memory.md once licensing/embedding is verified — see memory.md open questions)
| Role | Proposed font | Fallback stack |
|---|---|---|
| Bangla display (headings, hero, poster-adjacent UI) | Tiro Bangla or Baloo Da 2 (bold weight) | `'Tiro Bangla', 'Noto Serif Bengali', serif` |
| Bangla/Latin body (UI copy, forms) | Hind Siliguri | `'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif` |
| Latin-only fallback (rare — numbers, codes) | Inter | `'Inter', system-ui, sans-serif` |

**Rule:** the display font is reserved for headings and hero moments only — never for body copy or form labels, where legibility at small sizes matters more than character.

### 3.2 Type scale (rem, mobile-first — scale up ~1.125× at desktop breakpoint)
| Token | Size (mobile) | Weight | Use |
|---|---|---|---|
| `--text-display` | 2.25rem | 700 | Landing hero headline |
| `--text-h1` | 1.75rem | 700 | Page titles |
| `--text-h2` | 1.375rem | 600 | Section headers |
| `--text-h3` | 1.125rem | 600 | Card titles |
| `--text-body` | 1rem | 400 | Default copy |
| `--text-small` | 0.875rem | 400 | Helper text, metadata |
| `--text-caption` | 0.75rem | 500 | Status badges, timestamps |

Line height: 1.5 for body, 1.25 for headings. Bangla script needs slightly more line-height than Latin at the same weight — verify visually in Phase 0, adjust token if conjuncts feel cramped.

---

## 4. Spacing & Layout

- Base unit: **4px**. Spacing tokens: `--space-1` (4px) through `--space-16` (64px), in the standard 4/8/12/16/24/32/48/64 progression.
- Page gutters: 16px mobile, 24px tablet, 48px+ desktop (max content width 1200px, centered).
- Card radius: `--radius-md` = 12px (soft, not sharp; not pill-shaped either — avoid the "everything is a pill button" tell).
- Elevation: exactly two shadow levels (`--shadow-sm` for cards at rest, `--shadow-md` for active/hover/modal) — no arbitrary shadow proliferation.

---

## 5. Core Components (built in Phase 0, per phases.md)

1. **Button** — primary (filled, `--color-primary`), secondary (outline), ghost (text-only), danger (`--color-accent`). All with defined hover/active/disabled/loading states. Loading state shows an inline spinner + disables interaction, never a bare state change.
2. **Input / Textarea** — label above field (Bangla label first-class, not placeholder-only), helper text slot, error state with `--color-danger` border + inline message, character counter for fields with `maxChars` (ties to Template.layoutConfig textSlots — rules.md §2 Backend).
3. **Upload Dropzone** — drag-or-tap, shows thumbnail preview post-upload, per-photo crop-hint overlay once Gemini suggestion returns (architecture.md §6), clear remove/replace affordance.
4. **Card** — used for template gallery items and history entries; consistent internal padding (`--space-4`), thumbnail + title + occasion tag + metadata row.
5. **Occasion Tag / Badge** — small pill, color-coded per occasion category (e.g., বিজয় দিবস → green/gold, শোক/স্মরণ → muted grey/deep red, নির্বাচনী প্রচার → primary green, ঈদ/উৎসব → gold) — gives the template gallery visual rhythm without needing real photography for every card.
6. **Status Badge** — draft / generating / completed / failed, each with distinct color + icon (not color alone — see §7 Accessibility).
7. **Generation Progress State** — a purpose-built component (not a generic spinner) showing pipeline-stage messaging per rules.md §1.6: "Placing photos…" → "Choosing colors…" → "Rendering poster…" → "Done." Drives home that real work is happening, sets expectation for the ~seconds-long wait.
8. **Preview Frame** — the poster result gets a subtle frame/shadow treatment (like a printed piece on a surface) rather than a bare `<img>` — reinforces the "this is print-ready" promise.

---

## 6. Screen-Level Direction

### 6.1 Landing (`/`)
- Hero: bold Bangla headline (display font), one clear CTA ("টেমপ্লেট দেখুন" / start creating), a real sample poster image (not a mockup/illustration) as the dominant visual — the product's output IS the marketing asset.
- Below fold: 3–4 occasion categories shown as visually distinct cards (not identical icon+text blocks), each hinting at its color/mood (§5.5).
- Footer: minimal, credit-line-style nod to the "প্রচারে" convention from the posters themselves — a subtle brand echo, not a gimmick.

### 6.2 Template Gallery (`/templates`)
- Filter chips by occasion at top (touch-friendly, horizontally scrollable on mobile).
- Grid of template cards with real thumbnail renders (from seeded assets) — no placeholder grey boxes in the shipped product.

### 6.3 Create/Form (`/create/[templateId]`)
- Two-pane on desktop (form left, live/skeleton preview right), single-column stacked on mobile with the preview accessible via a sticky "see preview" affordance — form must never feel like a bare data-entry page.
- Progressive disclosure: photo upload and text fields grouped in clearly labeled sections, not one long undifferentiated form.

### 6.4 Preview/Result (`/poster/[id]`)
- Poster shown large, centered, framed (§5.8).
- Regenerate and Download actions clearly separated (Download is primary/filled; Regenerate is secondary/outline) so users don't accidentally re-spend a retry.
- Failed state has a real illustrated/iconographic treatment + plain-language reason + retry CTA — never a raw error string.

### 6.5 History (`/history`)
- List/grid of past posters, thumbnail-first, occasion tag + date visible without opening — scannable at a glance.

---

## 7. Accessibility & Localization

- Bangla is the primary language throughout the product UI, not a toggle-on afterthought — English strings (if any) are secondary/fallback.
- Never convey status by color alone — pair every status color with an icon and a text label (colorblind-safe).
- Minimum touch target: 44×44px on all interactive elements (mobile-first user base, rules.md §1.5).
- Color contrast: body text against `--color-surface-warm` must meet WCAG AA (4.5:1) — verify `--color-ink` / `--color-ink-soft` against the warm background, not just pure white, during Phase 0 build.

---

## 8. What "Astonishing" Looks Like Here (design acceptance bar)

Per rules.md §1 and §5, a screen is not done until it clears this bar:
1. It could not be mistaken for an unstyled/default component-library screen.
2. It uses the palette and type scale in this file consistently — no one-off colors or fonts introduced ad hoc.
3. The Bangla text throughout looks *native*, not translated-as-an-afterthought (correct font, correct line-height, correct reading rhythm).
4. At least one moment per key screen (landing hero, generation progress, preview frame) has a deliberate "craft" detail beyond the minimum functional requirement.
5. It holds up on a real mobile device at typical Bangladeshi mobile-network speed — not just on a fast desktop preview.

---

## 9. Open Design Questions (tracked in memory.md)
- Final font licensing/embedding confirmation (Tiro Bangla vs. Baloo Da 2 vs. alternative).
- Whether occasion-tag colors (§5.5) need contrast-checked variants for accessibility once actual hex values are finalized.
- Whether the landing hero uses a real generated sample poster or a curated seed-template thumbnail (decide once Phase 1 seed templates exist).
