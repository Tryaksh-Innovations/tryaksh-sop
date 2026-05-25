import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { workflows } from "./workflows";

export const workflowStages = pgTable(
  "workflow_stages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workflowId: uuid("workflow_id")
      .notNull()
      .references(() => workflows.id),
    stageNumber: text("stage_number").notNull(),
    name: text("name").notNull(),
    subtitle: text("subtitle"),
    descriptionMarkdown: text("description_markdown"),
    requiresApproval: boolean("requires_approval").notNull().default(false),
    isLockGate: boolean("is_lock_gate").notNull().default(false),
    displayOrder: integer("display_order").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    workflowIdIdx: index("idx_workflow_stages_workflow_id").on(
      table.workflowId
    ),
    displayOrderIdx: index("idx_workflow_stages_display_order").on(
      table.workflowId,
      table.displayOrder
    ),
  })
);
