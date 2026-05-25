import Link from "next/link";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardMark } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StageStepper } from "@/components/projects/stage-stepper";
import { ProjectStatusMenu } from "@/components/projects/status-menu";
import {
  getProjectById,
  getProjectStepperRows,
} from "@/server/queries/projects";
import { requireUser } from "@/server/auth";
import { ArrowLeft, ArrowRight, Lock, ScrollText, ShieldCheck } from "lucide-react";

export const metadata = {
  title: `Project — ${APP_NAME}`,
};

const STATUS_LABEL: Record<string, string> = {
  in_progress: "In progress",
  on_hold: "On hold",
  completed: "Completed",
  archived: "Archived",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "seal" | "blueprint" | "warn" | "alert" | "signal"
> = {
  in_progress: "blueprint",
  on_hold: "warn",
  completed: "seal",
  archived: "outline",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const row = await getProjectById(id).catch(() => null);
  if (!row) notFound();

  const { project, designer, workflow } = row;
  const stepperRows = await getProjectStepperRows(project.id, workflow.id);
  const currentStage = stepperRows.find(
    (s) => s.stageId === project.currentStageId
  );

  const approvedCount = stepperRows.filter((s) => s.runStatus === "approved").length;
  const totalStages = stepperRows.length;
  const progressPct = Math.round((approvedCount / totalStages) * 100);

  return (
    <div className="space-y-10">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 mono-caps text-ink-3 hover:text-ink"
      >
        <ArrowLeft className="size-3" />
        Back to register
      </Link>

      {/* ── Header block ─────────────────────────────────────── */}
      <header className="border-t border-rule-3 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-[11px] text-ink-3 uppercase tracking-[0.12em]">
                {project.code}
              </span>
              <span className="text-ink-4">·</span>
              <span className="inline-flex items-center justify-center size-5 border border-ink font-mono text-[10px] font-medium">
                {project.designClass}
              </span>
              <Badge variant={STATUS_VARIANT[project.status] ?? "secondary"}>
                {STATUS_LABEL[project.status] ?? project.status}
              </Badge>
            </div>
            <h1 className="display text-[clamp(40px,5vw,60px)] leading-[1.02] text-ink">
              {project.name}
            </h1>
            <p className="mt-3 text-[14px] text-ink-2 max-w-2xl">
              Designer{" "}
              <span className="text-ink">{designer.name}</span>{" "}
              <span className="font-mono text-[11px] text-ink-3">
                ({designer.email})
              </span>
              <span className="mx-2 text-ink-4">·</span>
              Workflow{" "}
              <span className="text-ink">{workflow.name}</span>{" "}
              <span className="font-mono text-[11px] text-ink-3">
                v{workflow.version}
              </span>
            </p>
          </div>
          {user.role === "ceo" && (
            <ProjectStatusMenu
              projectId={project.id}
              currentStatus={project.status as "in_progress" | "on_hold" | "completed" | "archived"}
            />
          )}
        </div>

        {/* Progress bar — engineering gauge */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1">
            <div className="h-1 bg-paper-3 border border-rule overflow-hidden">
              <div
                className="h-full bg-ink"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-[14px] tabular text-ink">{approvedCount}</span>
            <span className="text-[11px] text-ink-3">/ {totalStages} stages</span>
          </div>
        </div>
      </header>

      {/* ── Stage diagram ─────────────────────────────────────── */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="font-display text-[24px] text-ink">Workflow diagram</h2>
            <p className="mono-caps text-ink-3 mt-1">
              Ten stages · sequentially gated
            </p>
          </div>
          <span className="section-mark">§ 02</span>
        </div>
        <div className="border border-ink/80 bg-paper-2/40">
          <div className="px-4 py-4">
            <StageStepper
              projectId={project.id}
              stages={stepperRows}
              currentStageId={project.currentStageId}
            />
          </div>
        </div>
      </section>

      {/* ── Current stage + quick links ──────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <Card>
          <CardMark>§ 03</CardMark>
          <CardHeader>
            <CardTitle>Current stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {currentStage ? (
              <>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-[11px] text-ink-3 uppercase tracking-[0.12em]">
                      Stage {currentStage.stageNumber}
                    </span>
                    {currentStage.isLockGate && (
                      <Badge variant="alert" className="gap-1">
                        <Lock className="size-2" />
                        LOCK
                      </Badge>
                    )}
                    {currentStage.requiresApproval && (
                      <Badge variant="secondary">approval</Badge>
                    )}
                  </div>
                  <div className="font-display text-[28px] leading-tight text-ink">
                    {currentStage.stageName}
                  </div>
                  <div className="mt-2 mono-caps text-ink-3">
                    Status —{" "}
                    <span className="text-ink">
                      {currentStage.runStatus
                        ? labelForStatus(currentStage.runStatus)
                        : "Not started"}
                    </span>
                  </div>
                </div>
                <div className="border-t border-rule pt-4 flex flex-wrap gap-3">
                  {currentStage.runId && (
                    <Button asChild variant="signal" size="sm">
                      <Link
                        href={`/projects/${project.id}/stages/${currentStage.runId}`}
                      >
                        Open workspace
                        <ArrowRight className="size-3" />
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/handbook/stages/${currentStage.stageNumber}`}>
                      <ShieldCheck className="size-3" />
                      SOP reference
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-[13px] text-ink-3">
                No current stage. Something has gone wrong with the workflow
                seed.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardMark>§ 04</CardMark>
          <CardHeader>
            <CardTitle>References</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Link
              href={`/projects/${project.id}/audit`}
              className="flex items-center justify-between px-5 py-3 border-b border-rule hover:bg-paper-3 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <ScrollText className="size-3.5 text-ink-3" />
                <span className="text-[13px] text-ink">Project audit log</span>
              </span>
              <ArrowRight className="size-3 text-ink-3" />
            </Link>
            <Link
              href="/handbook"
              className="flex items-center justify-between px-5 py-3 hover:bg-paper-3 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <ShieldCheck className="size-3.5 text-ink-3" />
                <span className="text-[13px] text-ink">Full SOP handbook</span>
              </span>
              <ArrowRight className="size-3 text-ink-3" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function labelForStatus(status: string) {
  switch (status) {
    case "not_started":
      return "Not started";
    case "in_progress":
      return "In progress";
    case "awaiting_approval":
      return "Awaiting approval";
    case "approved":
      return "Approved";
    case "skipped":
      return "Skipped";
    default:
      return status;
  }
}
