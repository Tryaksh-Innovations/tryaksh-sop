import {
  pgTable,
  uuid,
  boolean,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { notificationKindEnum } from "../enums";
import { users } from "./users";

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recipientId: uuid("recipient_id")
      .notNull()
      .references(() => users.id),
    kind: notificationKindEnum("kind").notNull(),
    payloadJson: jsonb("payload_json"),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (table) => ({
    recipientIdIdx: index("idx_notifications_recipient_id").on(
      table.recipientId
    ),
    unreadIdx: index("idx_notifications_unread").on(
      table.recipientId,
      table.isRead
    ),
  })
);
