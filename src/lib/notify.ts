/**
 * In-app notification writer. v1 is database-only — a bell icon in the
 * topbar will render the unread count in Phase 5 polish.
 */

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { logger } from "./logger";

type NotificationKind =
  | "approval_needed"
  | "approval_granted"
  | "approval_denied"
  | "stage_completed"
  | "project_assigned";

export interface NotificationEntry {
  recipientId: string;
  kind: NotificationKind;
  payload?: Record<string, unknown>;
}

export async function writeNotification(entry: NotificationEntry): Promise<void> {
  try {
    await db.insert(notifications).values({
      recipientId: entry.recipientId,
      kind: entry.kind,
      payloadJson: entry.payload ?? null,
    });
  } catch (error) {
    logger.error("Failed to write notification", error, {
      recipientId: entry.recipientId,
      kind: entry.kind,
    });
  }
}
