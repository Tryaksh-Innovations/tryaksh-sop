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
import { and, asc, desc, eq, sql } from "drizzle-orm";

export type StageRunDetail = NonNullable<
  Awaited<ReturnType<typeof getStageRunDetail>>
>;

export async function getStageRunDetail(stageRunId: string) {
  const [row] = await db
    .select({
      run: projectStageRuns,
      stage: workflowStages,
      project: projects,
      designer: users,
    })
    .from(projectStageRuns)
    .innerJoin(workflowStages, eq(workflowStages.id, projectStageRuns.stageId))
    .innerJoin(projects, eq(projects.id, projectStageRuns.projectId))
    .innerJoin(users, eq(users.id, projects.designerId))
    .where(eq(projectStageRuns.id, stageRunId))
    .limit(1);

  if (!row) return null;

  const items = await db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.stageId, row.stage.id))
    .orderBy(asc(checklistItems.displayOrder));

  const responses = await db
    .select()
    .from(checklistResponses)
    .where(eq(checklistResponses.stageRunId, row.run.id));

  const responseById = new Map(
    responses.map((r) => [r.checklistItemId, r] as const)
  );

  const links = await db
    .select({
      link: externalLinks,
      addedByName: users.name,
      addedByEmail: users.email,
    })
    .from(externalLinks)
    .innerJoin(users, eq(users.id, externalLinks.addedBy))
    .where(eq(externalLinks.stageRunId, row.run.id))
    .orderBy(desc(externalLinks.addedAt));

  const [approval] = await db
    .select({
      approval: approvals,
      approverName: users.name,
      approverEmail: users.email,
    })
    .from(approvals)
    .innerJoin(users, eq(users.id, approvals.approvedBy))
    .where(eq(approvals.stageRunId, row.run.id))
    .orderBy(desc(approvals.approvedAt))
    .limit(1);

  return {
    run: row.run,
    stage: row.stage,
    project: row.project,
    designer: row.designer,
    items,
    responses,
    responseByItemId: responseById,
    links,
    approval: approval ?? null,
  };
}

export async function listAwaitingApprovalForCeo() {
  const rows = await db
    .select({
      runId: projectStageRuns.id,
      projectId: projects.id,
      projectCode: projects.code,
      projectName: projects.name,
      stageNumber: workflowStages.stageNumber,
      stageName: workflowStages.name,
      isLockGate: workflowStages.isLockGate,
      designerName: users.name,
      designerEmail: users.email,
      submittedAt: projectStageRuns.submittedAt,
    })
    .from(projectStageRuns)
    .innerJoin(projects, eq(projects.id, projectStageRuns.projectId))
    .innerJoin(workflowStages, eq(workflowStages.id, projectStageRuns.stageId))
    .innerJoin(users, eq(users.id, projects.designerId))
    .where(eq(projectStageRuns.status, "awaiting_approval"))
    .orderBy(asc(projectStageRuns.submittedAt));

  return rows;
}

/**
 * Find the next stage to advance to after the given stage is approved,
 * following displayOrder. Returns null if this is the last stage.
 */
export async function getNextStage(
  workflowId: string,
  currentDisplayOrder: number
) {
  const [next] = await db
    .select()
    .from(workflowStages)
    .where(
      and(
        eq(workflowStages.workflowId, workflowId),
        sql`${workflowStages.displayOrder} > ${currentDisplayOrder}`
      )
    )
    .orderBy(asc(workflowStages.displayOrder))
    .limit(1);
  return next ?? null;
}

/**
 * Find the latest runNumber for a (project, stage) pair, used when
 * creating a new run for an iteration or reopen.
 */
export async function getNextRunNumber(
  projectId: string,
  stageId: string
): Promise<number> {
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${projectStageRuns.runNumber}), 0)` })
    .from(projectStageRuns)
    .where(
      and(
        eq(projectStageRuns.projectId, projectId),
        eq(projectStageRuns.stageId, stageId)
      )
    );
  return (row?.max ?? 0) + 1;
}

export async function getStageByNumberForWorkflow(
  workflowId: string,
  stageNumber: string
) {
  const [stage] = await db
    .select()
    .from(workflowStages)
    .where(
      and(
        eq(workflowStages.workflowId, workflowId),
        eq(workflowStages.stageNumber, stageNumber)
      )
    )
    .limit(1);
  return stage ?? null;
}
