/**
 * Audit log writer utility.
 *
 * Every state-changing mutation MUST go through this writer
 * to ensure a tamper-evident, append-only audit trail.
 */

import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { logger } from "./logger";

type AuditAction =
  | "project_created"
  | "stage_started"
  | "checklist_item_toggled"
  | "approval_requested"
  | "approval_granted"
  | "approval_denied"
  | "schematic_reopened"
  | "project_archived"
  | "project_status_changed"
  | "external_link_added"
  | "external_link_removed"
  | "user_created"
  | "user_role_changed";

export interface AuditEntry {
  actorId: string | null;
  actorEmail: string;
  actorRole: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  beforeJson?: unknown;
  afterJson?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Write an audit log entry. This should be called within the same
 * transaction as the mutation it records.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await db.insert(auditLog).values({
      actorId: entry.actorId,
      actorEmail: entry.actorEmail,
      actorRole: entry.actorRole,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      beforeJson: entry.beforeJson ?? null,
      afterJson: entry.afterJson ?? null,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
    });
  } catch (error) {
    // Audit log writes must never silently fail — log the error
    // but don't throw (to avoid breaking the parent transaction).
    logger.error("Failed to write audit log entry", error, {
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
    });
  }
}
