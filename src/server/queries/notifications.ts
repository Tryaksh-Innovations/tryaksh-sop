import { db } from "@/db";
import { notifications } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export type NotificationRow = typeof notifications.$inferSelect;

export async function listNotifications(
  recipientId: string,
  limit = 25
): Promise<NotificationRow[]> {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.recipientId, recipientId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadCount(recipientId: string): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)` })
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientId, recipientId),
        eq(notifications.isRead, false)
      )
    );
  return Number(row?.n ?? 0);
}
