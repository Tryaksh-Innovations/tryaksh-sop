import { db } from "@/db";
import { workflows, workflowStages, checklistItems } from "@/db/schema";
import { and, eq, asc } from "drizzle-orm";

/** All active workflows, ordered alphabetically by slug. */
export async function listActiveWorkflows() {
  return db
    .select()
    .from(workflows)
    .where(eq(workflows.isActive, true))
    .orderBy(asc(workflows.slug));
}

export async function getWorkflowBySlug(slug: string) {
  const [wf] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.slug, slug))
    .limit(1);
  return wf ?? null;
}

/** @deprecated Use getWorkflowBySlug('pcb') instead. */
export async function getPcbWorkflow() {
  return getWorkflowBySlug("pcb");
}

export async function getStagesForWorkflow(workflowId: string) {
  return db
    .select()
    .from(workflowStages)
    .where(eq(workflowStages.workflowId, workflowId))
    .orderBy(asc(workflowStages.displayOrder));
}

export async function getStageByNumber(
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

export async function getChecklistItemsForStage(stageId: string) {
  return db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.stageId, stageId))
    .orderBy(asc(checklistItems.displayOrder));
}
