"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  projects,
  projectStageRuns,
  workflowStages,
  checklistItems,
  checklistResponses,
  externalLinks,
  approvals,
  users,
} from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { writeNotification } from "@/lib/notify";
import { logger } from "@/lib/logger";
import { requireUser, requireRole } from "@/server/auth";
import {
  getNextRunNumber,
  getNextStage,
  getStageByNumberForWorkflow,
} from "@/server/queries/stage-runs";
import {
  upsertChecklistResponseSchema,
  addExternalLinkSchema,
  removeExternalLinkSchema,
  updateStageNotesSchema,
  requestApprovalSchema,
  approveStageSchema,
  sendBackSchema,
  decideAtGateSchema,
} from "@/lib/validators/workflow";
import type { AppUser } from "@/server/auth";

type ActionResult<T = undefined> =
  | (T extends undefined ? { ok: true } : { ok: true; data: T })
  | { ok: false; error: string };

async function getRequestContext() {
  const h = await headers();
  return {
    ipAddress:
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      undefined,
    userAgent: h.get("user-agent") ?? undefined,
  };
}

async function loadRunForMutation(stageRunId: string) {
  const [row] = await db
    .select({
      run: projectStageRuns,
      stage: workflowStages,
      project: projects,
    })
    .from(projectStageRuns)
    .innerJoin(workflowStages, eq(workflowStages.id, projectStageRuns.stageId))
    .innerJoin(projects, eq(projects.id, projectStageRuns.projectId))
    .where(eq(projectStageRuns.id, stageRunId))
    .limit(1);
  return row ?? null;
}

function isDesignerForProject(user: AppUser, designerId: string) {
  return user.id === designerId;
}

function revalidateRun(projectId: string, runId: string) {
  revalidatePath(`/projects/${projectId}/stages/${runId}`);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/audit`);
  revalidatePath(`/projects`);
  revalidatePath(`/`);
}

// ─────────────────────────────────────────────────────────────────
// Checklist responses
// ─────────────────────────────────────────────────────────────────

export async function upsertChecklistResponse(
  raw: unknown
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = upsertChecklistResponseSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }
  const input = parsed.data;

  const ctx = await loadRunForMutation(input.stageRunId);
  if (!ctx) return { ok: false, error: "Stage run not found." };

  // Authorization: only the assigned designer (or CEO) may modify responses,
  // and only while the run is editable.
  const isDesigner = isDesignerForProject(user, ctx.project.designerId);
  if (!isDesigner && user.role !== "ceo") {
    return { ok: false, error: "Only the assigned designer can edit responses." };
  }
  if (
    ctx.run.status === "awaiting_approval" ||
    ctx.run.status === "approved"
  ) {
    return {
      ok: false,
      error:
        ctx.run.status === "approved"
          ? "This stage is approved and locked — no further edits."
          : "Stage is awaiting CEO approval; edits are locked.",
    };
  }

  // Make sure the item belongs to this stage
  const [item] = await db
    .select()
    .from(checklistItems)
    .where(
      and(
        eq(checklistItems.id, input.checklistItemId),
        eq(checklistItems.stageId, ctx.stage.id)
      )
    )
    .limit(1);
  if (!item) {
    return { ok: false, error: "Checklist item does not belong to this stage." };
  }

  const checked = input.state === "checked";
  const initials = input.state === "checked" ? input.initials?.trim() : null;
  const naReason = input.state === "na" ? input.naReason?.trim() : null;

  // Find existing response
  const [existing] = await db
    .select()
    .from(checklistResponses)
    .where(
      and(
        eq(checklistResponses.stageRunId, input.stageRunId),
        eq(checklistResponses.checklistItemId, input.checklistItemId)
      )
    )
    .limit(1);

  const before = existing
    ? {
        checked: existing.checked,
        initials: existing.initials,
        naReason: existing.naReason,
      }
    : null;

  if (existing) {
    await db
      .update(checklistResponses)
      .set({
        checked,
        initials: initials ?? null,
        naReason: naReason ?? null,
        updatedAt: new Date(),
        updatedBy: user.id,
      })
      .where(eq(checklistResponses.id, existing.id));
  } else {
    await db.insert(checklistResponses).values({
      stageRunId: input.stageRunId,
      checklistItemId: input.checklistItemId,
      checked,
      initials: initials ?? null,
      naReason: naReason ?? null,
      updatedBy: user.id,
    });
  }

  // Side effect: ensure the run status moves from not_started → in_progress
  // on the first response.
  if (ctx.run.status === "not_started") {
    await db
      .update(projectStageRuns)
      .set({
        status: "in_progress",
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(projectStageRuns.id, ctx.run.id));
  }

  const reqCtx = await getRequestContext();
  await writeAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: "checklist_item_toggled",
    entityType: "checklist_responses",
    entityId: input.checklistItemId,
    beforeJson: before,
    afterJson: { checked, initials, naReason, stageRunId: input.stageRunId },
    ipAddress: reqCtx.ipAddress,
    userAgent: reqCtx.userAgent,
  });

  revalidateRun(ctx.project.id, ctx.run.id);
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────
// External links
// ─────────────────────────────────────────────────────────────────

export async function addExternalLink(raw: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = addExternalLinkSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }
  const input = parsed.data;
  const ctx = await loadRunForMutation(input.stageRunId);
  if (!ctx) return { ok: false, error: "Stage run not found." };

  const isDesigner = isDesignerForProject(user, ctx.project.designerId);
  if (!isDesigner && user.role !== "ceo") {
    return { ok: false, error: "Not authorized to add links to this stage." };
  }

  const [created] = await db
    .insert(externalLinks)
    .values({
      stageRunId: input.stageRunId,
      kind: input.kind,
      label: input.label,
      url: input.url,
      addedBy: user.id,
    })
    .returning();

  const reqCtx = await getRequestContext();
  await writeAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: "external_link_added",
    entityType: "external_links",
    entityId: created!.id,
    afterJson: {
      stageRunId: input.stageRunId,
      kind: input.kind,
      label: input.label,
      url: input.url,
    },
    ipAddress: reqCtx.ipAddress,
    userAgent: reqCtx.userAgent,
  });

  revalidateRun(ctx.project.id, ctx.run.id);
  return { ok: true };
}

export async function removeExternalLink(
  raw: unknown
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = removeExternalLinkSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const [link] = await db
    .select()
    .from(externalLinks)
    .where(eq(externalLinks.id, parsed.data.linkId))
    .limit(1);
  if (!link) return { ok: false, error: "Link not found." };

  // Only the original adder or a CEO may remove.
  if (link.addedBy !== user.id && user.role !== "ceo") {
    return {
      ok: false,
      error: "You can only remove links you added (or CEO can remove any).",
    };
  }

  const ctx = await loadRunForMutation(link.stageRunId);
  if (!ctx) return { ok: false, error: "Stage run not found." };

  await db.delete(externalLinks).where(eq(externalLinks.id, link.id));

  const reqCtx = await getRequestContext();
  await writeAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: "external_link_removed",
    entityType: "external_links",
    entityId: link.id,
    beforeJson: { kind: link.kind, label: link.label, url: link.url },
    ipAddress: reqCtx.ipAddress,
    userAgent: reqCtx.userAgent,
  });

  revalidateRun(ctx.project.id, ctx.run.id);
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────
// Stage notes
// ─────────────────────────────────────────────────────────────────

export async function updateStageNotes(raw: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = updateStageNotesSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }
  const input = parsed.data;
  const ctx = await loadRunForMutation(input.stageRunId);
  if (!ctx) return { ok: false, error: "Stage run not found." };

  const isDesigner = isDesignerForProject(user, ctx.project.designerId);
  if (!isDesigner && user.role !== "ceo") {
    return { ok: false, error: "Not authorized to edit notes." };
  }

  await db
    .update(projectStageRuns)
    .set({ notesMarkdown: input.notesMarkdown, updatedAt: new Date() })
    .where(eq(projectStageRuns.id, input.stageRunId));

  revalidateRun(ctx.project.id, ctx.run.id);
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────
// Request approval (designer → awaiting_approval)
// ─────────────────────────────────────────────────────────────────

export async function requestApproval(raw: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = requestApprovalSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const ctx = await loadRunForMutation(parsed.data.stageRunId);
  if (!ctx) return { ok: false, error: "Stage run not found." };

  if (!isDesignerForProject(user, ctx.project.designerId)) {
    return {
      ok: false,
      error: "Only the assigned designer can request approval.",
    };
  }
  if (ctx.run.status !== "in_progress" && ctx.run.status !== "not_started") {
    return {
      ok: false,
      error: `Cannot request approval from status '${ctx.run.status}'.`,
    };
  }
  if (!ctx.stage.requiresApproval) {
    return {
      ok: false,
      error: "This stage does not require formal CEO approval.",
    };
  }

  // Pull all items + responses and check completion
  const items = await db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.stageId, ctx.stage.id));

  const responses = await db
    .select()
    .from(checklistResponses)
    .where(eq(checklistResponses.stageRunId, ctx.run.id));

  const respByItem = new Map(responses.map((r) => [r.checklistItemId, r]));

  const incomplete: string[] = [];
  for (const item of items) {
    const r = respByItem.get(item.id);
    const ok = r && ((r.checked && r.initials) || (!r.checked && r.naReason));
    if (!ok) incomplete.push(item.label);
  }

  if (incomplete.length > 0) {
    return {
      ok: false,
      error: `Cannot submit — these items are incomplete: ${incomplete
        .slice(0, 3)
        .join("; ")}${incomplete.length > 3 ? `, +${incomplete.length - 3} more` : ""}.`,
    };
  }

  await db
    .update(projectStageRuns)
    .set({
      status: "awaiting_approval",
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(projectStageRuns.id, ctx.run.id));

  // Notify all CEOs
  const ceos = await db.select().from(users).where(eq(users.role, "ceo"));
  for (const ceo of ceos) {
    await writeNotification({
      recipientId: ceo.id,
      kind: "approval_needed",
      payload: {
        projectId: ctx.project.id,
        projectCode: ctx.project.code,
        stageRunId: ctx.run.id,
        stageNumber: ctx.stage.stageNumber,
        stageName: ctx.stage.name,
      },
    });
  }

  const reqCtx = await getRequestContext();
  await writeAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: "approval_requested",
    entityType: "project_stage_runs",
    entityId: ctx.run.id,
    afterJson: {
      stageNumber: ctx.stage.stageNumber,
      stageName: ctx.stage.name,
    },
    ipAddress: reqCtx.ipAddress,
    userAgent: reqCtx.userAgent,
  });

  revalidateRun(ctx.project.id, ctx.run.id);
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────
// Approve stage (CEO → approved, advance to next stage)
// ─────────────────────────────────────────────────────────────────

export async function approveStage(raw: unknown): Promise<ActionResult> {
  const user = await requireRole("ceo");
  const parsed = approveStageSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }
  const input = parsed.data;

  const ctx = await loadRunForMutation(input.stageRunId);
  if (!ctx) return { ok: false, error: "Stage run not found." };

  if (ctx.run.status !== "awaiting_approval") {
    return {
      ok: false,
      error: `Cannot approve from status '${ctx.run.status}'.`,
    };
  }
  if (user.id === ctx.project.designerId) {
    return {
      ok: false,
      error: "You cannot approve your own work. Another CEO must approve.",
    };
  }
  // Decision-gate stages use a separate action with proceed/reopen branches.
  if (ctx.stage.isDecisionGate) {
    return {
      ok: false,
      error: `Stage ${ctx.stage.stageNumber} is a decision gate. Use the decision panel (proceed / reopen).`,
    };
  }

  return await approveAndAdvance({
    user,
    runId: ctx.run.id,
    stage: ctx.stage,
    project: ctx.project,
    typedName: input.typedName,
    note: input.note ?? null,
  });
}

async function approveAndAdvance({
  user,
  runId,
  stage,
  project,
  typedName,
  note,
}: {
  user: AppUser;
  runId: string;
  stage: typeof workflowStages.$inferSelect;
  project: typeof projects.$inferSelect;
  typedName: string;
  note: string | null;
}): Promise<ActionResult> {
  const now = new Date();

  await db
    .update(projectStageRuns)
    .set({
      status: "approved",
      approvedAt: now,
      approvedBy: user.id,
      updatedAt: now,
    })
    .where(eq(projectStageRuns.id, runId));

  await db.insert(approvals).values({
    stageRunId: runId,
    approvedBy: user.id,
    typedName,
    note: note ?? null,
  });

  // Advance: create next stage's run, set project.currentStageId.
  const next = await getNextStage(stage.workflowId, stage.displayOrder);

  let advancedToStageId: string | null = null;
  let nextRunId: string | null = null;

  if (next) {
    const runNumber = await getNextRunNumber(project.id, next.id);
    const [newRun] = await db
      .insert(projectStageRuns)
      .values({
        projectId: project.id,
        stageId: next.id,
        runNumber,
        status: "not_started",
      })
      .returning();
    nextRunId = newRun?.id ?? null;
    advancedToStageId = next.id;

    await db
      .update(projects)
      .set({ currentStageId: next.id, updatedAt: now })
      .where(eq(projects.id, project.id));
  } else {
    // No next stage — project is complete.
    await db
      .update(projects)
      .set({ status: "completed", updatedAt: now })
      .where(eq(projects.id, project.id));
  }

  // Notify the designer (and writer of audit)
  await writeNotification({
    recipientId: project.designerId,
    kind: "approval_granted",
    payload: {
      projectId: project.id,
      projectCode: project.code,
      stageRunId: runId,
      stageNumber: stage.stageNumber,
      stageName: stage.name,
      nextStageRunId: nextRunId,
    },
  });

  const reqCtx = await getRequestContext();
  await writeAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: "approval_granted",
    entityType: "project_stage_runs",
    entityId: runId,
    afterJson: {
      stageNumber: stage.stageNumber,
      stageName: stage.name,
      typedName,
      note,
      advancedToStageId,
    },
    ipAddress: reqCtx.ipAddress,
    userAgent: reqCtx.userAgent,
  });

  revalidateRun(project.id, runId);
  if (nextRunId) revalidateRun(project.id, nextRunId);
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────
// Send back (CEO → in_progress)
// ─────────────────────────────────────────────────────────────────

export async function sendBack(raw: unknown): Promise<ActionResult> {
  const user = await requireRole("ceo");
  const parsed = sendBackSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }
  const input = parsed.data;

  const ctx = await loadRunForMutation(input.stageRunId);
  if (!ctx) return { ok: false, error: "Stage run not found." };

  if (ctx.run.status !== "awaiting_approval") {
    return {
      ok: false,
      error: `Cannot send back from status '${ctx.run.status}'.`,
    };
  }

  // Lock gates: send-back is not the right tool — decision-gate stages have
  // their own proceed/reopen panel. Schematic-lock-style gates use the
  // deeper "re-open" process triggered from later in the workflow.
  if (ctx.stage.isDecisionGate) {
    return {
      ok: false,
      error: `Stage ${ctx.stage.stageNumber} is a decision gate. Use the decision panel (proceed / reopen) instead.`,
    };
  }

  await db
    .update(projectStageRuns)
    .set({
      status: "in_progress",
      submittedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(projectStageRuns.id, ctx.run.id));

  await writeNotification({
    recipientId: ctx.project.designerId,
    kind: "approval_denied",
    payload: {
      projectId: ctx.project.id,
      projectCode: ctx.project.code,
      stageRunId: ctx.run.id,
      stageNumber: ctx.stage.stageNumber,
      stageName: ctx.stage.name,
      note: input.note,
    },
  });

  const reqCtx = await getRequestContext();
  await writeAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: "approval_denied",
    entityType: "project_stage_runs",
    entityId: ctx.run.id,
    afterJson: {
      stageNumber: ctx.stage.stageNumber,
      stageName: ctx.stage.name,
      note: input.note,
    },
    ipAddress: reqCtx.ipAddress,
    userAgent: reqCtx.userAgent,
  });

  revalidateRun(ctx.project.id, ctx.run.id);
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────
// Decide at a gate (CEO → proceed | reopen)
// Works for any stage with isDecisionGate = true. The reopen target
// is read from the stage's reopensToStageNumber column.
// ─────────────────────────────────────────────────────────────────

export async function decideAtGate(raw: unknown): Promise<ActionResult> {
  const user = await requireRole("ceo");
  const parsed = decideAtGateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }
  const input = parsed.data;

  const ctx = await loadRunForMutation(input.stageRunId);
  if (!ctx) return { ok: false, error: "Stage run not found." };

  if (!ctx.stage.isDecisionGate) {
    return {
      ok: false,
      error: `Stage ${ctx.stage.stageNumber} is not a decision gate.`,
    };
  }
  if (ctx.run.status !== "awaiting_approval") {
    return {
      ok: false,
      error: `Cannot decide from status '${ctx.run.status}'.`,
    };
  }
  if (user.id === ctx.project.designerId) {
    return {
      ok: false,
      error: "You cannot approve your own work.",
    };
  }

  const now = new Date();

  // Mark Stage 8 approved with the decision recorded on the run itself.
  await db
    .update(projectStageRuns)
    .set({
      status: "approved",
      approvedAt: now,
      approvedBy: user.id,
      decision: input.decision,
      updatedAt: now,
    })
    .where(eq(projectStageRuns.id, ctx.run.id));

  await db.insert(approvals).values({
    stageRunId: ctx.run.id,
    approvedBy: user.id,
    typedName: input.typedName,
    note:
      input.note ??
      (input.decision === "proceed" ? "Proceed to layout" : "Re-open schematic"),
  });

  if (input.decision === "proceed") {
    // Advance to 9a like a normal approval.
    const next = await getNextStage(ctx.stage.workflowId, ctx.stage.displayOrder);
    let advancedToStageId: string | null = null;
    let nextRunId: string | null = null;
    if (next) {
      const runNumber = await getNextRunNumber(ctx.project.id, next.id);
      const [newRun] = await db
        .insert(projectStageRuns)
        .values({
          projectId: ctx.project.id,
          stageId: next.id,
          runNumber,
          status: "not_started",
        })
        .returning();
      nextRunId = newRun?.id ?? null;
      advancedToStageId = next.id;
      await db
        .update(projects)
        .set({ currentStageId: next.id, updatedAt: now })
        .where(eq(projects.id, ctx.project.id));
    }
    await writeNotification({
      recipientId: ctx.project.designerId,
      kind: "approval_granted",
      payload: {
        projectId: ctx.project.id,
        projectCode: ctx.project.code,
        stageRunId: ctx.run.id,
        stageNumber: ctx.stage.stageNumber,
        stageName: ctx.stage.name,
        decision: "proceed",
        nextStageRunId: nextRunId,
      },
    });

    const reqCtx = await getRequestContext();
    await writeAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "approval_granted",
      entityType: "project_stage_runs",
      entityId: ctx.run.id,
      afterJson: {
        stageNumber: ctx.stage.stageNumber,
        decision: "proceed",
        typedName: input.typedName,
        note: input.note,
        advancedToStageId,
      },
      ipAddress: reqCtx.ipAddress,
      userAgent: reqCtx.userAgent,
    });
  } else {
    // Reopen: create a new run at the stage flagged by reopensToStageNumber,
    // point the project back to it, audit as schematic_reopened.
    const reopenTo = ctx.stage.reopensToStageNumber;
    if (!reopenTo) {
      logger.error("Decision gate missing reopensToStageNumber", {
        stageId: ctx.stage.id,
        stageNumber: ctx.stage.stageNumber,
      });
      return {
        ok: false,
        error:
          "This decision gate has no reopen target configured. Update workflow_stages.reopens_to_stage_number.",
      };
    }
    const reopenStage = await getStageByNumberForWorkflow(
      ctx.stage.workflowId,
      reopenTo
    );
    if (!reopenStage) {
      logger.error("Reopen target stage not found", {
        workflowId: ctx.stage.workflowId,
        reopenTo,
      });
      return {
        ok: false,
        error: `Stage ${reopenTo} not found in this workflow. Cannot re-open.`,
      };
    }
    const runNumber = await getNextRunNumber(ctx.project.id, reopenStage.id);
    const [newRun] = await db
      .insert(projectStageRuns)
      .values({
        projectId: ctx.project.id,
        stageId: reopenStage.id,
        runNumber,
        status: "not_started",
      })
      .returning();
    await db
      .update(projects)
      .set({ currentStageId: reopenStage.id, updatedAt: now })
      .where(eq(projects.id, ctx.project.id));

    await writeNotification({
      recipientId: ctx.project.designerId,
      kind: "approval_granted",
      payload: {
        projectId: ctx.project.id,
        projectCode: ctx.project.code,
        stageRunId: ctx.run.id,
        stageNumber: ctx.stage.stageNumber,
        decision: "reopen",
        reopenStageNumber: reopenTo,
        reopenRunId: newRun?.id ?? null,
        // Back-compat alias for older notification consumers:
        newStage6RunId: newRun?.id ?? null,
      },
    });

    const reqCtx = await getRequestContext();
    await writeAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "schematic_reopened",
      entityType: "project_stage_runs",
      entityId: ctx.run.id,
      afterJson: {
        decisionStageNumber: ctx.stage.stageNumber,
        decisionRunId: ctx.run.id,
        reopenStageNumber: reopenTo,
        reopenRunId: newRun?.id ?? null,
        reopenRunNumber: runNumber,
        typedName: input.typedName,
        note: input.note,
      },
      ipAddress: reqCtx.ipAddress,
      userAgent: reqCtx.userAgent,
    });
  }

  revalidateRun(ctx.project.id, ctx.run.id);
  return { ok: true };
}

// Back-compat alias so any in-flight imports still resolve.
export const decideStage8 = decideAtGate;
