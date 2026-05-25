import { db } from "@/db";
import { workflows, workflowStages, checklistItems } from "@/db/schema";
import { and, eq, asc } from "drizzle-orm";

export async function getPcbWorkflow() {
  const [wf] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.slug, "pcb"))
    .limit(1);
  return wf ?? null;
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
