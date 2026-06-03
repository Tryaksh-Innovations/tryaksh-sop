import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, BookOpen, ShieldCheck } from "lucide-react";
import { listActiveWorkflows } from "@/server/queries/handbook";

export const metadata = {
  title: `Handbook — ${APP_NAME}`,
  description: "Tryaksh engineering handbook — PCB and Mechanical SOPs.",
};

/** Map workflow slug → diagram path. Falls back to a placeholder for unknown slugs. */
const DIAGRAM_BY_SLUG: Record<string, string> = {
  pcb: "/tryaksh_pcb_workflow.svg",
  mech: "/tryaksh_mech_workflow.svg",
};

export default async function HandbookPage() {
  const workflows = await listActiveWorkflows().catch(() => []);

  return (
    <div className="space-y-12">
      {/* ── Cover header ──────────────────────────────── */}
      <header>
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="size-3.5 text-ink-3" />
          <span className="mono-caps text-ink-3">
            Tryaksh engineering handbook
          </span>
        </div>
        <h1 className="display text-[clamp(48px,7vw,84px)] leading-[0.98] text-ink">
          The
          <br />
          <em
            className="italic"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
          >
            Handbook.
          </em>
        </h1>
        <p className="mt-6 max-w-2xl font-display text-[20px] leading-snug text-ink-2">
          Each Tryaksh design discipline has its own controlled SOP. Pick a
          workflow to open its handbook — full stage descriptions, checklists,
          and lock-gate rules. The Engineering Standards apply to all.
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

      {/* ── Workflow picker ──────────────────────────── */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="font-display text-[24px] text-ink">
              Available workflows
            </h2>
            <p className="mono-caps text-ink-3 mt-1">
              {workflows.length === 0
                ? "No workflows seeded yet"
                : `${workflows.length} workflow${workflows.length === 1 ? "" : "s"} active`}
            </p>
          </div>
          <span className="section-mark">§ 01</span>
        </div>

        {workflows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mono-caps text-ink-3 mb-2">Not yet seeded</div>
              <p className="text-[13px] text-ink-2 max-w-md mx-auto">
                Run{" "}
                <code className="font-mono text-[12px] bg-paper-3 px-1.5 py-0.5 border border-rule">
                  pnpm db:seed
                </code>{" "}
                to populate the PCB and Mechanical workflows.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map((wf) => {
              const diagram = DIAGRAM_BY_SLUG[wf.slug];
              return (
                <Link
                  key={wf.id}
                  href={`/handbook/${wf.slug}`}
                  className="group block"
                >
                  <Card className="h-full border-rule hover:border-ink transition-colors">
                    {diagram && (
                      <div className="border-b border-rule bg-paper p-3">
                        <Image
                          src={diagram}
                          alt={`${wf.name} diagram`}
                          width={1200}
                          height={700}
                          className="mx-auto h-32 w-auto"
                          unoptimized
                        />
                      </div>
                    )}
                    <CardContent className="py-5">
                      <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.12em]">
                        TRYAKSH-SOP-{wf.slug.toUpperCase()}-001 · v{wf.version}
                      </div>
                      <div className="mt-1.5 font-display text-[24px] text-ink leading-tight">
                        {wf.name}
                      </div>
                      {wf.description && (
                        <p className="mt-2 text-[12px] text-ink-2 leading-snug line-clamp-3">
                          {wf.description}
                        </p>
                      )}
                      <div className="mt-4 inline-flex items-center gap-1.5 mono-caps text-ink-2 group-hover:text-ink">
                        Open handbook
                        <ChevronRight className="size-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
