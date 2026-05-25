"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/server/actions/notifications";

export interface NotificationItem {
  id: string;
  kind:
    | "approval_needed"
    | "approval_granted"
    | "approval_denied"
    | "stage_completed"
    | "project_assigned";
  isRead: boolean;
  createdAt: Date | string;
  payload: Record<string, unknown> | null;
}

const KIND_VERB: Record<NotificationItem["kind"], string> = {
  approval_needed: "Approval needed",
  approval_granted: "Approved",
  approval_denied: "Sent back",
  stage_completed: "Stage completed",
  project_assigned: "Project assigned",
};

const KIND_TINT: Record<NotificationItem["kind"], string> = {
  approval_needed: "border-warn-ink/40 bg-warn-soft text-warn-ink",
  approval_granted: "border-seal-ink/40 bg-seal-soft text-seal-ink",
  approval_denied: "border-alert-ink/40 bg-alert-soft text-alert-ink",
  stage_completed: "border-blueprint-ink/40 bg-blueprint-soft text-blueprint-ink",
  project_assigned: "border-rule-2 bg-paper-3 text-ink-3",
};

function buildHref(n: NotificationItem): string {
  const p = n.payload ?? {};
  const projectId = p.projectId as string | undefined;
  const stageRunId = p.stageRunId as string | undefined;
  const newStage6RunId = p.newStage6RunId as string | undefined;
  if (projectId && newStage6RunId) {
    return `/projects/${projectId}/stages/${newStage6RunId}`;
  }
  if (projectId && stageRunId) {
    return `/projects/${projectId}/stages/${stageRunId}`;
  }
  if (projectId) return `/projects/${projectId}`;
  return "/";
}

function buildSummary(n: NotificationItem): string {
  const p = (n.payload ?? {}) as Record<string, unknown>;
  const code = (p.projectCode as string) ?? "?";
  const stageNumber = p.stageNumber as string | undefined;
  const stageName = p.stageName as string | undefined;
  const decision = p.decision as string | undefined;
  const note = p.note as string | undefined;

  if (n.kind === "approval_needed") {
    return `${code} — Stage ${stageNumber} (${stageName}) ready to review`;
  }
  if (n.kind === "approval_granted") {
    if (decision === "reopen") {
      return `${code} — Stage 8 reopened; new Stage 6 run created`;
    }
    return `${code} — Stage ${stageNumber} (${stageName}) approved`;
  }
  if (n.kind === "approval_denied") {
    return `${code} — Stage ${stageNumber} sent back${note ? `: ${note}` : ""}`;
  }
  return `${code} — ${KIND_VERB[n.kind]}`;
}

function timeAgo(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function NotificationBell({
  initialUnread,
  initialNotifications,
}: {
  initialUnread: number;
  initialNotifications: NotificationItem[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialNotifications);
  const [unread, setUnread] = useState(initialUnread);
  const ref = useRef<HTMLDivElement>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleItemClick(item: NotificationItem) {
    setOpen(false);
    if (!item.isRead) {
      startTransition(async () => {
        await markNotificationRead(item.id);
        setItems((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
        setUnread((u) => Math.max(0, u - 1));
        router.refresh();
      });
    }
  }

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
      router.refresh();
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative size-9 grid place-items-center border border-rule-2 bg-paper-2 text-ink-2 transition-colors",
          "hover:text-ink hover:bg-paper-3",
          open && "border-ink text-ink"
        )}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        aria-expanded={open}
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-signal px-1 font-mono text-[9px] font-semibold text-paper">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1.5 w-[360px] border border-ink bg-paper shadow-[4px_4px_0_0_var(--rule)]"
        >
          <div className="flex items-center justify-between border-b border-rule bg-paper-2/60 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="font-display text-[14px] text-ink">Notifications</span>
              {unread > 0 && (
                <span className="font-mono text-[10px] text-ink-3">
                  {unread} unread
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={pending || unread === 0}
              className="inline-flex items-center gap-1 mono-caps text-ink-3 hover:text-ink disabled:opacity-40"
            >
              <CheckCheck className="size-3" />
              Mark all read
            </button>
          </div>
          <div className="max-h-[440px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mono-caps text-ink-4">Nothing yet</div>
                <div className="mt-1 text-[12px] text-ink-3">
                  Activity will appear here.
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-rule">
                {items.map((item) => (
                  <li key={item.id} className="relative">
                    {!item.isRead && (
                      <span
                        className="absolute left-0 top-0 bottom-0 w-0.5 bg-signal"
                        aria-hidden
                      />
                    )}
                    <Link
                      href={buildHref(item)}
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        "block px-4 py-3 hover:bg-paper-3 transition-colors",
                        !item.isRead && "bg-paper-2"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] font-medium",
                            KIND_TINT[item.kind]
                          )}
                        >
                          {KIND_VERB[item.kind]}
                        </span>
                      </div>
                      <div className="mt-1.5 text-[13px] text-ink leading-snug">
                        {buildSummary(item)}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-ink-3">
                        {timeAgo(item.createdAt)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
