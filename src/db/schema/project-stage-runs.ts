import {
  pgTable,
  uuid,
  integer,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { stageRunStatusEnum, stageDecisionEnum } from "../enums";
import { projects } from "./projects";
import { workflowStages } from "./workflow-stages";
import { users } from "./users";

export const projectStageRuns = pgTable(
  "project_stage_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    stageId: uuid("stage_id")
      .notNull()
      .references(() => workflowStages.id),
    runNumber: integer("run_number").notNull().default(1),
    status: stageRunStatusEnum("status").notNull().default("not_started"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: uuid("approved_by").references(() => users.id),
    notesMarkdown: text("notes_markdown"),
    decision: stageDecisionEnum("decision"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    projectIdIdx: index("idx_stage_runs_project_id").on(table.projectId),
    stageIdIdx: index("idx_stage_runs_stage_id").on(table.stageId),
    statusIdx: index("idx_stage_runs_status").on(table.status),
  })
);
