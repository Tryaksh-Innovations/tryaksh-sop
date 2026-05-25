import Link from "next/link";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardMark } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChecklistForm } from "@/components/stages/checklist-form";
import {
  ApprovalPanel,
  Stage8DecisionPanel,
  RequestApprovalButton,
} from "@/components/stages/approval-panel";
import { ExternalLinksPanel } from "@/components/stages/external-links-panel";
import { StageNotes } from "@/components/stages/stage-notes";
import { Markdown } from "@/components/shared/markdown";
import { getStageRunDetail } from "@/server/queries/stage-runs";
import { requireUser } from "@/server/auth";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ScrollText,
} from "lucide-react";

export const metadata = {
  title: `Stage workspace — ${APP_NAME}`,
};

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  awaiting_approval: "Awaiting approval",
  approved: "Approved",
  skipped: "Skipped",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "seal" | "blueprint" | "warn" | "alert" | "signal"
> = {
  not_started: "outline",
  in_progress: "blueprint",
  awaiting_approval: "warn",
  approved: "seal",
  skipped: "secondary",
};

function formatDate(d: Date | null) {
  if (!d) return null;
  return new Date(d).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function StageWorkspacePage({
  params,
}: {
  params: Promise<{ id: string; stageRunId: string }>;
}) {
  const { id: projectId, stageRunId } = await params;
  const user = await requireUser();

  const data = await getStageRunDetail(stageRunId).catch(() => null);
  if (!data || data.project.id !== projectId) notFound();

  const { run, stage, project, designer, items, responses, links, approval } =
    data;

  const isDesigner = user.id === project.designerId;
  const isCeo = user.role === "ceo";
  const isLocked =
    run.status === "awaiting_approval" || run.status === "approved";
  const checklistEditable = isDesigner && !isLocked;

  const lockedReason = !isDesigner
    ? "Read-only — only the assigned designer edits responses."
    : run.status === "approved"
      ? "This stage is approved and locked."
      : run.status === "awaiting_approval"
        ? "Submitted for CEO approval — edits are locked until decision."
        : undefined;

  const requestable =
    isDesigner &&
    stage.requiresApproval &&
    (run.status === "in_progress" || run.status === "not_started");

  const allItemsComplete = (() => {
    const respByItem = new Map(
      responses.map((r) => [r.checklistItemId, r] as const)
    );
    for (const it of items) {
      const r = respByItem.get(it.id);
      const ok =
        r && ((r.checked && r.initials) || (!r.checked && r.naReason));
      if (!ok) return false;
    }
    return true;
  })();

  return (
    <div className="space-y-10">
      <Link
        href={`/projects/${project.id}`}
        className="inline-flex items-center gap-1.5 mono-caps text-ink-3 hover:text-ink"
      >
        <ArrowLeft className="size-3" />
        Back to project
      </Link>

      {/* ── Workspace header ─────────────────────────────────── */}
      <header className="border-t border-rule-3 pt-6">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="font-mono text-[11px] text-ink-3 uppercase tracking-[0.12em]">
            {project.code} · Stage {stage.stageNumber}
          </span>
          {run.runNumber > 1 && (
            <Badge variant="secondary">Run #{run.runNumber}</Badge>
          )}
          {stage.isLockGate && (
            <Badge variant="alert" className="gap-1">
              <Lock className="size-2" />
              LOCK GATE
            </Badge>
          )}
          <Badge variant={STATUS_VARIANT[run.status] ?? "secondary"}>
            {STATUS_LABEL[run.status] ?? run.status}
          </Badge>
        </div>
        <h1 className="display text-[clamp(36px,5vw,52px)] leading-[1.02] text-ink">
          {stage.name}
        </h1>
        {stage.subtitle && (
          <p className="mt-2 font-display text-[18px] text-ink-2">
            {stage.subtitle}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] text-ink-3">
          <span>
            Designer ·{" "}
            <span className="text-ink">{designer.name}</span>
          </span>
          {run.submittedAt && (
            <span>
              Submitted ·{" "}
              <span className="text-ink">{formatDate(run.submittedAt)}</span>
            </span>
          )}
          {approval && (
            <span>
              Approved ·{" "}
              <span className="text-ink">{approval.approverName}</span> ({formatDate(approval.approval.approvedAt)})
            </span>
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/handbook/stages/${stage.stageNumber}`}
            className="inline-flex items-center gap-1.5 border border-rule-2 bg-paper-2 px-3 py-1.5 mono-caps text-ink-2 hover:bg-paper-3 hover:text-ink transition-colors"
          >
            <ShieldCheck className="size-3" />
            SOP reference
          </Link>
          <Link
            href={`/projects/${project.id}/audit`}
            className="inline-flex items-center gap-1.5 border border-rule-2 bg-paper-2 px-3 py-1.5 mono-caps text-ink-2 hover:bg-paper-3 hover:text-ink transition-colors"
          >
            <ScrollText className="size-3" />
            Audit log
          </Link>
        </div>
      </header>

      {/* CEO action panel — top placement when awaiting */}
      {isCeo && run.status === "awaiting_approval" && (
        <Card className="border-ink shadow-[4px_4px_0_0_var(--rule)]">
          <CardMark>§ A</CardMark>
          <CardContent className="py-6">
            {stage.stageNumber === "8" ? (
              <Stage8DecisionPanel
                stageRunId={run.id}
                ceoName={user.name}
              />
            ) : (
              <ApprovalPanel
                stageRunId={run.id}
                isLockGate={stage.isLockGate}
                ceoName={user.name}
              />
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          {stage.descriptionMarkdown && (
            <Card>
              <CardMark>§ 01</CardMark>
              <CardHeader>
                <CardTitle>From the SOP</CardTitle>
              </CardHeader>
              <CardContent>
                <Markdown
                  content={
                    stage.descriptionMarkdown.split("\n").slice(0, 6).join("\n") +
                    "\n\n_See full SOP on the handbook reference._"
                  }
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardMark>§ 02</CardMark>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>Verification checklist</span>
                {stage.requiresApproval && (
                  <Badge variant={allItemsComplete ? "seal" : "warn"} className="gap-1">
                    {allItemsComplete ? (
                      <>
                        <CheckCircle2 className="size-2.5" />
                        Complete
                      </>
                    ) : (
                      <>
                        <Clock className="size-2.5" />
                        In progress
                      </>
                    )}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChecklistForm
                stageRunId={run.id}
                items={items}
                responses={responses}
                canEdit={checklistEditable}
                lockedReason={lockedReason}
              />
              {requestable && (
                <div className="mt-6 pt-5 border-t border-rule space-y-2">
                  <div className="mono-caps text-ink-3 mb-1">Submit</div>
                  <p className="text-[12px] text-ink-2 leading-snug">
                    When every item is checked-with-initials or marked N/A with
                    a reason, submit for CEO approval. The checklist locks at
                    submission.
                  </p>
                  <RequestApprovalButton
                    stageRunId={run.id}
                    disabled={!allItemsComplete}
                  />
                  {!allItemsComplete && (
                    <p className="font-mono text-[10px] text-ink-3">
                      Submit becomes available once all items are resolved.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardMark>§ 03</CardMark>
            <CardHeader>
              <CardTitle>External links</CardTitle>
            </CardHeader>
            <CardContent>
              <ExternalLinksPanel
                stageRunId={run.id}
                canAdd={(isDesigner || isCeo) && !isLocked}
                links={links.map((l) => ({
                  id: l.link.id,
                  kind: l.link.kind as
                    | "drive"
                    | "git"
                    | "datasheet"
                    | "image"
                    | "other",
                  label: l.link.label,
                  url: l.link.url,
                  addedByName: l.addedByName,
                  addedAt: l.link.addedAt,
                  canRemove:
                    !isLocked &&
                    (l.link.addedBy === user.id || user.role === "ceo"),
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardMark>§ 04</CardMark>
            <CardHeader>
              <CardTitle>Stage notes</CardTitle>
            </CardHeader>
            <CardContent>
              <StageNotes
                stageRunId={run.id}
                initialNotes={run.notesMarkdown ?? ""}
                canEdit={(isDesigner || isCeo) && !isLocked}
              />
            </CardContent>
          </Card>

          {approval && (
            <Card className="border-seal-ink/40 bg-seal-soft/40">
              <CardMark>§ 05</CardMark>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-seal-ink">
                  <CheckCircle2 className="size-3.5" />
                  Approval record
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-[13px]">
                <div>
                  <span className="mono-caps text-ink-3">By</span>
                  <div className="text-ink">
                    {approval.approverName}{" "}
                    <span className="font-mono text-[11px] text-ink-3">
                      ({approval.approverEmail})
                    </span>
                  </div>
                </div>
                <div>
                  <span className="mono-caps text-ink-3">Typed signature</span>
                  <div className="font-display text-[18px] text-ink italic">
                    {approval.approval.typedName}
                  </div>
                </div>
                <div>
                  <span className="mono-caps text-ink-3">At</span>
                  <div className="font-mono text-[12px] text-ink">
                    {formatDate(approval.approval.approvedAt)}
                  </div>
                </div>
                {run.decision && (
                  <div>
                    <span className="mono-caps text-ink-3">Decision</span>
                    <div>
                      <Badge
                        variant={
                          run.decision === "proceed" ? "seal" : "destructive"
                        }
                      >
                        {run.decision === "proceed"
                          ? "Proceed to layout"
                          : "Re-open schematic"}
                      </Badge>
                    </div>
                  </div>
                )}
                {approval.approval.note && (
                  <div className="mt-3 border-l-2 border-seal-ink/40 pl-3 text-[12px] text-ink-2 italic">
                    “{approval.approval.note}”
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {project.currentStageId && project.currentStageId !== stage.id && (
        <Card>
          <CardContent className="flex items-center justify-between py-4 text-[13px]">
            <span className="text-ink-3">
              The project has moved on to a later stage.
            </span>
            <Link
              href={`/projects/${project.id}`}
              className="inline-flex items-center gap-1.5 mono-caps text-ink hover:text-signal"
            >
              Go to current stage
              <ArrowRight className="size-3" />
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
