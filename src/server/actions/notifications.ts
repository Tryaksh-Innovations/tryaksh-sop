"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireUser } from "@/server/auth";

export async function markNotificationRead(notificationId: string) {
  const user = await requireUser();
  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.recipientId, user.id)
      )
    );
  revalidatePath("/");
  return { ok: true as const };
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(
        eq(notifications.recipientId, user.id),
        eq(notifications.isRead, false)
      )
    );
  revalidatePath("/");
  return { ok: true as const };
}
