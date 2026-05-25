import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { workflowStages } from "./workflow-stages";

export const checklistItems = pgTable(
  "checklist_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stageId: uuid("stage_id")
      .notNull()
      .references(() => workflowStages.id),
    sectionHeading: text("section_heading"),
    label: text("label").notNull(),
    criterion: text("criterion").notNull(),
    displayOrder: integer("display_order").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    stageIdIdx: index("idx_checklist_items_stage_id").on(table.stageId),
  })
);
