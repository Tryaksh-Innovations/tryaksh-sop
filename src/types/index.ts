/**
 * Shared TypeScript types — inferred from Drizzle schema.
 */

import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  users,
  workflows,
  workflowStages,
  checklistItems,
  projects,
  projectStageRuns,
  checklistResponses,
  approvals,
  auditLog,
  externalLinks,
  notifications,
} from "@/db/schema";

// ── Select types (reading from DB) ──────────────────────────────
export type User = InferSelectModel<typeof users>;
export type Workflow = InferSelectModel<typeof workflows>;
export type WorkflowStage = InferSelectModel<typeof workflowStages>;
export type ChecklistItem = InferSelectModel<typeof checklistItems>;
export type Project = InferSelectModel<typeof projects>;
export type ProjectStageRun = InferSelectModel<typeof projectStageRuns>;
export type ChecklistResponse = InferSelectModel<typeof checklistResponses>;
export type Approval = InferSelectModel<typeof approvals>;
export type AuditLogEntry = InferSelectModel<typeof auditLog>;
export type ExternalLink = InferSelectModel<typeof externalLinks>;
export type Notification = InferSelectModel<typeof notifications>;

// ── Insert types (writing to DB) ────────────────────────────────
export type NewUser = InferInsertModel<typeof users>;
export type NewProject = InferInsertModel<typeof projects>;
export type NewProjectStageRun = InferInsertModel<typeof projectStageRuns>;
export type NewChecklistResponse = InferInsertModel<typeof checklistResponses>;
export type NewApproval = InferInsertModel<typeof approvals>;
export type NewAuditLogEntry = InferInsertModel<typeof auditLog>;
export type NewExternalLink = InferInsertModel<typeof externalLinks>;
export type NewNotification = InferInsertModel<typeof notifications>;

// ── Role type ───────────────────────────────────────────────────
export type UserRole = "ceo" | "designer" | "viewer";

// ── Project status type ─────────────────────────────────────────
export type ProjectStatus = "in_progress" | "on_hold" | "completed" | "archived";

// ── Stage run status type ───────────────────────────────────────
export type StageRunStatus =
  | "not_started"
  | "in_progress"
  | "awaiting_approval"
  | "approved"
  | "skipped";

// ── Design class type ───────────────────────────────────────────
export type DesignClass = "A" | "B" | "C";
