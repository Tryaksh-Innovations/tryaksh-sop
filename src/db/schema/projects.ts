import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { projectStatusEnum, designClassEnum } from "../enums";
import { workflows } from "./workflows";
import { workflowStages } from "./workflow-stages";
import { users } from "./users";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workflowId: uuid("workflow_id")
      .notNull()
      .references(() => workflows.id),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    designClass: designClassEnum("design_class").notNull(),
    designerId: uuid("designer_id")
      .notNull()
      .references(() => users.id),
    status: projectStatusEnum("status").notNull().default("in_progress"),
    currentStageId: uuid("current_stage_id").references(
      () => workflowStages.id
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => ({
    statusIdx: index("idx_projects_status").on(table.status),
    designerIdIdx: index("idx_projects_designer_id").on(table.designerId),
    workflowIdIdx: index("idx_projects_workflow_id").on(table.workflowId),
  })
);
