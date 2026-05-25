import {
  pgTable,
  uuid,
  boolean,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { projectStageRuns } from "./project-stage-runs";
import { checklistItems } from "./checklist-items";
import { users } from "./users";

export const checklistResponses = pgTable(
  "checklist_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stageRunId: uuid("stage_run_id")
      .notNull()
      .references(() => projectStageRuns.id),
    checklistItemId: uuid("checklist_item_id")
      .notNull()
      .references(() => checklistItems.id),
    checked: boolean("checked").notNull().default(false),
    initials: text("initials"),
    naReason: text("na_reason"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedBy: uuid("updated_by").references(() => users.id),
  },
  (table) => ({
    stageRunIdIdx: index("idx_checklist_responses_stage_run_id").on(
      table.stageRunId
    ),
    uniqueResponseIdx: index("idx_checklist_responses_unique").on(
      table.stageRunId,
      table.checklistItemId
    ),
  })
);
