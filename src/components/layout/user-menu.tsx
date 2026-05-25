"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { signOut } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = {
  ceo: "CEO",
  designer: "Designer",
  viewer: "Viewer",
};

const ROLE_TINT: Record<string, string> = {
  ceo: "bg-signal-soft text-signal-ink border-signal-ink/40",
  designer: "bg-blueprint-soft text-blueprint-ink border-blueprint-ink/40",
  viewer: "bg-paper-3 text-ink-3 border-rule-2",
};

export function UserMenu({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

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

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
    });
  }

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 border border-rule-2 bg-paper-2 px-2 py-1.5 transition-colors",
          "hover:bg-paper-3",
          open && "border-ink"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex size-6 items-center justify-center bg-ink font-mono text-[10px] font-medium text-paper">
          {initials || "?"}
        </span>
        <span className="hidden sm:flex sm:flex-col sm:items-start sm:leading-tight">
          <span className="text-[12px] font-medium text-ink">{name}</span>
          <span className="font-mono text-[10px] text-ink-3">{email}</span>
        </span>
        <ChevronDown className="size-3 text-ink-3" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1.5 w-72 border border-ink bg-paper shadow-[4px_4px_0_0_var(--rule)]"
        >
          <div className="border-b border-rule bg-paper-2/60 p-4">
            <div className="mono-caps text-ink-4 mb-2">Signed in as</div>
            <div className="font-display text-[18px] leading-tight text-ink">
              {name}
            </div>
            <div className="mt-0.5 font-mono text-[11px] text-ink-3">
              {email}
            </div>
            <span
              className={cn(
                "mt-3 inline-flex w-fit items-center border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] font-medium",
                ROLE_TINT[role] ?? "border-rule-2 text-ink-3"
              )}
            >
              {ROLE_LABEL[role] ?? role}
            </span>
          </div>
          <div className="p-1">
            <a
              href="/settings"
              className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-ink hover:bg-paper-3 transition-colors"
              onClick={() => setOpen(false)}
            >
              <UserIcon className="size-3.5 text-ink-3" />
              <span>Settings</span>
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={pending}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-ink hover:bg-paper-3 transition-colors disabled:opacity-60"
              role="menuitem"
            >
              <LogOut className="size-3.5 text-ink-3" />
              <span>{pending ? "Signing out…" : "Sign out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
