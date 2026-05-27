# The Tryaksh SOP — Build Journey

A complete record of how this app came to be: phases, decisions, mistakes,
fixes, and lessons. Written so a future engineer (or future-you) can pick
this up months from now and understand not just *what* the code is, but
*why* each piece looks the way it does.

> **Live at**: https://sop.tryakshipl.com
> **Source**: https://github.com/Tryaksh-Innovations/tryaksh-sop
> **Final state**: 17 routes · 11 DB tables · 8 enums · 79 seeded checklist items · ~7,000 lines of TypeScript

---

## Table of contents

1. [The premise](#1-the-premise)
2. [Architectural commitments](#2-architectural-commitments)
3. [Phase 1 — Foundation](#3-phase-1--foundation)
4. [Phase 2 — Handbook](#4-phase-2--handbook)
5. [Phase 3 — Projects core](#5-phase-3--projects-core)
6. [Phase 4 — Workflow & approvals](#6-phase-4--workflow--approvals)
7. [Phase 5 — Polish layer](#7-phase-5--polish-layer)
8. [Phase 6 — Documentation](#8-phase-6--documentation)
9. [UI rebuild — Controlled Document](#9-ui-rebuild--controlled-document)
10. [Dark mode](#10-dark-mode)
11. [Branded loading states](#11-branded-loading-states)
12. [Deployment — Vercel + Hostinger](#12-deployment--vercel--hostinger)
13. [The auth saga](#13-the-auth-saga)
14. [Final features](#14-final-features)
15. [Problems & fixes — quick reference](#15-problems--fixes--quick-reference)
16. [Architecture decisions in plain language](#16-architecture-decisions-in-plain-language)
17. [What we'd do differently next time](#17-what-wed-do-differently-next-time)
18. [Runbook reference](#18-runbook-reference)

---

## 1. The premise

Tryaksh Innovations Pvt. Ltd. designs precision measurement instruments
for Indian Railway infrastructure (RDSO, IR, metro corporations). The CEO
had written a controlled engineering document — `TRYAKSH-SOP-PCB-001 v2.0`
— that codifies a 10-stage PCB design workflow with two lock gates and
one decision gate.

The brief was to turn that document into a working internal tool: an app
that *enforces* the SOP rather than just describing it. Three modes were
required:

- **Handbook** — read-only reference, accurate to the source document
- **Project workflow** — checklists, approvals, lock-gate enforcement
- **Records** — append-only audit trail, exportable

The audience: an internal team of ~3–10 engineers, the CEO acting as
final approver, accessed via magic-link (later switched to password)
behind an email allowlist.

---

## 2. Architectural commitments

Locked in early and never deviated:

| Decision | Why |
|---|---|
| **Workflow-as-data** | The 10 stages, checklists, and lock-gate flags live in DB rows seeded at startup. The code never hardcodes "PCB" or stage names. A future mechanical SOP is just a new seed row. |
| **Approval-gated progression** | Stages advance only when the CEO signs. Server-side checks reject self-approval and out-of-order transitions. |
| **Append-only audit** | Every state-changing action writes an `audit_log` row with actor email, role, IP, UA, and before/after JSON. UI never exposes a delete. |
| **Role-based, enforced server-side** | `requireRole("ceo")` on every CEO-only action. Not just UI hiding. |
| **Next.js 16 App Router + TypeScript strict** | Server actions for mutations, server components for queries, no `any`, no `@ts-ignore`. |
| **Drizzle ORM + Supabase Postgres** | Schema-as-TypeScript, migrations checked in, RLS available if we ever expose the DB to the client. |
| **Tailwind v4 + shadcn/ui primitives** | v4 unlocks oklch colors, design tokens, and CSS variables — needed for the eventual two-theme aesthetic. |
| **pnpm** | Lockfile speed, workspace support for future packages. |

---

## 3. Phase 1 — Foundation

Built the skeleton. The seed runner came together first because the
workflow content was the most important asset.

**Shipped:**

- Next.js 14+ App Router with TS strict mode
- 11 Drizzle schema tables: `users`, `workflows`, `workflow_stages`,
  `checklist_items`, `projects`, `project_stage_runs`,
  `checklist_responses`, `approvals`, `audit_log`, `external_links`,
  `notifications`
- 8 Postgres enums shared across tables
- Drizzle config + auto-generated migrations
- Supabase Auth setup (magic-link) with email-allowlist enforcement
- Folder structure: `src/{app,server,db,lib,components}`
- Placeholder routes for every page in the eventual app
- Audit log writer (`src/lib/audit.ts`)
- Structured logger (`src/lib/logger.ts`)

**Bumps:**

- **Disk space exhausted** mid-install. Cleared cache, resumed. Lesson:
  always check `Get-PSDrive C` before starting a Next install on
  Windows.
- **pnpm 11 deprecation**: the `pnpm.onlyBuiltDependencies` field in
  `package.json` moved to `pnpm-workspace.yaml` as `allowBuilds`. Build
  scripts (esbuild, sharp, unrs-resolver) were silently skipped until
  this was migrated.
- **Schema barrel missing enum exports**: `drizzle-kit generate`
  produced a migration with no `CREATE TYPE` statements, leading to
  `relation "audit_action" does not exist` on the first push. Fixed by
  `export * from "../enums"` in `src/db/schema/index.ts`.

---

## 4. Phase 2 — Handbook

The handbook had to be **verbatim** to the source SOP. No paraphrasing.
The CEO would notice if a single criterion was reworded.

**Process:**

1. Extracted text from the `.docx` files using a Python script
   (`python -c "import xml.etree.ElementTree..."`)
2. Hand-translated to structured seed files:
   - `drizzle/seed/workflows.ts` — one PCB workflow row
   - `drizzle/seed/stages.ts` — 10 stages with full markdown
   - `drizzle/seed/checklist-items.ts` — 79 items grouped by SOP sub-section (8.1.1, 8.1.2, 8.1.3, etc.)
3. Built handbook routes:
   - `/handbook` — landing with embedded workflow SVG + 10-stage TOC
   - `/handbook/stages/[stageNumber]` — markdown rendering + grouped checklist
   - `/handbook/standards` — Engineering Standards v1.0 full text

**Decisions:**

- Used `react-markdown` + `remark-gfm` for the SOP body (tables, em-dash
  bullets work out of the box).
- **Lock-gate badges** chosen as small red `LOCK` chips — visible across
  the stepper, list, and stage workspace.

---

## 5. Phase 3 — Projects core

The first introduction of "do something" surfaces.

**Shipped:**

- `/projects` — register table with project codes, designers, stages, status
- `/projects/new` — CEO-only form with code/name/class/designer
- `/projects/[id]` — header, stage stepper, current-stage card
- Dashboard with real-time stats from DB
- `createProject` server action — auto-creates Stage 1 run, sets
  `currentStageId`, audit-logs the creation
- Email allowlist enforced at the login server action (later moved to
  the route handler)
- Auto-provisioning for allowlisted sign-ins as `viewer` role

**Decisions:**

- **Match users by email, not by `auth.users.id`**. Supabase's auth IDs
  are random UUIDs, our seeded users had their own. Email is the stable
  shared identifier; FKs use our internal `public.users.id`.
- **Project codes as the user-facing identifier**, not the UUID. Codes
  match the SOP's filename convention (`TRYAKSH-MECH-DRTG-014-V2.0`).

---

## 6. Phase 4 — Workflow & approvals

The biggest phase by far. The "real" app.

**Server actions** (in `src/server/actions/workflow.ts`):

- `upsertChecklistResponse` — designer-only, auto-promotes run to
  in_progress, requires initials on check, requires reason on N/A
- `addExternalLink` / `removeExternalLink` — drive/git/datasheet links
  with per-row remove permissions
- `updateStageNotes` — stage-scoped working notes
- `requestApproval` — designer submits; validates every item is resolved;
  notifies all CEOs
- `approveStage` — CEO action with typed-name signature; refuses
  self-approval; advances to next stage; marks project completed at end
- `sendBack` — CEO returns to designer with required note
- `decideStage8` — separate action for the decision gate:
  - `proceed` → advances to 9a
  - `reopen` → creates new Stage 6 run with `runNumber+1`,
    points `currentStageId` back to 6, audit-logs `schematic_reopened`

**UI components:**

- Interactive checklist with per-item state machine (unchecked / checked-with-initials / N/A-with-reason)
- Approval panel — radio for approve/send-back, separate variant for Stage 8
- External links panel with kind icons (Drive, Git, Datasheet, Image, Other)
- Stage notes editor
- Stage workspace page tying it all together
- Project audit log page

**Lock-gate behavior:**

- Stage 6 lock: editing blocked once `awaiting_approval` or `approved`;
  reopen path only via Stage 8 decision
- Stage 8 routing: `approveStage` rejects Stage 8 directly, forces use
  of `decideStage8`
- `runNumber` tracking: every stage has potentially multiple runs;
  audit preserves all of them; the stepper shows `r2` when applicable

---

## 7. Phase 5 — Polish layer

**Notifications:**

- DB-backed bell-icon dropdown in topbar
- Unread badge + mark-as-read on click + mark-all-read
- Notification kinds: `approval_needed`, `approval_granted`,
  `approval_denied`, `stage_completed`, `project_assigned`
- Written by every relevant server action

**Global audit log:**

- `/audit` — CEO and viewer roles only
- Same `AuditTable` component reused on project audit pages
- CSV export route handlers at `/api/audit/global/export` and
  `/api/audit/project/[id]/export`

**Settings page:**

- User profile card (name, email, role badge)
- CEO-only: inline role dropdown per user with auto-save and
  "last CEO can't be demoted" safety check
- CEO-only: email allowlist viewer (env-var driven, read-only in UI)

**Sign-out + user menu** in the topbar with role-tinted badge.

**Mobile gate** — small amber warning banner on `<md` viewports
("Best on desktop"). Sidebar collapses on mobile.

---

## 8. Phase 6 — Documentation

- **`README.md`** rewritten with full setup steps: Supabase project
  creation, env vars, `db:push`, `db:seed`, role table, lock-gate notes,
  audit description
- **`DEPLOY.md`** new — Vercel deploy steps, Hostinger CNAME setup,
  Supabase auth URL allowlist, secret rotation, troubleshooting matrix
- **Project status menu** added: CEO can put a project on hold, mark
  completed, or archive — with state-machine validation

---

## 9. UI rebuild — Controlled Document

After v1 functionality was complete, the user said the UI felt
"generic AI". The frontend-design skill was invoked. Locked in a
distinctive aesthetic direction: the app as the digital manifestation
of the actual controlled document.

**Type system:**

- **Display**: Fraunces (variable serif with SOFT, WONK, opsz axes)
- **Body / UI**: IBM Plex Sans
- **Mono**: IBM Plex Mono (Selectric authority — for project codes,
  timestamps, document IDs)

**Color tokens** (light mode default):

- `--paper` warm cream (`oklch(0.984 0.008 80)`)
- `--ink` near-black warm (`oklch(0.16 0.014 270)`)
- `--rule` soft hairline (`oklch(0.86 0.012 80)`)
- `--signal` instrumentation orange — the single hot accent
- `--seal` controlled emerald for approved
- `--blueprint` deep technical blue for in-progress
- `--warn` amber for awaiting
- `--alert` controlled red for lock gates / destructive

**Distinctive moves:**

- **Classification banner** in dark ink across the top of every page:
  `TRYAKSH-SOP-PCB-001 · v2.0 · STATUS: CONTROLLED · Asia/Kolkata · IST`
- **Sidebar organised as sections** with `§ 01 Workspace`, `§ 02 Reference`, `§ 03 Records`
- **Stage stepper as engineering diagram** — precision shapes (filled
  square = approved, ring = current, hollow = pending, hatched ring = lock)
- **Hairline 1px rules** everywhere, never thick borders
- **Section markers** in card corners (`§ 02.3`) — manual page numbering
- **Stats as specification-table rows** — ink-bordered grid with big
  tabular numbers
- **Tryaksh Devanagari (त्र्यक्ष) logo** integrated in sidebar, login cover,
  loading screens, and favicon

The before/after: from a generic shadcn dark theme to a recognisable
visual identity that looked at home next to the actual SOP PDF.

---

## 10. Dark mode

Same "Controlled Document" intentionality, different surface. The
metaphor: a draftsman's lamp-lit drawing table at midnight.

- `--paper` becomes deep warm graphite (`oklch(0.135 0.008 65)`)
- `--ink` becomes warm cream (the actual pigment on the dark surface)
- `--signal` shifts to brighter phosphor amber for dark-surface
  visibility
- Logo gets a `dark:invert` filter — solid black becomes solid cream
- Page atmosphere swaps from warm cream radial glow to lamp-pool warmth
  over ink

**Implementation:**

- Pre-paint script in `<head>` reads `localStorage['tryaksh-theme']`
  with `prefers-color-scheme` fallback. Sets `class="dark"` on `<html>`
  before first paint — no theme flash.
- `ThemeToggle` component in topbar with Sun/Moon icons and a
  per-mode chip.
- Smooth 0.2s color transition.

---

## 11. Branded loading states

Supabase free tier cold-starts take 15–30 seconds. Sitting on a frozen
page felt broken. Added branded loading screens via Next.js's
`loading.tsx` route convention.

**Visual:**

- The Devanagari **त्र्यक्ष** logo, surrounded by hairline corner
  crosshairs (like a surveying reticle), breathing on a 1.8s pulse cycle
- Below: a horizontal hairline rule with a 50%-wide ink bar that
  sweeps left → right on a 1.6s loop
- A signal-orange dot blinking with a contextual mono-caps label
  ("Polling document", "Loading project", "Loading stage workspace")

**Coverage:**

- `src/app/loading.tsx` — fullscreen fallback before app shell renders
- `src/app/(app)/loading.tsx` — default for all signed-in pages
- Specific overrides for `/projects/[id]`, `/projects/[id]/stages/[stageRunId]`,
  `/handbook`, `/audit`

Effect: the wait now feels *intentional*, not broken. Engineering-instrument
feel rather than spinning generic spinner.

---

## 12. Deployment — Vercel + Hostinger

**The setup:**

- Repo: `github.com/Tryaksh-Innovations/tryaksh-sop` (private)
- Hosting: Vercel (Hobby tier, auto-deploys on push to `main`)
- Database: Supabase free tier, ap-southeast-2 (Sydney)
- Domain: `sop.tryakshipl.com` via Hostinger DNS CNAME to `cname.vercel-dns.com`
- TLS: free auto-provisioned by Vercel

**Env vars in Vercel (Production):**

- `NEXT_PUBLIC_SUPABASE_URL` ← the source of weeks of pain (see § 13)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` (transaction pooler, port 6543)
- `NEXT_PUBLIC_APP_URL` = `https://sop.tryakshipl.com`
- `EMAIL_ALLOWLIST` = comma-separated list

**Supabase Auth URL allowlist:**

- Site URL: `https://sop.tryakshipl.com`
- Redirect URLs: localhost + production + `*.vercel.app` wildcard for previews

**Bumps:**

- Free-tier Supabase direct connection (`db.<ref>.supabase.co:5432`)
  serves IPv6 only and refuses to resolve from many networks. Always
  use the transaction pooler (`aws-*-<region>.pooler.supabase.com:6543`).
- The DB password contained `@`, which is a URI delimiter. Had to
  URL-encode as `%40` in `DATABASE_URL`.

---

## 13. The auth saga

This was the longest, most-iterated debug arc of the whole project. A
historical record so we never repeat it.

### Attempt 1 — Magic-link via Supabase OTP

Worked locally. On production:

- **First failure**: magic links emailed contained `http://localhost:3000/auth/callback` instead of production. Cause: `NEXT_PUBLIC_APP_URL` was missing in Vercel env vars. Fix: set it to the production domain, redeploy.
- **Second failure**: `otp_expired` on first click. Cause: corporate email scanners pre-fetching the link, consuming the OTP. Fix: ask user to click within ~60s of arrival; later mitigated by changing UX (see below).

### Attempt 2 — Server action throws "Unexpected end of JSON input"

After fixing the URL, sign-in started failing with `"Unexpected end of JSON input"`. Cause: edge middleware was calling `supabase.auth.getUser()` on **every** request, including POSTs to `/login`. With cold Supabase, that call timed out at Vercel's 10s edge limit, returning an empty body, and React's server-action transport threw on the empty response.

Fix:
- Bypass middleware Supabase entirely for public paths (`/login`, `/verify`, `/auth/callback`).
- Set `maxDuration = 30` on the root layout for server actions.
- Wrap server actions and the client `handleSubmit` in try/catch to surface friendly retry messages.

### Attempt 3 — `Unexpected token '<' "!DOCTYPE"`

The middleware fix worked, but the next error was the request returning an HTML 405 page. The cause: Vercel's edge cache had cached a 405 from earlier `node`-UA scanner traffic to `/login`. Even after the new deploys, the cache served the stale 405.

Fix:
- Force `/login` dynamic and uncached at every layer: route segment config (`dynamic = "force-dynamic"`, `revalidate = 0`, `fetchCache = "force-no-store"`), `await headers()` in the login layout, plus explicit `Cache-Control: no-store` + `Vercel-CDN-Cache-Control: no-store` headers via `next.config.ts`.

### Attempt 4 — `Server action not found`

Some users still saw errors. The new symptom was `404 Server action not found`. Cause: action IDs change between deploys (hash of the function body); old client HTML referenced action IDs that no longer existed on the new server.

Fix:
- Client-side detection of this specific error pattern with auto-recovery: show "This page is out of date" and reload with cache-busting query param.

### Attempt 5 — Switch to a Route Handler

After multiple action-ID issues, decided to drop server actions for sign-in. Server actions have intrinsic deploy-cache-mismatch risk. Replaced with a plain `POST /api/auth/magic-link` route handler. Stable URL, no action IDs, no special headers.

### Attempt 6 — Magic link still failing

New error: `Server returned 200 with a non-JSON body`. Cause: middleware redirecting unauthenticated POSTs to `/api/auth/magic-link` → `/login` (because `/api/auth` was not in `PUBLIC_PATHS`). Browser fetch followed the redirect, got back the login page HTML.

Fix:
- Added `/api/auth` to the public-paths allowlist in middleware.

### Attempt 7 — Supabase HTML response (rate limit)

Auth logs showed only 2 entries despite hours of testing. Discovery: Supabase free-tier had tightened email rate limit from 30/hr to **2/hr per project**. Every attempt counted. Hours of debugging had consumed the daily quota.

Fix:
- Raised limit in Supabase Dashboard → Auth → Rate Limits to 30/hr.

### Attempt 8 — User decides to drop magic links entirely

After hours of cascading failures, the user said: "let's just go with email + password". This was the right call. Magic links have too many moving parts for an internal tool:
- Email deliverability
- Rate limits per project
- Single-use tokens consumed by scanners
- 10-minute expiry windows
- Configurable redirect URLs

Switched to password auth via `signInWithPassword`. Users created in Supabase Dashboard with passwords set + Auto Confirm.

### Attempt 9 — Password auth still fails

After password sign-in was wired up, requests STILL came back with HTML. Vercel function logs showed `Supabase signInWithPassword failed - Unexpected token '<' "!DOCTYPE"`.

Theory: Cloudflare in front of Supabase was blocking server-side requests from Vercel's iad1 region. Browser-direct tests against the same Supabase URL worked fine.

Mitigation attempts (in order):
- Region preference: `preferredRegion = ["sin1", "syd1", "bom1", "iad1"]`
- Raw `fetch` instead of SDK with browser-shaped User-Agent
- Custom error parsing for HTML responses

### Attempt 10 — THE actual bug

The Vercel function log with proper field interpolation revealed the response body started with our own `<!DOCTYPE html>` containing class names like `fraunces_*` and `ibm_plex_sans_*`.

**The fetch from Vercel was hitting our own domain, not Supabase.**

Root cause: `NEXT_PUBLIC_SUPABASE_URL` in Vercel was set to `https://sop.tryakshipl.com` instead of `https://guwklbxdzniniurtwqsg.supabase.co`. Every Vercel-side Supabase call had been silently hitting our own app, going through middleware, being redirected to `/login`, and returning the login page HTML — for the entire saga.

Fix:
- Corrected `NEXT_PUBLIC_SUPABASE_URL` in Vercel env vars to the actual Supabase project URL.
- Redeployed with cache cleared.
- **Sign-in worked first try.**

### Lessons from the auth saga

1. **Verify env vars by their actual effect, not by reading them.** "It looks right" is not "it is right." Always do a direct test that proves the value is being used correctly.
2. **Server actions are not the right primitive for auth flows on Vercel.** Action ID hashing + deploy mismatches + edge function timeouts + middleware interactions made them brittle. Route handlers are simpler and more debuggable.
3. **Magic links are over-engineered for an internal tool of 2–10 users.** Password auth has fewer failure modes and no rate limits at the email-send layer.
4. **Log the actual response body when something looks weird.** The HTML class signatures gave away the root cause in seconds — we just hadn't logged them. The `logger.error(msg, error, data)` signature mismatch hid the diagnostic for hours.
5. **When Vercel function logs say `[object Object]`, it's because the logger argument order is wrong.** Check the logger signature.

---

## 14. Final features

After the auth saga settled, the last polish:

**Project delete (CEO only, typed-code confirmation):**

- Danger-zone block at the bottom of the project detail page
- Modal asks user to type the project code exactly
- Server action deletes in dependency order: `checklist_responses` →
  `approvals` → `external_links` → `project_stage_runs` → `audit_log`
  entries → `projects`
- One immutable `project_hard_delete` audit entry written *before*
  deletion with full project metadata in `afterJson` — so deletes
  remain traceable forever

**`/demo` — interactive platform tour:**

- 8 sections (Overview → Workflow → Designer → CEO → Lock gates →
  Records → Admin → Begin)
- Live interactive mock components (DemoStepper, DemoChecklist,
  DemoApprovalPanel, DemoAudit) — no DB queries, safe to interact with
- Sidebar link under "§ 02 Reference"

**Daily epigraph on the dashboard:**

- 36 curated quotes — engineers, scientists, designers, plus 4 lines
  pulled from Tryaksh's own Engineering Standards & PCB Design SOP
- Deterministic by date (`day % 36`) — same quote for everyone on the
  same day
- Display serif italic with decorative wonky `"` mark, mono-caps
  attribution with brief context, IST-formatted date in the header strip

---

## 15. Problems & fixes — quick reference

Symptoms-to-cures table for future troubleshooting.

| Symptom | Root cause | Fix |
|---|---|---|
| `ERR_PNPM_IGNORED_BUILDS` after pnpm install | pnpm 11 moved `onlyBuiltDependencies` from `package.json` to `pnpm-workspace.yaml` as `allowBuilds: { name: true }` | Update `pnpm-workspace.yaml` |
| `Cannot find host db.<ref>.supabase.co` | Supabase free-tier direct connection is IPv6-only | Switch `DATABASE_URL` to transaction pooler (port 6543) |
| `URI parse error` on `DATABASE_URL` | Special chars in password | URL-encode (`@` → `%40`) |
| `relation "audit_action" does not exist` on first push | Schema barrel missing enum exports | Add `export * from "../enums"` |
| Magic link sends `localhost` URL | `NEXT_PUBLIC_APP_URL` missing or set to localhost in Vercel | Set to production domain, redeploy |
| `Unexpected end of JSON input` on sign-in | Edge middleware calling Supabase on cold start, timing out | Bypass middleware Supabase for public paths, set `maxDuration = 30` |
| `Unexpected token '<' "!DOCTYPE"` (cache version) | CDN serving stale 405 to action POST | Force `/login` dynamic + `Cache-Control: no-store` everywhere |
| `Server action not found` | Action ID hash mismatch across deploys | Auto-detect on client, reload with cache-bust |
| `200 with non-JSON body` | Middleware redirecting auth API to `/login` | Add `/api/auth` to `PUBLIC_PATHS` |
| `Supabase returned non-JSON` (rate limit) | Free-tier 2-email/hour cap hit | Raise to 30/hour in Supabase Dashboard |
| `Supabase returned non-JSON` (real cause) | `NEXT_PUBLIC_SUPABASE_URL` pointing at our own domain | Fix env var to actual Supabase URL |
| `[object Object]` in logs | `logger.error(msg, data)` instead of `logger.error(msg, error, data)` | Pass `null` or the error as 2nd arg, data as 3rd |
| Build fails: `Failed to fetch IBM Plex Sans from Google Fonts` | Transient Google Fonts API failure during Turbopack font fetch | Clear `.next/`, retry |

---

## 16. Architecture decisions in plain language

**Why is the workflow data-driven?**

So a future Mechanical SOP doesn't require code changes. Add a row to
`workflows`, seed its stages and checklists, and the existing UI renders
it. The handbook landing page automatically lists the new workflow's
diagram.

**Why does `runNumber` exist on `project_stage_runs`?**

Stage 8 reopens create a *new* Stage 6 run instead of mutating the
existing one. The original lock approval stays as an immutable audit
record. Successive runs get `runNumber = max + 1`. The stepper shows
`r2`, `r3` annotations so the team sees a stage has been reattempted.

**Why is the audit log not behind a soft-delete?**

Because audit logs are tamper-evident by convention. The only way to
remove an entry is direct database access. By convention, no application
code calls `DELETE FROM audit_log`. The `project_hard_delete` operation
sweeps orphan entries but writes a permanent record of the delete first.

**Why password auth instead of OAuth or magic-link?**

Magic-link had too many failure modes for free-tier Supabase + Vercel
(see § 13). OAuth would add an external provider (Google, GitHub) and
make the email allowlist harder to enforce. Password auth is the
simplest reliable primitive for an internal team of known users. The
CEO sets passwords in the Supabase Dashboard.

**Why a raw fetch in the sign-in route handler instead of the Supabase JS SDK?**

The SDK call from Vercel was sometimes hitting Supabase's Cloudflare
layer and getting HTML challenge pages back. A raw fetch with browser-
shaped headers (User-Agent, Accept) was treated as a normal client and
worked reliably. The SDK is still used everywhere else — only auth
required the bypass.

**Why is the demo page in `(app)/` and not public?**

The tour shows production-realistic mock data and detailed feature
descriptions. Keeping it auth-gated means only allowlisted team members
see it. If a public marketing version is needed later, it'd be a
duplicate at `/about` or similar.

---

## 17. What we'd do differently next time

For a future similar project, here's the playbook:

1. **Start with route handlers for auth**, not server actions. We
   would have skipped 80% of the auth saga.
2. **Verify all env vars with a runtime check page** before declaring
   the deploy "live". A `/api/diagnostics` route that returns
   `{ supabaseUrl, hasAnonKey, hasDbUrl, supabasePingMs }` would have
   surfaced the `NEXT_PUBLIC_SUPABASE_URL` typo in 30 seconds instead
   of 6 hours.
3. **Use password auth from day one** for internal-team tools. Magic
   links are for consumer apps with deliverable email infrastructure.
4. **Raise Supabase rate limits immediately** after creating the
   project. The 2/hour default is hostile to iterative development.
5. **Set `maxDuration = 30` on the root layout from the start.** The
   10s default is too tight for any free-tier upstream service.
6. **Test middleware exhaustively for redirect interactions** with API
   routes. Public-path allowlists need to include `/api/auth/*`.
7. **Pick the controlled-document aesthetic earlier.** The first UI
   pass was generic shadcn dark and felt undifferentiated. The full
   redesign in one shot worked, but starting there would have meant
   never having to rewrite the look of every component.

---

## 18. Runbook reference

### Make a code change

```bash
# Edit files locally
pnpm dev                           # test at http://localhost:3000
git add -A
git commit -m "What changed and why"
git push                           # Vercel auto-deploys in ~60s
```

### Schema change

```bash
# Edit src/db/schema/*.ts
pnpm db:generate                   # produces a new migration file
pnpm db:push                       # applies to your DB (currently same as prod)
git add -A
git commit -m "Schema: <change>"
git push
```

### Add a teammate

1. Vercel → Environment Variables → edit `EMAIL_ALLOWLIST` → append the new email
2. Vercel → Deployments → latest → Redeploy
3. Supabase Dashboard → Auth → Users → Add user → Create new user → set email, password, ✓ Auto Confirm
4. New teammate signs in
5. Existing CEO promotes them in `/settings` if they need designer/CEO role

### Reset a forgotten password

Supabase Dashboard → Auth → Users → click the user → Reset password → set new password → ✓ Save. Tell the teammate what you set.

### Roll back a bad deploy

1. Vercel → Deployments → find the last green Production deploy before the bad one
2. Click ⋯ → Promote to Production
3. Live within 5 seconds
4. Fix locally and push the corrected code; that becomes the new Production

### Export the audit log

- Per project: `/projects/[id]/audit` → Export CSV
- Globally: `/audit` → Export CSV (CEO + viewer only)

### Rotate the DB password

1. Supabase Dashboard → Settings → Database → Reset database password
2. Note the new password
3. URL-encode any special characters (`@` → `%40`, etc.)
4. Vercel → Settings → Environment Variables → edit `DATABASE_URL` → save
5. Redeploy

### Delete a test project

Project detail page → scroll to "Administration" → Delete project → type the project code exactly → Delete forever. CEO only.

### Add a new quote to the daily epigraph

Edit `src/lib/quotes.ts`, push, deploy. The rotation cycle adjusts automatically (the array length is used as the modulo divisor).

### Wake Supabase from cold start manually

Visit any page that touches the DB (the dashboard, `/projects`, `/handbook` after first seed). The first request wakes the connection pool; subsequent requests are fast.

---

## Final stats

```
Phases shipped:               6 implementation + UI rebuild + dark mode +
                              loading + deploy + auth saga + final features
Conversation turns to v1:    ~150
Vercel deploys to ship:      ~25
Database tables:               11
Enums:                          8
Seeded checklist items:        79
Routes (pages + APIs):         14 + 3
Server actions:               ~25
UI components:                ~35
TypeScript lines:           ~7,000
Daily epigraphs in rotation:   36

Live at:           https://sop.tryakshipl.com
Source:            https://github.com/Tryaksh-Innovations/tryaksh-sop
First deploy:      2026-05-26
Final v1 commit:   2026-05-28
```

Built well. Shipped live. Ready for the DRTG main board's next revision.

— Documented in conversation between Richansh (CEO, Tryaksh Innovations) and Claude.
