import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  index,
  uniqueIndex,
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
    /**
     * Marks a stage as a decision gate (proceed / reopen branching).
     * When true, the standard approve / send-back path is disabled —
     * use the DecisionGatePanel + decideAtGate server action instead.
     */
    isDecisionGate: boolean("is_decision_gate").notNull().default(false),
    /**
     * For decision gates: the stage_number this stage reopens back to
     * when the CEO chooses "reopen". Null on non-decision stages.
     */
    reopensToStageNumber: text("reopens_to_stage_number"),
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
    // Idempotency guard — keeps `pnpm db:seed` safe to re-run.
    workflowStageUnique: uniqueIndex(
      "workflow_stages_workflow_id_stage_number_unique"
    ).on(table.workflowId, table.stageNumber),
  })
);
