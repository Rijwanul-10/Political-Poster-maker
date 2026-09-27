# 🎨 Poster Karigor (পোস্টার কারিগর)
### AI-Powered Bangladeshi Political & Cultural Poster Generator

A high-performance full-stack web platform built for grassroots committee members, political activists, publicity organizers, and local leaders in Bangladesh to compose, customize, and generate print-ready, high-resolution political and cultural posters in seconds.

---

## 🌟 Key Highlights & Features

- **🌐 100% Bilingual Experience (বাংলা / English):** One-click seamless language switcher across the entire application—landing page, poster studio, user history, auth pages, and admin console.
- **✨ iPhone Glassmorphism UI:** Fluid, responsive dark/light frosted glass interface inspired by iOS human interface guidelines, featuring translucent blur overlays and crisp typography.
- **🤖 Intelligent AI Custom Design Prompts:** Powered by Google's Gemini Vision API. Users can describe their desired aesthetic (e.g., *"Royal blue & gold luxury border"*, *"Dark emerald patriotic VIP theme"*), and the system automatically calculates harmonious palettes and decoration motifs.
- **👥 Multi-Photo Titles & Leader Hierarchy:** Upload up to 3 individual photographs with customizable titles and designations (e.g., *Chief Guest*, *President*, *General Secretary*, *Campaigner*).
- **🗳️ Mandatory Party Insignia & Secondary Logos:** Presets for authentic political parties (Awami League, BNP, Jatiya Party, Jamaat, Left Alliance, etc.) plus custom PNG/SVG logo uploads for student and youth affiliate wings.
- **🖼️ 12 Distinct Architectural Templates:** Seeded across 10 occasions (Election Campaigns, Rallies, Victory Day, Eid, Independence Day, Language Movement Day, Memorial, etc.) with diverse layouts (cutout frames, circular portraits, modern grids).
- **⚡ Bulk CSV Generation:** Upload a spreadsheet with names, designations, and constituencies to batch-render hundreds of personalized committee posters instantly.
- **🛡️ Server-Enforced Watermark & Payment Gateway:** Free tier includes a discreet watermark; users can verify a simulated or real bKash/Nagad mobile payment (50 BDT) for watermark removal and HD export.
- **👑 Full-Featured Admin Telemetry Console (`/admin`):**
  - **Overview & Diagnostics:** Total user registrations, generation success rates, total revenue in BDT, server uptime, and database health.
  - **Live Records Display:** Recent users, recent poster outputs, payment transactions, and generation engine logs.
  - **Content Moderation:** Instant visual queue with one-click purge for inappropriate or unauthorized posters.
  - **Template CRUD:** Real-time creation, activation toggle, and deletion of template styles.
- **🚦 Production Rate Limiting:** Enforces generation rate limits (15 requests per 15 minutes per user/IP) to prevent service abuse and protect backend rendering resources.

---

## 🏗️ System Architecture & Tech Stack

```
political-poster-maker/
├── backend/                  # Node.js + Express + TypeScript API Server
│   ├── src/
│   │   ├── middleware/       # Auth (JWT), Admin privileges, Rate Limiter
│   │   ├── models/           # Mongoose schemas (User, Template, Poster, Payment, Log, Otp)
│   │   ├── routes/           # REST endpoints (auth, posters, templates, admin, payments)
│   │   ├── services/         # Gemini Vision AI, Puppeteer HTML/CSS renderer, Cloudinary/Local storage
│   │   └── seedTemplates.ts  # Database template seeder script
├── frontend/                 # Next.js 15 (App Router) + React 19 + TypeScript
│   ├── src/
│   │   ├── app/              # Routes: /, /login, /register, /poster/create, /poster/[id], /history, /admin
│   │   ├── components/       # Glass Navbar, Bilingual Footer, Google Auth, UI widgets
│   │   ├── context/          # AuthContext (JWT session), LanguageContext (BN/EN state)
│   │   └── lib/              # API fetch wrapper, helper functions
└── package.json              # Monorepo task orchestration
```

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose |
| **Database** | MongoDB Atlas (Cloud) / Local MongoDB |
| **Poster Renderer** | Puppeteer (Headless Chrome server-side rendering to high-res PNG) |
| **AI Vision Engine** | Google Gemini API (`gemini-3.8-flash`) with smart deterministic caching |
| **File Storage** | Cloudinary / Local disk buffer fallback |
| **Security** | Helmet, CORS, bcryptjs, JSON Web Tokens (JWT), express-rate-limit |

---

## 🚀 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or 20 LTS recommended)
- [MongoDB](https://www.mongodb.com/) (local community server running or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- [Google Gemini API Key](https://aistudio.google.com/)

---

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Rijwanul-10/Political-Poster-maker.git
cd "Political Poster maker"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

---

### Step 2: Configure Environment Variables

#### Backend Configuration (`backend/.env`):
Create `backend/.env` with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/political_poster_maker?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_change_in_production
GEMINI_API_KEY=your_google_gemini_api_key_here

# Optional: Cloudinary Storage (if omitted, local disk storage is used automatically)
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret

# Optional: SMTP Email configuration for OTP verification (if omitted, test mailer is used)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_app_password
```

#### Frontend Configuration (`frontend/.env.local`):
Create `frontend/.env.local` with the following variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
# Optional: Google OAuth Client ID for Google Single Sign-On
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

---

### Step 3: Seed Database Templates & Admin Account

Run the database seed script to populate the 12 curated templates and ensure the default administrator credentials exist:

```bash
cd backend
npm run seed
cd ..
```

> **Default Admin Credentials:**
> - Email: `admin@poster-maker.com`
> - Password: `AdminPassword@123`

---

### Step 4: Run the Development Servers

Open two terminal windows or use root scripts:

```bash
# Terminal 1: Start Backend (Port 5000)
npm run dev:backend

# Terminal 2: Start Frontend (Port 3000)
npm run dev:frontend
```

Now open your browser and navigate to:
- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **Admin Console:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)

---

## 🌐 Production Deployment Guide

### Part 1: MongoDB Atlas Setup (Database)
1. Sign up or log into [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a new cluster (the free M0 tier works great for starting).
3. Under **Database Access**, create a database user with read/write permissions.
4. Under **Network Access**, add an IP Access entry for `0.0.0.0/0` (allowing serverless platforms like Vercel or cloud containers to connect).
5. Click **Connect** → **Drivers** (Node.js) and copy the connection string. Replace `<password>` with your database user password and specify the database name (`political_poster_maker`).

---

### Part 2: Backend Deployment

Because the backend utilizes **Puppeteer** to execute server-side HTML/CSS rendering to generate print-ready PNG files, we recommend deploying the backend to **Render**, **Railway**, **Fly.io**, or a **VPS (DigitalOcean / AWS EC2)** where Chromium is installed.

#### Option A: Deploying on Render / Railway / Docker
1. Link your GitHub repository.
2. Set the root directory to `backend`.
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Configure Environment Variables in the service settings:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI=<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET=<Your Secure 64-character Random Secret>`
   - `GEMINI_API_KEY=<Your Gemini API Key>`
   - `PUPPETEER_EXECUTABLE_PATH` *(Optional on Render)*:
     - **Default (Standard Render Web Service):** Leave `PUPPETEER_EXECUTABLE_PATH` **blank/unset**. Puppeteer automatically installs and manages Chromium inside `node_modules` during `npm install`.
     - **If using Docker / Custom Linux Buildpack:** Set to `/usr/bin/google-chrome-stable` or `/usr/bin/chromium-browser`.
6. Once deployed, note down your production backend URL (e.g. `https://poster-maker-api.onrender.com`).

#### Option B: Deploying Backend as Serverless on Vercel
If hosting the backend on Vercel:
1. Create a `vercel.json` in the `backend/` directory configured with `@vercel/node`.
2. Add `@sparticuz/chromium-min` or use external rendering API if headless Chrome binary exceeds the 50MB AWS Lambda limit.

---

### Part 3: Frontend Deployment (Vercel)

Vercel is the native, optimal home for Next.js 15:
1. Log into your [Vercel Dashboard](https://vercel.com/) and click **Add New** → **Project**.
2. Select your repository.
3. In **Root Directory**, click *Edit* and select `frontend`.
4. The Build & Output settings will automatically detect Next.js:
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: Your live backend API URL (e.g. `https://poster-maker-api.onrender.com/api`)
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID (optional)
6. Click **Deploy**. Vercel will build and provision your edge-optimized frontend.

---

## 📡 Key REST API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/send-registration-otp` | Sends 6-digit verification code to email |
| `POST` | `/register-with-otp` | Verifies OTP and registers account |
| `POST` | `/login` | Authenticates with email/phone & password |
| `POST` | `/google` | Verifies Google Identity Services token |
| `POST` | `/forgot-password` | Initiates password reset OTP flow |

### 🖼️ Poster Generation (`/api/posters`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Creates a poster generation job *(Protected by Rate Limiter)* |
| `GET` | `/:id` | Fetches poster metadata and generated image URL |
| `POST` | `/:id/regenerate` | Requests layout retry *(Max 3 retries, rate-limited)* |
| `GET` | `/user/:userId` | Retrieves user's poster generation history |
| `DELETE`| `/:id` | Deletes a poster |

### 🎨 Templates & Administration (`/api/admin`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/stats` | Comprehensive admin telemetry, overview metrics & logs |
| `GET` | `/templates` | Lists all templates including inactive |
| `POST` | `/templates` | Adds a new template configuration |
| `PATCH` | `/templates/:id` | Toggles template activation status |
| `DELETE`| `/templates/:id` | Deletes a template |
| `GET` | `/posters` | Live content moderation queue |
| `DELETE`| `/posters/:id` | Purges flagged or inappropriate poster |

### 💳 Payments (`/api/payments`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/verify` | Validates bKash/Nagad TrxID for watermark removal |
| `GET` | `/user` | Retrieves user's verified transactions |

---

## 🔒 Security & Best Practices

- **Strict Input Sanitization:** All user text strings (Bangla and English) are normalized and escaped before passing to layout generators and Puppeteer DOM.
- **Server-Side Watermark Enforcement:** The watermark cannot be disabled on the client side; the backend verifies payment records in MongoDB before rendering un-watermarked high-res exports.
- **Rate Limiting:** Protects backend computational and rendering resources from spamming and automated bots.
- **Fail-Safe Fallback:** If the Gemini Vision API experiences high demand or downtime (503/429), an internal deterministic design heuristics engine immediately activates to guarantee poster delivery without interruption.

---

## 📄 License & Copyright
© 2026 **Rizwanul Kafi**. All Rights Reserved.

This project is open-source under the [MIT License](LICENSE).
