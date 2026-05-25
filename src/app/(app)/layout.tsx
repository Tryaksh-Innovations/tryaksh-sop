import { AppShell } from "@/components/layout/app-shell";
import type { NotificationItem } from "@/components/layout/notification-bell";
import { requireUser } from "@/server/auth";
import {
  listNotifications,
  getUnreadCount,
} from "@/server/queries/notifications";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  const [rawNotifications, unread] = await Promise.all([
    listNotifications(user.id, 10).catch(() => []),
    getUnreadCount(user.id).catch(() => 0),
  ]);

  const notifications: NotificationItem[] = rawNotifications.map((n) => ({
    id: n.id,
    kind: n.kind as NotificationItem["kind"],
    isRead: n.isRead,
    createdAt: n.createdAt,
    payload: (n.payloadJson as Record<string, unknown> | null) ?? null,
  }));

  return (
    <AppShell
      user={{ name: user.name, email: user.email, role: user.role }}
      notifications={notifications}
      unreadCount={unread}
    >
      {children}
    </AppShell>
  );
}
