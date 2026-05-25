import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Lock, BookOpen, ShieldCheck } from "lucide-react";
import { getPcbWorkflow, getStagesForWorkflow } from "@/server/queries/handbook";

export const metadata = {
  title: `Handbook — ${APP_NAME}`,
  description:
    "PCB Design SOP reference — Tryaksh ten-stage workflow with breadboard validation.",
};

async function loadStages() {
  try {
    const wf = await getPcbWorkflow();
    if (!wf) return { workflow: null, stages: [] };
    const stages = await getStagesForWorkflow(wf.id);
    return { workflow: wf, stages };
  } catch {
    return { workflow: null, stages: [] };
  }
}

export default async function HandbookPage() {
  const { workflow, stages } = await loadStages();

  return (
    <div className="space-y-12">
      {/* ── Cover header ───────────────────────────────────────── */}
      <header>
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="size-3.5 text-ink-3" />
          <span className="mono-caps text-ink-3">
            TRYAKSH-SOP-PCB-001
            {workflow && ` · v${workflow.version}`}
          </span>
        </div>
        <h1 className="display text-[clamp(48px,7vw,84px)] leading-[0.98] text-ink">
          PCB Design
          <br />
          <em className="italic" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}>
            Handbook.
          </em>
        </h1>
        <p className="mt-6 max-w-2xl font-display text-[20px] leading-snug text-ink-2">
          The Tryaksh ten-stage workflow with breadboard validation — read-only
          reference. CEO co-owns parts selection and schematic intent; designer
          owns execution; no PCB layout begins until the risky parts of the
          circuit have been physically validated.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/handbook/standards"
            className="inline-flex items-center gap-2 border border-ink bg-paper px-3 py-2 mono-caps text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            <ShieldCheck className="size-3" />
            Read engineering standards first
            <ChevronRight className="size-3" />
          </Link>
        </div>
      </header>

      {/* ── Workflow diagram ─────────────────────────────────── */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <h2 className="font-display text-[24px] text-ink">The workflow diagram</h2>
            <p className="mono-caps text-ink-3 mt-1">
              Plate 01 · One-pager
            </p>
          </div>
          <span className="section-mark">§ 02</span>
        </div>
        <div className="border border-ink/80 bg-paper p-4 md:p-6">
          <Image
            src="/tryaksh_pcb_workflow.svg"
            alt="Tryaksh PCB Workflow diagram"
            width={1200}
            height={700}
            className="mx-auto h-auto w-full max-w-full"
            unoptimized
          />
        </div>
      </section>

      {/* ── Stage index ──────────────────────────────────────── */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="font-display text-[24px] text-ink">Table of contents</h2>
            <p className="mono-caps text-ink-3 mt-1">
              Ten stages · sequentially gated
            </p>
          </div>
          <span className="section-mark">§ 03</span>
        </div>

        {stages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mono-caps text-ink-3 mb-2">Not yet seeded</div>
              <p className="text-[13px] text-ink-2 max-w-md mx-auto">
                Run{" "}
                <code className="font-mono text-[12px] bg-paper-3 px-1.5 py-0.5 border border-rule">
                  pnpm db:push && pnpm db:seed
                </code>{" "}
                after configuring{" "}
                <code className="font-mono text-[12px] bg-paper-3 px-1.5 py-0.5 border border-rule">
                  DATABASE_URL
                </code>{" "}
                in <code className="font-mono text-[12px] bg-paper-3 px-1.5 py-0.5 border border-rule">.env.local</code>.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ol className="border-y border-ink/80 divide-y divide-rule">
            {stages.map((stage, idx) => (
              <li key={stage.id}>
                <Link
                  href={`/handbook/stages/${stage.stageNumber}`}
                  className="group grid grid-cols-[auto_auto_1fr_auto_auto] items-baseline gap-x-5 px-5 py-4 hover:bg-paper-2 transition-colors"
                >
                  <span className="font-mono text-[11px] text-ink-3 tabular w-6">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[11px] text-ink-3 uppercase tracking-[0.12em]">
                    Stage {stage.stageNumber}
                  </span>
                  <div className="min-w-0">
                    <div className="font-display text-[22px] leading-tight text-ink group-hover:underline underline-offset-4 decoration-signal">
                      {stage.name}
                    </div>
                    {stage.subtitle && (
                      <div className="mt-0.5 text-[12px] text-ink-3 italic">
                        {stage.subtitle}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {stage.isLockGate && (
                      <Badge variant="alert" className="gap-1">
                        <Lock className="size-2" />
                        LOCK
                      </Badge>
                    )}
                    {stage.requiresApproval && !stage.isLockGate && (
                      <Badge variant="secondary">approval</Badge>
                    )}
                  </div>
                  <ChevronRight className="size-4 text-ink-3 group-hover:text-ink" />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
