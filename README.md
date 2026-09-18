# SocialSync

An AI-assisted social media management app. Draft captions and hashtags with Google Gemini,
schedule posts across Instagram, Facebook, X and LinkedIn, and track engagement on a dashboard.

> **Publishing and account connections are simulated.** No OAuth handshake happens and nothing is
> sent to the real platforms. A cron job marks scheduled posts as published inside SocialSync and
> attaches generated engagement numbers, so the scheduling and analytics flows can be exercised
> end to end. Wiring up the real platform APIs is the main piece of outstanding work.

## Stack

| Part | Technology |
|---|---|
| Backend | Node, Express 4 (CommonJS), MongoDB via Mongoose 8, JWT auth, `node-cron`, Gemini through the OpenAI-compatible SDK |
| Frontend | React 19, Vite, React Router 7, Bootstrap 5, Recharts, react-hook-form, axios |

The two packages are independent — there is no root `package.json`, so install and run each one
separately.

## Prerequisites

- Node.js 20 or newer
- A MongoDB database (a free MongoDB Atlas cluster works)
- A Google AI Studio API key — optional; without one the app falls back to template captions

## Setup

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env     # then fill in MONGODB_URI and JWT_SECRET

# 2. Frontend
cd ../frontend
npm install
cp .env.example .env     # the default API URL is fine for local work
```

`backend/.env.example` documents every variable. The two that must be set are `MONGODB_URI` and
`JWT_SECRET`; generate the secret with something like `openssl rand -base64 48`.

If your network cannot resolve a MongoDB Atlas SRV record, set `FORCE_PUBLIC_DNS=true` in
`backend/.env` to route lookups through Google's resolvers. This is a local-only workaround — never
enable it in a hosted environment, where it breaks internal DNS.

## Running

Two terminals:

```bash
cd backend  && npm run dev    # http://localhost:5000  (nodemon)
cd frontend && npm run dev    # http://localhost:5173
```

Register an account, connect at least one platform on the Accounts page, then create a post from
the editor. A post scheduled a couple of minutes out will be picked up by the scheduler, which
checks for due posts every minute.

## Scripts

| Directory | Command | What it does |
|---|---|---|
| `backend` | `npm run dev` | Start the API with nodemon |
| `backend` | `npm start` | Start the API with node |
| `backend` | `npm run lint` | Lint `src/` |
| `frontend` | `npm run dev` | Vite dev server |
| `frontend` | `npm run build` | Production build into `dist/` |
| `frontend` | `npm run preview` | Serve the built output |
| `frontend` | `npm run lint` | Lint the app |

## API

All routes are prefixed with `/api`. Everything except `register`, `login` and the health checks
requires an `Authorization: Bearer <jwt>` header.

| Method | Path | Notes |
|---|---|---|
| `GET` | `/health` | Uptime and environment |
| `POST` | `/auth/register` | Rate limited: 10 attempts / 15 min per IP |
| `POST` | `/auth/login` | Same limiter; successful logins are not counted |
| `GET` | `/auth/me` | Current user |
| `GET` | `/posts` | The user's posts. Omits `image` — use the detail route for that |
| `POST` | `/posts` | Create a `draft` or `scheduled` post |
| `GET` | `/posts/stats` | Counts by status |
| `GET` | `/posts/:id` | One post, including its image |
| `PUT` | `/posts/:id` | Edits. `engagement` is not client-writable, and `status` may only move between `draft`, `scheduled` and back |
| `DELETE` | `/posts/:id` | Remove a post |
| `GET` | `/accounts` | Connected accounts, tokens stripped |
| `POST` | `/accounts/connect` | Simulated connect |
| `DELETE` | `/accounts/:platform` | Disconnect |
| `POST` | `/content/generate` | AI captions. Rate limited: 20 / hour per user |
| `GET` | `/analytics?range=7\|14\|30` | Engagement aggregated from the user's published posts |

## How scheduling works

`jobs/scheduler.js` runs `publisherService.publishDuePosts()` every minute. Each due post is
claimed with an atomic `scheduled → publishing` update, so overlapping runs or a second server
instance cannot publish the same post twice. A post left in `publishing` by a crashed process is
released back to `scheduled` after ten minutes, and that sweep also runs at startup.

## Known limitations

- Platform publishing and OAuth are simulated; engagement numbers for published posts are generated.
- Access tokens are stored in plaintext. Harmless while connections are mocked, but it must be
  addressed before real OAuth.
- Images are stored as base64 inside the post document, capped at 2MB. Object storage would be the
  better home for them.
- JWTs are kept in `localStorage`, which is readable by any script running on the page.
- `GET /posts` is not paginated.
- There is no automated test suite yet.
