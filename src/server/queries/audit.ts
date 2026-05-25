import { db } from "@/db";
import {
  auditLog,
  projectStageRuns,
  checklistResponses,
  externalLinks,
} from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";

export type AuditRow = typeof auditLog.$inferSelect;

/**
 * Collect every audit_log entry that touches a project's entities. We resolve
 * project_id through related rows because audit_log stores the entity directly.
 */
export async function getAuditLogForProject(
  projectId: string
): Promise<AuditRow[]> {
  // Project-level events
  const projectIds = [projectId];

  // Stage runs for this project
  const runs = await db
    .select({ id: projectStageRuns.id })
    .from(projectStageRuns)
    .where(eq(projectStageRuns.projectId, projectId));
  const runIds = runs.map((r) => r.id);

  // Checklist responses for those runs
  const responses = runIds.length
    ? await db
        .select({ id: checklistResponses.id, item: checklistResponses.checklistItemId })
        .from(checklistResponses)
        .where(inArray(checklistResponses.stageRunId, runIds))
    : [];
  const checklistItemIds = responses.map((r) => r.item);

  // External links for those runs
  const links = runIds.length
    ? await db
        .select({ id: externalLinks.id })
        .from(externalLinks)
        .where(inArray(externalLinks.stageRunId, runIds))
    : [];
  const linkIds = links.map((l) => l.id);

  const allEntityIds = [
    ...projectIds,
    ...runIds,
    ...checklistItemIds,
    ...linkIds,
  ];
  if (allEntityIds.length === 0) return [];

  const rows = await db
    .select()
    .from(auditLog)
    .where(inArray(auditLog.entityId, allEntityIds))
    .orderBy(desc(auditLog.timestamp));

  return rows;
}

export async function getGlobalAuditLog(limit = 500): Promise<AuditRow[]> {
  return db
    .select()
    .from(auditLog)
    .orderBy(desc(auditLog.timestamp))
    .limit(limit);
}



