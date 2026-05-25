"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setProjectStatus } from "@/server/actions/projects";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  Archive,
  AlertCircle,
} from "lucide-react";

type Status = "in_progress" | "on_hold" | "completed" | "archived";

const TRANSITIONS: Record<
  Status,
  Array<{ to: Status; label: string; icon: React.ElementType }>
> = {
  in_progress: [
    { to: "on_hold", label: "Put on hold", icon: PauseCircle },
    { to: "completed", label: "Mark completed", icon: CheckCircle2 },
    { to: "archived", label: "Archive", icon: Archive },
  ],
  on_hold: [
    { to: "in_progress", label: "Resume", icon: PlayCircle },
    { to: "archived", label: "Archive", icon: Archive },
  ],
  completed: [{ to: "archived", label: "Archive", icon: Archive }],
  archived: [],
};

export function ProjectStatusMenu({
  projectId,
  currentStatus,
}: {
  projectId: string;
  currentStatus: Status;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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

  function move(to: Status) {
    const verb =
      to === "archived"
        ? "archive"
        : to === "completed"
          ? "mark completed"
          : to === "on_hold"
            ? "put on hold"
            : "resume";
    const ok = window.confirm(`Are you sure you want to ${verb} this project?`);
    if (!ok) return;
    setError(null);
    setOpen(false);
    startTransition(async () => {
      const result = await setProjectStatus({ projectId, status: to });
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  const actions = TRANSITIONS[currentStatus];
  if (actions.length === 0) {
    return (
      <span className="mono-caps text-ink-3">
        Archived · Read only
      </span>
    );
  }

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
      >
        Status
        <ChevronDown className="size-3" />
      </Button>
      {open && (
        <div className="absolute right-0 mt-1.5 w-56 border border-ink bg-paper shadow-[4px_4px_0_0_var(--rule)] z-20">
          <ul className="py-1">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <li key={a.to}>
                  <button
                    type="button"
                    onClick={() => move(a.to)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-ink hover:bg-paper-3 transition-colors",
                      a.to === "archived" && "text-alert hover:bg-alert-soft"
                    )}
                    disabled={pending}
                  >
                    <Icon className="size-3.5 text-ink-3" />
                    {a.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {error && (
        <div className="absolute right-0 mt-1.5 inline-flex items-center gap-1 mono-caps text-alert-ink">
          <AlertCircle className="size-3" />
          {error}
        </div>
      )}
    </div>
  );
}
