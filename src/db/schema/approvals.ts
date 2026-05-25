import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { projectStageRuns } from "./project-stage-runs";
import { users } from "./users";

export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  stageRunId: uuid("stage_run_id")
    .notNull()
    .references(() => projectStageRuns.id),
  approvedBy: uuid("approved_by")
    .notNull()
    .references(() => users.id),
  approvedAt: timestamp("approved_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  note: text("note"),
  typedName: text("typed_name").notNull(),
});
