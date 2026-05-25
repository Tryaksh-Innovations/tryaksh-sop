import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["ceo", "designer", "viewer"]);

export const projectStatusEnum = pgEnum("project_status", [
  "in_progress",
  "on_hold",
  "completed",
  "archived",
]);

export const designClassEnum = pgEnum("design_class", ["A", "B", "C"]);

export const stageRunStatusEnum = pgEnum("stage_run_status", [
  "not_started",
  "in_progress",
  "awaiting_approval",
  "approved",
  "skipped",
]);

export const stageDecisionEnum = pgEnum("stage_decision", [
  "proceed",
  "reopen",
]);

export const externalLinkKindEnum = pgEnum("external_link_kind", [
  "drive",
  "git",
  "datasheet",
  "image",
  "other",
]);

export const notificationKindEnum = pgEnum("notification_kind", [
  "approval_needed",
  "approval_granted",
  "approval_denied",
  "stage_completed",
  "project_assigned",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "project_created",
  "stage_started",
  "checklist_item_toggled",
  "approval_requested",
  "approval_granted",
  "approval_denied",
  "schematic_reopened",
  "project_archived",
  "project_status_changed",
  "external_link_added",
  "external_link_removed",
  "user_created",
  "user_role_changed",
]);
