# SocialSync

**AI-assisted social media management.** Draft captions and hashtags with Google Gemini, schedule
posts across Instagram, Facebook, X and LinkedIn, and track engagement on a dashboard.

> ⚠️ **Publishing and account connections are simulated.** No OAuth handshake happens and nothing is
> sent to the real platforms. A cron job marks scheduled posts as published inside SocialSync and
> attaches generated engagement numbers, so the scheduling and analytics flows work end to end.
> Wiring up the real platform APIs is the main piece of outstanding work — see
> [Roadmap](#roadmap).

---

## Table of contents

- [Features](#features)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone and install](#1-clone-and-install)
  - [2. Configure environment variables](#2-configure-environment-variables)
  - [3. Run the app](#3-run-the-app)
  - [4. Try it out](#4-try-it-out)
- [Scripts](#scripts)
- [Testing and CI](#testing-and-ci)
- [API reference](#api-reference)
- [Scheduler internals](#scheduler-internals)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)

---

## Features

| Area | What you get |
|---|---|
| 🔐 **Auth** | Email/password registration and login with JWT. Login and register are rate limited. |
| 🔗 **Accounts** | Connect one account per platform (Instagram, Facebook, X, LinkedIn). *Simulated — see note above.* |
| ✨ **AI captions** | Describe a topic, pick a platform and tone, and get three caption + hashtag options from Gemini. Five tones: casual, professional, promotional, inspirational, humorous. Falls back to template captions if no API key is set. |
| ✏️ **Post editor** | Choose an option, refine the caption and hashtags, attach an image (≤ 2 MB), and see a live preview. Save as a draft or schedule it. |
| 📅 **Calendar** | Month view with colour-coded dots for drafts, scheduled and published posts. Click a day to see its posts; click a post to edit or delete it. |
| ⏰ **Scheduler** | A background job checks every minute for due posts and publishes them. Safe to run on more than one server instance. |
| 📊 **Analytics** | Likes, comments, shares and reach over the last 7, 14 or 30 days, broken down per day and per platform, plus a top-posts table. |
| 🏠 **Dashboard** | Post counts by status, recent posts, upcoming posts and a mini engagement chart. |

---

## How it works

```
Register / Login
      │
      ▼
Connect a platform  ──────────────────────────────┐
      │                                           │
      ▼                                           │
Create post ──► Generate captions (Gemini) ──► Refine ──► Save draft
                                                  │
                                                  └──► Schedule
                                                         │
                                            every minute ▼
                                        Scheduler publishes due posts
                                          (simulated, adds engagement)
                                                         │
                                                         ▼
                                          Dashboard & Analytics update
```

A post moves through these statuses:

```
draft ──► scheduled ──► publishing ──► published
              ▲             │
              └─────────────┴──► failed
```

`publishing` is a short-lived lock held by the scheduler while it works on a post.

---

## Tech stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router 7, Bootstrap 5 + Bootstrap Icons, Recharts, react-hook-form, react-calendar, axios |
| **Backend** | Node 20, Express 4 (CommonJS), MongoDB with Mongoose 8, JWT (`jsonwebtoken`), `bcryptjs`, `node-cron`, `express-rate-limit`, `helmet` |
| **AI** | Google Gemini via the OpenAI-compatible endpoint (`openai` SDK) |
| **Testing** | Vitest, Supertest, `mongodb-memory-server` |
| **Tooling** | ESLint, GitHub Actions, Vercel (frontend) |

The `backend` and `frontend` folders are **independent packages** — there is no root `package.json`,
so install and run each one separately.

---

## Project structure

```
Social_Sync_Webapp/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app (middleware, routes, error handler)
│   │   ├── server.js           # Entry point: loads env, connects DB, starts scheduler
│   │   ├── config/db.js        # Mongoose connection
│   │   ├── controllers/        # Route handlers (auth, posts, accounts, content, analytics)
│   │   ├── routes/             # Express routers
│   │   ├── models/             # User, Post, SocialAccount
│   │   ├── middleware/         # JWT `protect`, rate limiters
│   │   ├── services/           # openaiService (Gemini), publisherService (scheduler logic)
│   │   ├── jobs/scheduler.js   # node-cron job that runs every minute
│   │   └── utils/
│   ├── tests/                  # Vitest + Supertest integration tests
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Routes
│   │   ├── components/         # auth, dashboard, editor, schedule, analytics, accounts, common
│   │   ├── context/            # AuthContext, PostsContext, AccountsContext, ToastContext
│   │   ├── services/           # axios wrappers per API resource
│   │   ├── constants/          # Platform metadata (names, colours, icons)
│   │   └── utils/
│   ├── vercel.json             # SPA rewrite for client-side routing
│   └── .env.example
│
└── .github/workflows/ci.yml    # Lint + test + build on every push / PR
```

---

## Getting started

### Prerequisites

| Requirement | Notes |
|---|---|
| **Node.js 20+** | Check with `node -v` |
| **MongoDB** | A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster or a local `mongod` |
| **Google AI Studio API key** | *Optional.* Get one at [aistudio.google.com](https://aistudio.google.com). Without it the app uses template captions. |

### 1. Clone and install

```bash
git clone <your-repo-url> Social_Sync_Webapp
cd Social_Sync_Webapp

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

Both packages ship a `.env.example`. Copy each one to `.env` and fill in the values.

```bash
cp backend/.env.example  backend/.env
cp frontend/.env.example frontend/.env
```

**Backend — `backend/.env`**

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | ✅ | — | Atlas SRV string or local `mongodb://` URI |
| `JWT_SECRET` | ✅ | — | Long random string. Generate with `openssl rand -base64 48` |
| `JWT_EXPIRES_IN` | | `7d` | Token lifetime |
| `PORT` | | `5000` | API port |
| `NODE_ENV` | | `development` | `development` / `production` / `test` |
| `CLIENT_URL` | | `http://localhost:5173` | Allowed CORS origins, comma-separated. `*` is a wildcard, e.g. `https://my-app-*.vercel.app` for Vercel previews |
| `GEMINI_API_KEY` | | — | Enables real AI captions. Omit to use the template fallback |
| `GEMINI_MODEL` | | `gemini-2.5-flash-lite` | Any Gemini model available on the OpenAI-compatible endpoint |
| `GEMINI_BASE_URL` | | Google's endpoint | Override only if you proxy the API |
| `FORCE_PUBLIC_DNS` | | unset | **Local only.** See [Troubleshooting](#troubleshooting) |

The `FACEBOOK_*`, `TWITTER_*` and `LINKEDIN_*` variables in `.env.example` are placeholders for
future OAuth work and are not read by the code yet.

**Frontend — `frontend/.env`**

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL of the API, including the `/api` prefix |

### 3. Run the app

Open two terminals:

```bash
# Terminal 1 — API on http://localhost:5000
cd backend
npm run dev

# Terminal 2 — UI on http://localhost:5173
cd frontend
npm run dev
```

### 4. Try it out

1. Open http://localhost:5173 and **register** an account.
2. Go to **Accounts** and connect at least one platform (any username and token will do — it's simulated).
3. Go to **Create Post**, enter a topic, choose a platform and tone, and click **Generate Content**.
4. Pick one of the three options, tweak it, and **schedule** it a couple of minutes from now.
5. Watch the **Schedule** page — within a minute of the scheduled time the scheduler marks it
   *published* and the **Dashboard** and **Analytics** pages update.

---

## Scripts

| Package | Command | What it does |
|---|---|---|
| `backend` | `npm run dev` | Start the API with nodemon (auto-restart on change) |
| `backend` | `npm start` | Start the API with plain `node` |
| `backend` | `npm test` | Run the test suite once |
| `backend` | `npm run test:watch` | Run tests in watch mode |
| `backend` | `npm run lint` | Lint `src/` and `tests/` |
| `frontend` | `npm run dev` | Vite dev server with HMR |
| `frontend` | `npm run build` | Production build into `dist/` |
| `frontend` | `npm run preview` | Serve the production build locally |
| `frontend` | `npm test` | Run frontend unit tests |
| `frontend` | `npm run lint` | Lint the app |

---

## Testing and CI

The backend has integration tests in `backend/tests/` covering auth, posts, the publisher/scheduler,
analytics and rate limiting. They spin up an in-memory MongoDB, so **no database or `.env` is needed
to run them**:

```bash
cd backend && npm test
```

The frontend currently has unit tests for date utilities (`src/utils/datetime.test.js`).

GitHub Actions (`.github/workflows/ci.yml`) runs on every push to `main` and every pull request:

- **Backend:** `npm ci` → lint → tests
- **Frontend:** `npm ci` → lint → tests → production build (catches case-sensitive import errors
  that Windows hides)

---

## API reference

All routes are prefixed with `/api`. Every route except `register`, `login` and the health checks
requires an `Authorization: Bearer <jwt>` header. Responses are JSON with a `success` boolean.

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Liveness check (no `/api` prefix) |
| `GET` | `/api/health` | Uptime and environment |

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Create an account. **Rate limit:** 10 attempts / 15 min per IP |
| `POST` | `/auth/login` | Get a JWT. Same limiter; successful logins are not counted |
| `GET` | `/auth/me` | Current user |

### Posts

| Method | Path | Description |
|---|---|---|
| `GET` | `/posts` | The user's posts. Optional `?status=` and `?platform=` filters. Omits `image` — use the detail route for that |
| `POST` | `/posts` | Create a `draft` or `scheduled` post |
| `GET` | `/posts/stats` | Counts by status |
| `GET` | `/posts/:id` | One post, including its image |
| `PUT` | `/posts/:id` | Edit a post. `engagement` is read-only; `status` may only move between `draft` and `scheduled` |
| `DELETE` | `/posts/:id` | Remove a post |

### Accounts

| Method | Path | Description |
|---|---|---|
| `GET` | `/accounts` | Connected accounts (tokens stripped) |
| `POST` | `/accounts/connect` | Connect a platform. Body: `{ platform, username, accessToken }`. *Simulated* |
| `DELETE` | `/accounts/:platform` | Disconnect |

### Content and analytics

| Method | Path | Description |
|---|---|---|
| `POST` | `/content/generate` | AI captions. Body: `{ topic, platform, tone }`. **Rate limit:** 20 / hour per user |
| `GET` | `/analytics?range=7\|14\|30` | Engagement aggregated from the user's published posts |

---

## Scheduler internals

`jobs/scheduler.js` runs `publisherService.publishDuePosts()` every minute. It is designed to be safe
under concurrency:

1. **Atomic claim.** Each due post is claimed with a single `findOneAndUpdate` that flips
   `scheduled → publishing`. If two ticks overlap, or two server instances run, only one of them
   wins the claim — a post is never published twice.
2. **Publish.** The claimed post is (currently) marked `published` with a mock platform ID and
   generated engagement numbers. If the user has no account for that platform, it is marked `failed`
   with a reason.
3. **Stale-claim recovery.** A post left in `publishing` by a crashed process is released back to
   `scheduled` after ten minutes. This sweep also runs once at startup.

---

## Deployment

**Frontend (Vercel).** `frontend/vercel.json` rewrites every path to `index.html` so client-side
routing works on refresh. Set `VITE_API_URL` to your deployed API URL (with `/api`) in the Vercel
project settings.

**Backend (any Node host — Render, Railway, Fly, etc.).**

- Run `npm start` from the `backend` directory.
- Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL` to your frontend's
  origin(s). Include a wildcard entry such as `https://my-app-*.vercel.app` if you want Vercel
  preview deployments to work.
- Do **not** set `FORCE_PUBLIC_DNS` in a hosted environment.
- The scheduler starts automatically with the server; if you scale to several instances the atomic
  claim keeps them from double-publishing.

---

## Troubleshooting

**`querySrv ECONNREFUSED` / cannot connect to MongoDB Atlas locally.**
Some ISPs and networks fail the Atlas SRV DNS lookup. Set `FORCE_PUBLIC_DNS=true` in `backend/.env`
to route lookups through Google's resolvers. This is a local-only workaround — never enable it on a
hosted environment, where it overrides DNS for the whole process and breaks internal name resolution.

**Captions look generic / templated.**
`GEMINI_API_KEY` is missing or invalid. The app silently falls back to templates; check the backend
console for a `No GEMINI_API_KEY set` or `Gemini error` line.

**CORS error in the browser.**
The frontend's origin is not in `CLIENT_URL`. Add it (comma-separated) and restart the API.

**`413 Request too large` when saving a post.**
Images are capped at 2 MB. Resize the image and try again.

**A scheduled post never publishes.**
Make sure a platform account is connected for that post's platform (otherwise it will be marked
`failed`), and that the backend is running — the scheduler only runs inside the API process.

---

## Known limitations

- **Platform publishing and OAuth are simulated.** Engagement numbers are generated.
- **Access tokens are stored in plaintext.** Harmless while connections are mocked, but must be
  encrypted before real OAuth is added.
- **Images are stored as base64 inside the post document**, capped at 2 MB. Object storage would be
  the better home for them.
- **JWTs live in `localStorage`**, which is readable by any script on the page.
- **`GET /posts` is not paginated.**
- **Frontend test coverage is minimal** — only utility functions are tested.

---

## Roadmap

Rough priority order:

1. **Real OAuth + platform adapters** — one adapter per platform exposing `publish()` and
   `fetchMetrics()`, with the current mock kept as a dev/test adapter.
2. **Encrypt tokens at rest** and move JWTs to httpOnly cookies with refresh tokens.
3. **Object storage for images** (S3 / Cloudinary) — also required by platform APIs, which expect a
   public image URL.
4. **Engagement sync job** to pull real metrics for published posts.
5. **Multi-platform posts** — one editor submit creates a post per selected platform.
6. **Retry failed posts** with backoff.
7. **Pagination** on `GET /posts`.
8. **Teams / workspaces** with an approval flow.
9. **Frontend component and e2e tests.**
