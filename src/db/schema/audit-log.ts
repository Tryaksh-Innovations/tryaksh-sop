import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { auditActionEnum } from "../enums";

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id"),
    actorEmail: text("actor_email").notNull(),
    actorRole: text("actor_role").notNull(),
    action: auditActionEnum("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    beforeJson: jsonb("before_json"),
    afterJson: jsonb("after_json"),
    timestamp: timestamp("timestamp", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
  },
  (table) => ({
    timestampIdx: index("idx_audit_log_timestamp").on(table.timestamp),
    entityIdx: index("idx_audit_log_entity").on(
      table.entityType,
      table.entityId
    ),
    actorIdIdx: index("idx_audit_log_actor_id").on(table.actorId),
  })
);
