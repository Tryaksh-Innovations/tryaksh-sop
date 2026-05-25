# Deployment guide — Vercel

Deploys to Vercel. Tested with the same Supabase project used for local development.

## Prerequisites

- A Vercel account with access to your GitHub/GitLab/Bitbucket repo
- The Supabase project you set up per the README
- `EMAIL_ALLOWLIST` finalized for production (typically more emails than dev)

## 1. Push the repo

Push the working tree to GitHub. Make sure `.env.local` is **not** committed — `.gitignore` already excludes it.

```bash
git init                       # if not already a repo
git add .
git commit -m "Initial Tryaksh SOP"
git remote add origin git@github.com:<your-org>/tryaksh-sop.git
git push -u origin main
```

## 2. Create the Vercel project

1. Vercel Dashboard → **New Project** → Import the repository
2. Framework preset: **Next.js** (auto-detected)
3. Build command: leave default (`pnpm build`)
4. Install command: `pnpm install` (Vercel auto-detects `pnpm-lock.yaml`)
5. Root directory: leave at repo root

> The `pnpm-workspace.yaml` in the repo declares `allowBuilds` for `esbuild`, `sharp`, `unrs-resolver`. Vercel honors that — no manual approval step needed.

## 2.5. Connect Hostinger Subdomain

Since your primary website uses Hostinger Shared PHP hosting (which cannot run Node.js servers), the Next.js server runs on Vercel while your Hostinger subdomain (e.g., `sop.yourcompany.com`) routes traffic to it:

1. **Create CNAME in Hostinger hPanel**:
   - Go to **Domains** → select your domain.
   - Go to **DNS / Nameservers** → **DNS Zone Editor**.
   - Add a new record:
     - **Type**: `CNAME`
     - **Name (Host)**: `sop` (or your custom subdomain name)
     - **Points to**: `cname.vercel-dns.com`
     - **TTL**: `default` (or `3600` / `14400`)
   - Click **Add Record**.

2. **Add Domain in Vercel**:
   - Go to Vercel Project → **Settings** → **Domains**.
   - Input `sop.yourcompany.com` and click **Add**.
   - Select the option to map it to the production deployment branch (usually `main`).
   - Vercel will automatically verify the CNAME record and issue a free SSL certificate.

## 3. Environment variables

In Vercel Project Settings → **Environment Variables**, add all four for the `Production`, `Preview`, and `Development` environments:

| Key | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxx.supabase.co` | Same as local |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` (full JWT) | Same as local |
| `DATABASE_URL` | `postgresql://postgres.xxxxxxxx:URLENCODED@aws-1-<region>.pooler.supabase.com:6543/postgres` | **Pooler URI**, password URL-encoded (e.g. `@` → `%40`, `:` → `%3A`) |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Used to build the magic-link redirect target |
| `EMAIL_ALLOWLIST` | `ceo@tryakshipl.com,pde@tryakshipl.com,...` | Comma-separated. Lowercase preferred. |

> **Why the pooler and not the direct connection**: Supabase free-tier direct connection (`db.<ref>.supabase.co:5432`) only resolves over IPv6. Vercel's serverless functions don't have IPv6 outbound on all regions. The transaction pooler (port 6543, host `aws-*-<region>.pooler.supabase.com`) is IPv4 and works everywhere. **Always use the pooler in production.**

## 4. Update Supabase Auth URLs

In Supabase Dashboard → **Authentication → URL Configuration**:

- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs (allowlist)** — add **both**:
  - `http://localhost:3000/auth/callback` (for local dev)
  - `https://your-app.vercel.app/auth/callback` (production)
  - For Vercel preview deployments, add a wildcard if you want previews to work: `https://your-app-*.vercel.app/auth/callback`

If you skip this, the magic link email will redirect, but Supabase will reject the callback as an untrusted URL.

## 5. First deploy

Vercel will deploy automatically on the next push. The first build runs:
- `pnpm install` (installs deps, applies `allowBuilds`)
- `pnpm build` (Next.js build, type-check, static generation)

Build should complete in ~60s. If it fails, the most common reasons are:
- Missing env var (build is mostly fine without them since the DB client is lazy, but `NEXT_PUBLIC_*` vars are inlined and missing values produce runtime errors)
- `pnpm-workspace.yaml` stripped from the commit (it's required for `allowBuilds`)

## 6. Run migrations against production DB

The schema is already in your Supabase DB if you ran `pnpm db:push` locally with the same `DATABASE_URL`. If you used a different Supabase project for prod, run from your laptop:

```bash
# Temporarily point .env.local at your production DATABASE_URL,
# then:
pnpm db:push
pnpm db:seed   # ONLY if production has no data yet
```

Re-revert `.env.local` afterward.

## 7. First production sign-in

1. Visit `https://your-app.vercel.app`
2. You'll be redirected to `/login`
3. Enter an email from `EMAIL_ALLOWLIST`
4. Check the inbox, click the magic link
5. The callback handler exchanges the code, creates a session, and lands you on the dashboard
6. If your email isn't already in `public.users`, you're auto-provisioned as Viewer — a CEO must promote you in Settings before you can do anything beyond reading

## 8. Add the CEO

If the seed CEO email is not yours, either:
- Edit `drizzle/seed/users.ts` before seeding, OR
- After first sign-in (auto-provisioned as Viewer), have an existing CEO promote you from Settings, OR
- Use Drizzle Studio (`pnpm db:studio`) to manually flip your `users.role` to `ceo`

## 9. Ongoing

- **New deploys**: every `git push` to `main` triggers a Vercel build
- **Schema changes**: run `pnpm db:generate` locally, commit the migration, push, then on first deploy run `pnpm db:migrate` against the prod DB (set `DATABASE_URL` locally to the prod pooler URL temporarily)
- **Adding team members**: add their email to `EMAIL_ALLOWLIST` in Vercel env vars, redeploy (or trigger a redeploy), then have them sign in. Promote them from Settings.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Magic link arrives but clicking it errors | Production `/auth/callback` URL not added to Supabase Auth redirect allowlist |
| Login form shows "This email is not authorized" | Email not in `EMAIL_ALLOWLIST`. Add and redeploy. |
| Project list / handbook is empty in prod | `db:seed` not run against the prod DB |
| Build fails with `ERR_PNPM_IGNORED_BUILDS` | `pnpm-workspace.yaml` missing from commit |
| Build succeeds, runtime: `DATABASE_URL is not set` | Env var not added to the Production environment specifically (Vercel separates Production/Preview/Development) |
| `relation "audit_action" does not exist` on first push | Schema barrel missing the `export * from "../enums"` line. Should already be in place. |

## Rotating secrets

If `DATABASE_URL` or the Supabase anon key are leaked:

1. Supabase Dashboard → Settings → Database → Reset database password
2. Supabase Dashboard → Settings → API → Reveal new keys (or rotate via the API)
3. Update both in Vercel env vars
4. Trigger a redeploy
5. Update `.env.local` for the next local dev run

Magic-link tokens are short-lived (10 min default); no rotation needed there.
