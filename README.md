# Tryaksh SOP

Workflow management for the **Tryaksh PCB Design SOP v2.0** — the 10-stage process from parts selection through layout release, with CEO-gated approvals, lock-gates at Stages 6 & 8, and a tamper-evident audit trail.

> Companion docs: `TRYAKSH-SOP-PCB-001 v2.0` (PCB Design SOP) and `TRYAKSH-STD-ENG-001 v1.0` (Engineering Standards) — both rendered in-app at `/handbook` and `/handbook/standards`.

## What it does

| Mode | Who | Purpose |
|---|---|---|
| **Handbook** | Anyone signed-in | Read-only SOP reference. The 10-stage workflow diagram, every stage's description, every checklist item — verbatim from the source documents. |
| **Project Workflow** | Designer + CEO | Active checklists per stage run, external link attachments, working notes, "Request approval" → CEO approves with typed-name confirmation → next stage auto-starts. |
| **Audit & Admin** | CEO / Viewer | Per-project and global audit logs, CSV export, user role management. |

### Workflow rules baked in

- **Linear progression** through stages 1 → 2 → … → 9b. Stages cannot be reordered.
- **Approval-gated** stages (1, 2, 5, 6, 7, 8, 9a, 9b) require designer to submit and CEO to approve. Stages 3 and 4 do not require formal approval.
- **Lock gates** at Stage 6 (Schematic Lock) and Stage 8 (Decision Gate). Visual badge + audit trail.
- **Stage 5 looping** — Schematic Review iterations are handled by send-back; designer commits revisions, resubmits.
- **Stage 8 decision** — CEO chooses `Proceed to layout` (advances to 9a) or `Re-open schematic` (creates a new Stage 6 run with bumped `runNumber`, project returns to Stage 6 with the original lock approval preserved in audit).
- **No self-approval** — a CEO cannot approve a stage they are also the designer on.
- **Checklist completion enforced** — every item must be checked-with-initials or marked-N/A-with-reason before "Request approval" is available.
- **Edits locked** while a run is `awaiting_approval` or `approved`.
- **Append-only audit log** for every state-changing action.

## Tech stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **UI**: shadcn/ui primitives (new-york theme, dark mode)
- **Database**: PostgreSQL on Supabase
- **ORM**: Drizzle ORM + drizzle-kit migrations
- **Auth**: Supabase Auth (magic link, email allowlist enforced via server action)
- **Package manager**: pnpm

## Prerequisites

- Node.js 20+
- pnpm 11+
- A Supabase project (free tier is fine for v1)

## Setup

### 1. Install

```bash
git clone <repo-url>
cd tryaksh-sop
pnpm install
```

### 2. Create your Supabase project

1. Create a project in the Supabase dashboard. Save the database password — you'll need it for `DATABASE_URL`.
2. Under **Authentication → Providers → Email**:
   - Enable Email
   - Enable "Confirm email"
   - **Disable** "Email signups" — we use an allowlist
3. Under **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (and your prod URL once deployed)
   - Redirect URLs allowlist: add `http://localhost:3000/auth/callback` (and prod equivalent)
4. Under **Project Settings → Database → Connection string**, copy the **Transaction pooler** URI (port 6543, host `aws-*-<region>.pooler.supabase.com`). The **direct connection** (port 5432) only works on IPv6 on free tier and is unreliable from many networks.

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```bash
# Supabase URL + anon key — from Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Transaction pooler URI. URL-encode special chars in the password
# (e.g. @ becomes %40, : becomes %3A).
DATABASE_URL=postgresql://postgres.xxxxxxxx:URLENCODED_PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres

# Base URL of this app — used for the magic-link redirect target.
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Comma-separated allowlist. Only these emails can request magic links.
# New allowlisted sign-ins are auto-provisioned as Viewer; promote them
# in the in-app Settings page.
EMAIL_ALLOWLIST=ceo@example.com,designer@example.com
```

### 4. Push schema + seed

```bash
pnpm db:push     # applies all 11 tables + 8 enums + indexes + FKs
pnpm db:seed     # creates the PCB workflow, 10 stages, 79 checklist items, 2 seed users
```

The seed expects `ceo@tryakshipl.com` (CEO) and `pde@tryakshipl.com` (designer). Edit `drizzle/seed/users.ts` if you want different defaults.

### 5. Run

```bash
pnpm dev
```

Sign in with an email from `EMAIL_ALLOWLIST`, click the magic link, and you'll land on the dashboard.

## Database commands

| Command | What it does |
|---|---|
| `pnpm db:generate` | Generate a new SQL migration file from schema changes |
| `pnpm db:migrate` | Apply pending migration files in order |
| `pnpm db:push` | Push schema directly (skips migration files — dev only) |
| `pnpm db:studio` | Open Drizzle Studio (visual DB browser) |
| `pnpm db:seed` | Run the seed scripts |

## Project structure

```
src/
├── app/
│   ├── (app)/            # routes wrapped by the app shell (require auth)
│   │   ├── page.tsx              # dashboard
│   │   ├── projects/             # project list + create + detail + stage workspace + audit
│   │   ├── handbook/             # SOP + standards
│   │   ├── audit/                # global audit log
│   │   └── settings/             # profile + CEO admin (roles, allowlist)
│   ├── login/            # magic-link login (no shell)
│   ├── auth/callback/    # Supabase auth callback
│   ├── api/audit/        # CSV export route handlers
│   └── proxy.ts          # Next.js 16 proxy (auth middleware)
│
├── server/
│   ├── actions/          # mutations (server actions): auth, projects, workflow, notifications, users
│   ├── queries/          # read-only data fetching
│   └── auth.ts           # session + role helpers
│
├── db/
│   ├── schema/           # Drizzle table definitions
│   ├── enums.ts          # Postgres enums
│   └── index.ts          # lazy DB client
│
├── lib/
│   ├── audit.ts          # audit-log writer
│   ├── notify.ts         # notification writer
│   ├── allowlist.ts      # email allowlist check
│   ├── validators/       # Zod schemas
│   ├── csv.ts, dates.ts, logger.ts, constants.ts
│   └── supabase/         # Supabase auth clients
│
└── components/
    ├── ui/               # shadcn primitives (button, card, input, select, etc.)
    ├── layout/           # app shell, sidebar, topbar, user menu, notification bell
    ├── projects/         # create form, stage stepper, status menu
    ├── stages/           # checklist form, approval panel, external links, notes
    ├── audit/            # audit table
    ├── settings/         # user role row
    └── shared/           # markdown renderer, mobile gate

drizzle/
├── migrations/           # generated SQL
└── seed/                 # PCB workflow, stages, checklist items, users
```

## Roles

| Role | Can |
|---|---|
| **CEO** | Create projects, assign designers, approve/send-back stages, decide Stage 8 (proceed/reopen), change user roles, view global audit, set project status (hold/complete/archive) |
| **Designer** | Fill checklists on their projects, request approvals, add external links, edit notes |
| **Viewer** | Read-only: projects, handbook, global audit |

The Final Approver is implemented as a CEO role. A CEO cannot approve their own work (the assigned designer of the project).

## Lock gates and Stage 8

| Stage | Lock | Notes |
|---|---|---|
| 6 — Schematic Lock | yes | Approving locks the schematic. Edits to a locked run are blocked. |
| 8 — Decision Gate | yes | CEO chooses `Proceed to layout` (advances to 9a) or `Re-open schematic` (creates a fresh Stage 6 run with `runNumber+1`; project returns to Stage 6; original Stage 6 approval preserved in audit). |

## Notifications

In-app only. Written when:
- Designer submits a stage for approval → all CEOs notified
- CEO approves / sends back / reopens → designer notified

Notifications appear in the bell-icon dropdown (top-right). Unread badge counts. Click an item to jump to the relevant stage run + mark read.

## Audit log

Every state-changing action is appended to `audit_log` with actor email, role, action type, entity, before/after JSON, IP address, and user agent. Per-project view at `/projects/[id]/audit`; global view at `/audit` (CEO/Viewer only). CSV export available on both.

## Deployment

See [DEPLOY.md](./DEPLOY.md) for Vercel deployment.

## Security notes

- **Email allowlist** is enforced in the server action that requests magic links. A new allowlisted user is auto-provisioned as Viewer; promote in Settings.
- **DB password** is in your `.env.local` — never commit it. URL-encode special characters.
- **Audit log** is append-only by convention. Drizzle has no `delete` on `auditLog` in the codebase; revoke direct DB access in production to keep it tamper-evident.
- **Self-approval guard** rejects approve actions where the signed-in CEO equals the project's designer.

## License

Proprietary — Tryaksh Innovations Pvt. Ltd.
