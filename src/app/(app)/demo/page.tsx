import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoStepper } from "@/components/demo/demo-stepper";
import { DemoChecklist } from "@/components/demo/demo-checklist";
import { DemoApprovalPanel } from "@/components/demo/demo-approval";
import { DemoAudit } from "@/components/demo/demo-audit";
import {
  Compass,
  Workflow,
  ListChecks,
  Stamp,
  Lock,
  ScrollText,
  UserCog,
  ArrowRight,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: `Demo — ${APP_NAME}`,
  description:
    "Interactive walkthrough of the Tryaksh PCB Design SOP platform.",
};

const SECTIONS = [
  { id: "overview", num: "01", title: "What this is", icon: Compass },
  { id: "workflow", num: "02", title: "The workflow", icon: Workflow },
  { id: "designer", num: "03", title: "For designers", icon: ListChecks },
  { id: "ceo", num: "04", title: "For the CEO", icon: Stamp },
  { id: "lock-gates", num: "05", title: "Lock gates", icon: Lock },
  { id: "records", num: "06", title: "Records & audit", icon: ScrollText },
  { id: "admin", num: "07", title: "Administration", icon: UserCog },
  { id: "begin", num: "08", title: "Begin", icon: Sparkles },
];

export default function DemoPage() {
  return (
    <div className="-mx-5 md:-mx-10 -my-6 md:-my-8">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <header className="relative border-b border-rule-3 px-5 md:px-10 py-16 md:py-24">
        <CornerMark className="top-5 left-5" />
        <CornerMark className="top-5 right-5" />
        <CornerMark className="bottom-5 left-5" />
        <CornerMark className="bottom-5 right-5" />

        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="size-1.5 bg-signal rounded-full animate-pulse" />
            <span className="mono-caps text-signal-ink">
              Interactive walkthrough
            </span>
          </div>
          <h1 className="display text-[clamp(48px,8vw,96px)] leading-[0.95] text-ink">
            The platform,
            <br />
            <em
              className="italic"
              style={{
                fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1',
              }}
            >
              up close.
            </em>
          </h1>
          <p className="mt-8 max-w-xl font-display text-[20px] leading-snug text-ink-2">
            A guided tour of every feature in the Tryaksh PCB Design SOP —
            workflow stages, checklists, approvals, lock gates, the decision
            gate, audit trail, and admin tools. Click into each section, or
            scroll straight through.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#overview"
              className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-ink-2 transition-colors"
            >
              Begin tour
              <ChevronDown className="size-3.5 text-signal" />
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-rule-2 bg-paper-2 px-5 py-3 mono-caps text-ink-2 hover:bg-paper-3 hover:text-ink transition-colors"
            >
              Skip to dashboard
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Section counter strip */}
        <div className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] text-ink-3 uppercase tracking-[0.14em]">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="hover:text-ink transition-colors flex items-center gap-1.5"
            >
              <span className="text-ink-4">§ {s.num}</span>
              <span>{s.title}</span>
            </a>
          ))}
        </div>
      </header>

      <div className="px-5 md:px-10 py-12 md:py-16 space-y-24 md:space-y-32">
        {/* ── § 01 — What this is ─────────────────────────────── */}
        <section id="overview" className="scroll-mt-20">
          <SectionHeader num="01" icon={Compass} title="What this is" />
          <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-12">
            <div>
              <p className="font-display text-[18px] text-ink-2 leading-snug">
                One app, three modes.
              </p>
              <p className="mt-3 text-[13px] text-ink-3 leading-relaxed">
                The Tryaksh PCB Design SOP lives both as a controlled document
                and as the working tool that enforces it. Same source of
                truth, same authority.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <ModeCard
                num="A"
                title="Handbook"
                href="/handbook"
                description="Read-only reference. Every stage, every checklist item, every standard — verbatim."
              />
              <ModeCard
                num="B"
                title="Project workflow"
                href="/projects"
                description="Active checklists, external links, working notes, request-approval, send-back, decision gate."
              />
              <ModeCard
                num="C"
                title="Records"
                href="/audit"
                description="Append-only audit log, CSV export, team & role management."
              />
            </div>
          </div>
        </section>

        {/* ── § 02 — The workflow ─────────────────────────────── */}
        <section id="workflow" className="scroll-mt-20">
          <SectionHeader num="02" icon={Workflow} title="The workflow" />
          <div className="space-y-8">
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-12">
              <div>
                <p className="font-display text-[18px] text-ink-2 leading-snug">
                  Ten stages. Two lock gates. One decision gate.
                </p>
                <p className="mt-3 text-[13px] text-ink-3 leading-relaxed">
                  Sequentially gated. Each stage opens only when the previous
                  one is approved by the CEO. Stages 6 and 8 are lock gates —
                  visible in the stepper with a red lock icon.
                </p>
                <ul className="mt-5 space-y-2 text-[12px] text-ink-2">
                  <Bullet>
                    <span className="font-mono">01 – 05</span> · ramp from
                    parts selection to schematic review
                  </Bullet>
                  <Bullet>
                    <span className="font-mono">06 LOCK</span> · schematic
                    lock — the most consequential gate
                  </Bullet>
                  <Bullet>
                    <span className="font-mono">07</span> · priority table +
                    breadboard validation
                  </Bullet>
                  <Bullet>
                    <span className="font-mono">08 LOCK</span> · decision
                    gate — proceed or re-open
                  </Bullet>
                  <Bullet>
                    <span className="font-mono">9a / 9b</span> · layout
                    placement, then routing &amp; DFM
                  </Bullet>
                </ul>
              </div>
              <div className="border border-ink/80 bg-paper-2/40">
                <div className="border-b border-rule px-4 py-2 flex items-center justify-between">
                  <span className="mono-caps text-ink-3">
                    Stage stepper · live preview
                  </span>
                  <span className="font-mono text-[10px] text-ink-4 uppercase tracking-[0.12em]">
                    DRTG-MAIN-V2
                  </span>
                </div>
                <div className="px-4 py-4">
                  <DemoStepper />
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="py-5 flex items-start gap-4">
                <Image
                  src="/tryaksh_pcb_workflow.svg"
                  alt="Tryaksh PCB Workflow diagram"
                  width={1200}
                  height={700}
                  className="h-32 w-auto"
                  unoptimized
                />
                <div className="flex-1">
                  <div className="mono-caps text-ink-3">
                    From the handbook
                  </div>
                  <h3 className="mt-1 font-display text-[20px] text-ink">
                    Workflow one-pager
                  </h3>
                  <p className="mt-1 text-[12px] text-ink-2 leading-snug">
                    The canonical diagram lives in the handbook with the full
                    stage descriptions, owners, and outputs.
                  </p>
                </div>
                <Link
                  href="/handbook"
                  className="self-center inline-flex items-center gap-1.5 mono-caps text-ink-2 hover:text-ink"
                >
                  Open handbook
                  <ArrowRight className="size-3" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── § 03 — For designers ────────────────────────────── */}
        <section id="designer" className="scroll-mt-20">
          <SectionHeader num="03" icon={ListChecks} title="For designers" />
          <div className="space-y-8">
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-12">
              <div>
                <p className="font-display text-[18px] text-ink-2 leading-snug">
                  Open the stage workspace. Tick items. Submit.
                </p>
                <p className="mt-3 text-[13px] text-ink-3 leading-relaxed">
                  Every checklist item must be either ticked with initials, or
                  marked N/A with a written reason. The submit button stays
                  disabled until every item is resolved.
                </p>
                <ul className="mt-5 space-y-2 text-[12px] text-ink-2">
                  <Bullet>Toggle freely until you submit</Bullet>
                  <Bullet>Initials autosave on blur</Bullet>
                  <Bullet>Attach Drive folders, Git tags, datasheets</Bullet>
                  <Bullet>Write working notes that persist across runs</Bullet>
                  <Bullet>Once you submit, the form locks for review</Bullet>
                </ul>
              </div>
              <div>
                <div className="mono-caps text-ink-3 mb-2">
                  Stage 6 checklist · try clicking
                </div>
                <DemoChecklist />
              </div>
            </div>

            <Card>
              <CardContent className="py-5 grid sm:grid-cols-3 gap-6">
                <FeaturePoint
                  title="External links"
                  body="Drive folders, Git tags, datasheets, inspection photos. Categorised. Hover to remove your own links."
                />
                <FeaturePoint
                  title="Stage notes"
                  body="Free-text working notes scoped to the stage run. Visible to the CEO at review. Preserved across send-backs."
                />
                <FeaturePoint
                  title="Run iteration"
                  body="Stage 5 (schematic review) can loop. CEO sends back, you commit fixes, resubmit. Stage 8 reopen creates a new Stage 6 run with bumped runNumber."
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── § 04 — For the CEO ──────────────────────────────── */}
        <section id="ceo" className="scroll-mt-20">
          <SectionHeader num="04" icon={Stamp} title="For the CEO" />
          <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-12">
            <div>
              <p className="font-display text-[18px] text-ink-2 leading-snug">
                Dashboard shows the queue. Open. Decide.
              </p>
              <p className="mt-3 text-[13px] text-ink-3 leading-relaxed">
                Every stage submitted by a designer lands as an amber card on
                your dashboard, in the order it arrived. Open the stage,
                review the checklist, then approve & advance — or send back
                with a written change list.
              </p>
              <ul className="mt-5 space-y-2 text-[12px] text-ink-2">
                <Bullet>Typed-name signature is required to approve</Bullet>
                <Bullet>Self-approval is server-side rejected</Bullet>
                <Bullet>
                  Stage 8 has its own panel: <em>proceed</em> vs.{" "}
                  <em>reopen</em>
                </Bullet>
                <Bullet>
                  Reopen requires a ≥10-character root-cause note
                </Bullet>
              </ul>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-1.5 mono-caps text-ink hover:text-signal"
              >
                See the live queue on the dashboard
                <ArrowRight className="size-3" />
              </Link>
            </div>
            <div>
              <div className="mono-caps text-ink-3 mb-2">
                Decision panel · interactive
              </div>
              <DemoApprovalPanel />
            </div>
          </div>
        </section>

        {/* ── § 05 — Lock gates ────────────────────────────── */}
        <section id="lock-gates" className="scroll-mt-20">
          <SectionHeader num="05" icon={Lock} title="Lock gates" />
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <GateCard
                num="06"
                title="Schematic Lock"
                description="The most consequential gate in the entire workflow. Once locked, the schematic does not change. The lock is recorded as an immutable approval with the CEO's typed name."
                rule="If a change is genuinely necessary — a Stage 7 breadboard failure, a sourcing issue — it goes through a formal Re-Open Request. The friction is intentional."
              />
              <GateCard
                num="08"
                title="Decision Gate"
                description="Branches the workflow. CEO chooses Proceed (advance to Stage 9a layout) or Re-open schematic (create a new Stage 6 run with runNumber+1)."
                rule="Re-open path is logged as schematic_reopened in the audit, with the root-cause note attached and the original lock approval preserved."
              />
            </div>
            <Card>
              <CardContent className="py-5">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <div className="mono-caps text-signal-ink mb-2">
                      Run number tracking
                    </div>
                    <p className="text-[12px] text-ink-2 leading-snug">
                      Every time a stage is re-run (Stage 8 reopen path), a
                      new row in <code className="font-mono text-[11px] bg-paper-3 px-1">project_stage_runs</code> is
                      created with <code className="font-mono text-[11px] bg-paper-3 px-1">runNumber</code> incremented.
                      The original approval stays as an audit record. The
                      stepper shows{" "}
                      <span className="font-mono text-[10px] text-ink-3">
                        r2
                      </span>{" "}
                      next to the stage marker.
                    </p>
                  </div>
                  <div>
                    <div className="mono-caps text-signal-ink mb-2">
                      Edit locks
                    </div>
                    <p className="text-[12px] text-ink-2 leading-snug">
                      The moment a designer requests approval, the checklist
                      locks. Approved runs lock permanently. Server-side
                      checks reject every mutation, so even direct API calls
                      can&apos;t bypass it.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── § 06 — Records & audit ────────────────────────── */}
        <section id="records" className="scroll-mt-20">
          <SectionHeader num="06" icon={ScrollText} title="Records & audit" />
          <div className="space-y-6">
            <div className="grid md:grid-cols-[2fr_1fr] gap-8">
              <div>
                <div className="mono-caps text-ink-3 mb-2">
                  Project audit log · sample
                </div>
                <DemoAudit />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-display text-[18px] text-ink-2 leading-snug">
                    Every action, append-only.
                  </p>
                  <p className="mt-3 text-[13px] text-ink-3 leading-relaxed">
                    Project creation, every checklist toggle, every approval,
                    every send-back, every reopen, every link, every role
                    change — recorded with actor email, role, IP, user-agent,
                    and before/after JSON.
                  </p>
                </div>
                <ul className="space-y-2 text-[12px] text-ink-2">
                  <Bullet>Per-project view at <span className="font-mono">/projects/[id]/audit</span></Bullet>
                  <Bullet>Global view at <span className="font-mono">/audit</span> (CEO + Viewer)</Bullet>
                  <Bullet>CSV export with one click</Bullet>
                  <Bullet>Times in IST; UTC stored canonically</Bullet>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── § 07 — Administration ──────────────────────────── */}
        <section id="admin" className="scroll-mt-20">
          <SectionHeader num="07" icon={UserCog} title="Administration" />
          <div className="grid md:grid-cols-3 gap-4">
            <AdminCard
              title="Team & roles"
              description="CEO promotes designers to viewers, designers to CEO, or back. The last CEO cannot be demoted — promote another first."
              cta="Open Settings"
              href="/settings"
            />
            <AdminCard
              title="Email allowlist"
              description="Only emails in EMAIL_ALLOWLIST can request sign-in. New allowlisted users are auto-provisioned as Viewer; promote in Settings."
              cta="View allowlist"
              href="/settings"
            />
            <AdminCard
              title="Project status"
              description="Move a project on-hold, mark completed, or archive. Hard delete is also available for test data — typed-code confirmation required."
              cta="Open Projects"
              href="/projects"
            />
          </div>
        </section>

        {/* ── § 08 — Begin ─────────────────────────────────────── */}
        <section id="begin" className="scroll-mt-20">
          <SectionHeader num="08" icon={Sparkles} title="Begin" />
          <Card className="bg-ink text-paper border-ink">
            <CardContent className="py-10 px-8 md:px-12">
              <div className="mono-caps text-signal mb-3">
                Tour complete · ready to work
              </div>
              <h2
                className="display text-[clamp(36px,5vw,56px)] leading-[1.02] text-paper"
                style={{
                  fontVariationSettings:
                    '"opsz" 144, "SOFT" 50, "WONK" 0',
                }}
              >
                Open a project, run the workflow.
              </h2>
              <p className="mt-5 max-w-xl font-display text-[18px] text-paper/70 leading-snug">
                You&apos;ve seen every surface. Open the dashboard to see
                what&apos;s waiting; open the handbook for the source-of-truth
                SOP; open projects to start a new one.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-signal text-paper px-5 py-3 font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-signal-2 transition-colors"
                >
                  Go to dashboard
                  <ArrowRight className="size-3" />
                </Link>
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-2 border border-paper/40 bg-transparent text-paper px-5 py-3 font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-paper hover:text-ink transition-colors"
                >
                  Open new project
                  <ArrowRight className="size-3" />
                </Link>
                <Link
                  href="/handbook"
                  className="inline-flex items-center gap-2 border border-paper/40 bg-transparent text-paper px-5 py-3 font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-paper hover:text-ink transition-colors"
                >
                  Read the handbook
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────

function SectionHeader({
  num,
  icon: Icon,
  title,
}: {
  num: string;
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="border-t border-rule-3 pt-6 pb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Icon className="size-3.5 text-ink-3" />
          <span className="mono-caps text-ink-3">§ {num}</span>
        </div>
        <h2 className="font-display text-[clamp(32px,4vw,48px)] leading-[1.02] text-ink">
          {title}
        </h2>
      </div>
    </div>
  );
}

function ModeCard({
  num,
  title,
  description,
  href,
}: {
  num: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="group block">
      <div className="border border-rule bg-paper-2 h-full transition-colors hover:border-ink">
        <div className="border-b border-rule px-4 py-2 flex items-center justify-between">
          <span className="mono-caps text-ink-3">Mode {num}</span>
          <ArrowRight className="size-3 text-ink-3 group-hover:text-ink" />
        </div>
        <div className="px-4 py-4">
          <div className="font-display text-[20px] text-ink leading-tight">
            {title}
          </div>
          <p className="mt-2 text-[12px] text-ink-2 leading-snug">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

function GateCard({
  num,
  title,
  description,
  rule,
}: {
  num: string;
  title: string;
  description: string;
  rule: string;
}) {
  return (
    <div className="border border-alert-ink/40 bg-alert-soft/30">
      <div className="border-b border-alert-ink/30 px-4 py-2 flex items-center gap-2">
        <Lock className="size-3 text-alert" />
        <span className="mono-caps text-alert-ink">
          Stage {num} · Lock gate
        </span>
      </div>
      <div className="px-4 py-4 space-y-3">
        <h3 className="font-display text-[22px] text-ink leading-tight">
          {title}
        </h3>
        <p className="text-[12px] text-ink-2 leading-snug">{description}</p>
        <div className="border-l-2 border-alert pl-3 text-[11px] text-ink-3 italic leading-snug">
          {rule}
        </div>
      </div>
    </div>
  );
}

function AdminCard({
  title,
  description,
  cta,
  href,
}: {
  title: string;
  description: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="border border-rule bg-paper-2 flex flex-col">
      <div className="px-4 py-4 flex-1">
        <h3 className="font-display text-[18px] text-ink leading-tight">
          {title}
        </h3>
        <p className="mt-2 text-[12px] text-ink-2 leading-snug">
          {description}
        </p>
      </div>
      <Link
        href={href}
        className="border-t border-rule px-4 py-2.5 flex items-center justify-between mono-caps text-ink-2 hover:bg-paper-3 hover:text-ink transition-colors"
      >
        <span>{cta}</span>
        <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}

function FeaturePoint({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] text-signal-ink uppercase tracking-[0.14em] mb-1.5">
        {title}
      </div>
      <p className="text-[12px] text-ink-2 leading-snug">{body}</p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1 size-1 shrink-0 bg-ink-3" />
      <span>{children}</span>
    </li>
  );
}

function CornerMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={`absolute size-3 ${className ?? ""}`}>
      <span className="absolute inset-x-0 top-0 h-px bg-ink-3" />
      <span className="absolute inset-y-0 left-0 w-px bg-ink-3" />
    </span>
  );
}

