import Link from "next/link";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/shared/markdown";
import { ArrowLeft, Lock, ListChecks } from "lucide-react";
import {
  getPcbWorkflow,
  getStageByNumber,
  getStagesForWorkflow,
  getChecklistItemsForStage,
} from "@/server/queries/handbook";

export const metadata = {
  title: `Stage reference — ${APP_NAME}`,
  description: "SOP reference for a workflow stage.",
};

interface StagePageData {
  stage: Awaited<ReturnType<typeof getStageByNumber>>;
  items: Awaited<ReturnType<typeof getChecklistItemsForStage>>;
  prev: { stageNumber: string; name: string } | null;
  next: { stageNumber: string; name: string } | null;
}

async function load(stageNumber: string): Promise<StagePageData | null> {
  try {
    const wf = await getPcbWorkflow();
    if (!wf) return null;
    const stage = await getStageByNumber(wf.id, stageNumber);
    if (!stage) return null;
    const items = await getChecklistItemsForStage(stage.id);
    const all = await getStagesForWorkflow(wf.id);
    const idx = all.findIndex((s) => s.id === stage.id);
    const prev = idx > 0 ? all[idx - 1] : null;
    const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
    return {
      stage,
      items,
      prev: prev ? { stageNumber: prev.stageNumber, name: prev.name } : null,
      next: next ? { stageNumber: next.stageNumber, name: next.name } : null,
    };
  } catch {
    return null;
  }
}

interface GroupedItem {
  heading: string | null;
  items: Awaited<ReturnType<typeof getChecklistItemsForStage>>;
}

function groupBySection(
  items: Awaited<ReturnType<typeof getChecklistItemsForStage>>
): GroupedItem[] {
  const groups: GroupedItem[] = [];
  let current: GroupedItem | null = null;
  for (const item of items) {
    if (item.sectionHeading || !current) {
      current = { heading: item.sectionHeading ?? null, items: [] };
      groups.push(current);
    }
    current.items.push(item);
  }
  return groups;
}

export default async function HandbookStagePage({
  params,
}: {
  params: Promise<{ stageNumber: string }>;
}) {
  const { stageNumber } = await params;
  const data = await load(stageNumber);

  if (!data) {
    return (
      <div className="space-y-6">
        <Link
          href="/handbook"
          className="inline-flex items-center gap-1.5 mono-caps text-ink-3 hover:text-ink"
        >
          <ArrowLeft className="size-3" />
          Back to handbook
        </Link>
        <h1 className="display text-[40px] text-ink">Stage {stageNumber}</h1>
        <Card>
          <CardContent className="py-10 text-center text-[13px] text-ink-3">
            Stage not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const { stage, items, prev, next } = data;
  if (!stage) notFound();
  const groups = groupBySection(items);
  let itemCounter = 0;

  return (
    <div className="space-y-10">
      <Link
        href="/handbook"
        className="inline-flex items-center gap-1.5 mono-caps text-ink-3 hover:text-ink"
      >
        <ArrowLeft className="size-3" />
        Back to handbook
      </Link>

      {/* ── Stage header ─────────────────────────────────────── */}
      <header className="border-t border-rule-3 pt-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-mono text-[11px] text-ink-3 uppercase tracking-[0.12em]">
            Stage {stage.stageNumber}
          </span>
          {stage.isLockGate && (
            <Badge variant="alert" className="gap-1">
              <Lock className="size-2" />
              LOCK GATE
            </Badge>
          )}
          {stage.requiresApproval && (
            <Badge variant="secondary">requires approval</Badge>
          )}
        </div>
        <h1 className="display text-[clamp(40px,6vw,68px)] leading-[1.02] text-ink">
          {stage.name}
        </h1>
        {stage.subtitle && (
          <p className="mt-3 font-display italic text-[20px] text-ink-2">
            {stage.subtitle}
          </p>
        )}
      </header>

      {/* ── SOP body ─────────────────────────────────────────── */}
      {stage.descriptionMarkdown && (
        <article className="border-t border-rule pt-6">
          <Markdown content={stage.descriptionMarkdown} />
        </article>
      )}

      {/* ── Verification checklist ───────────────────────────── */}
      <section>
        <div className="flex items-baseline justify-between mb-4 border-t border-rule-3 pt-6">
          <div>
            <div className="flex items-center gap-2">
              <ListChecks className="size-4 text-ink-3" />
              <h2 className="font-display text-[26px] text-ink">
                Verification checklist
              </h2>
            </div>
            <p className="mono-caps text-ink-3 mt-1">
              {items.length} items · {groups.length} section{groups.length !== 1 ? "s" : ""}
            </p>
          </div>
          <span className="section-mark">§ {stage.stageNumber}</span>
        </div>

        {items.length === 0 ? (
          <p className="text-[13px] text-ink-3">
            No checklist items for this stage.
          </p>
        ) : (
          <div className="space-y-8">
            {groups.map((group, gIdx) => (
              <div key={gIdx}>
                {group.heading && (
                  <div className="flex items-center gap-3 mb-3">
                    <span className="mono-caps text-ink-2">
                      {group.heading}
                    </span>
                    <div className="flex-1 h-px bg-rule-2" />
                  </div>
                )}
                <ol className="space-y-px border-y border-rule">
                  {group.items.map((item) => {
                    itemCounter++;
                    return (
                      <li
                        key={item.id}
                        className="grid grid-cols-[auto_auto_minmax(0,1fr)] gap-4 px-1 py-3 border-b border-rule last:border-b-0"
                      >
                        <span className="font-mono text-[10px] text-ink-3 tabular pt-0.5">
                          {String(itemCounter).padStart(2, "0")}
                        </span>
                        <span className="size-3.5 border border-ink/70 bg-paper mt-0.5" />
                        <div>
                          <div className="text-[14px] font-medium text-ink leading-snug">
                            {item.label}
                          </div>
                          <div className="mt-1 text-[12px] text-ink-2 leading-snug">
                            {item.criterion}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Footer nav ──────────────────────────────────────── */}
      <nav className="border-t border-rule-3 pt-5 grid grid-cols-2 gap-4">
        {prev ? (
          <Link
            href={`/handbook/stages/${prev.stageNumber}`}
            className="group block"
          >
            <div className="mono-caps text-ink-3 mb-1">
              ← Previous · Stage {prev.stageNumber}
            </div>
            <div className="font-display text-[20px] text-ink group-hover:underline underline-offset-4 decoration-signal">
              {prev.name}
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/handbook/stages/${next.stageNumber}`}
            className="group block text-right"
          >
            <div className="mono-caps text-ink-3 mb-1">
              Next · Stage {next.stageNumber} →
            </div>
            <div className="font-display text-[20px] text-ink group-hover:underline underline-offset-4 decoration-signal">
              {next.name}
            </div>
          </Link>
        )}
      </nav>
    </div>
  );
}
