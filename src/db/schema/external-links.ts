import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { externalLinkKindEnum } from "../enums";
import { projectStageRuns } from "./project-stage-runs";
import { users } from "./users";

export const externalLinks = pgTable(
  "external_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stageRunId: uuid("stage_run_id")
      .notNull()
      .references(() => projectStageRuns.id),
    kind: externalLinkKindEnum("kind").notNull(),
    label: text("label").notNull(),
    url: text("url").notNull(),
    addedBy: uuid("added_by")
      .notNull()
      .references(() => users.id),
    addedAt: timestamp("added_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    stageRunIdIdx: index("idx_external_links_stage_run_id").on(
      table.stageRunId
    ),
  })
);
