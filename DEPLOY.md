# Deploying Lakshya Referrals

The app uses **SQLite** (a single file database). That means it needs a host with a
**persistent disk** — Vercel's serverless functions won't work as-is because their
filesystem is wiped between requests.

> **Deploy in this order of ease:** Railway → Render → Vercel + Neon (Postgres).

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATA_DIR` | Deploy only | Path to the persistent volume (e.g. `/data`). Defaults to `data/` locally. |
| `SESSION_SECRET` | ⚠️ Strongly | Random string. Sign-in sessions are signed with it. Set one! |
| `ADMIN_EMAIL` | Optional | Defaults to `admin@lakshya.in` |
| `ADMIN_PASSWORD` | ⚠️ | Defaults to `admin123` — **change this before going live** |
| `RESEND_API_KEY` | For real email | Without it, emails print to the server log (dev mode) |
| `EMAIL_FROM` | Optional | Resend sender, e.g. `Lakshya Referrals <you@yourdomain.com>` |
| `NEXT_PUBLIC_SITE_URL` | Optional | Used in referral links, e.g. `https://lakshyareferrals.in` |

## Option A — Railway (easiest, ~$5 free trial credit)

1. Push this folder to a GitHub repo (e.g. `Ash456rt/lakshya-referrals`).
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**.
3. Railway auto-detects `railway.json` (Docker build) — just deploy.
4. **Add a volume:** Project → your service → **Settings → Volumes → Add Volume**,
   mount path `/data`, size 1 GB.
5. Set env vars: `DATA_DIR=/data`, `SESSION_SECRET`, `ADMIN_PASSWORD` (see table above).
6. Open the generated `*.up.railway.app` URL. Done.

## Option B — Render (persistent disk, ~$7/mo on Starter)

1. Push the repo to GitHub.
2. [render.com](https://render.com) → **New → Blueprint** → select the repo.
3. `render.yaml` is auto-detected. It creates the service + a 1 GB disk at `/data`.
4. Set `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL` etc. in the service's Env Vars.
5. Render generates `ADMIN_PASSWORD` — find it in the service's Environment tab.

## Option C — Vercel + Neon (Postgres) — free, but needs a schema swap

Vercel is free but can't persist SQLite. Options:

- **Use a Neon Postgres DB** (free tier) and switch the data layer. The schema is
  plain SQL — port `better-sqlite3` calls to a Postgres driver (`postgres` or Prisma).
  Do this only if you want Vercel specifically.
- **Cheat with a disk-backed serverless store** like Turso (SQLite-compatible, edge
  HTTP). Turso's `libsql` client is nearly a drop-in for better-sqlite3 — swap the
  driver and keep SQLite. This is the least work if you must be on Vercel.

## Local dev

```bash
npm install
npm run dev        # http://localhost:3000
```

The DB file lives in `.data/app.db` (dev) or `data/app.db` (production).
Delete either folder to reset the seed (admin + demo data are recreated).

## Seeded accounts (dev / first boot)

| Account | Email | Password |
|---|---|---|
| Superadmin | `admin@lakshya.in` | `admin123` (or `ADMIN_PASSWORD`) |
| Demo referrer | `demo@example.com` | `demo123` |
| Demo client | `client@example.com` | `client123` |

> ⚠️ `admin123` is public knowledge from this README — set `ADMIN_PASSWORD` in
> production before anyone else finds your admin panel.
