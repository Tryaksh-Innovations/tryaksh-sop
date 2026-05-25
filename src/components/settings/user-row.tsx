"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { changeUserRole } from "@/server/actions/users";
import { AlertCircle, Check } from "lucide-react";

interface UserRowProps {
  id: string;
  name: string;
  email: string;
  role: "ceo" | "designer" | "viewer";
  isSelf: boolean;
}

export function UserRoleRow({ id, name, email, role, isSelf }: UserRowProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<"ceo" | "designer" | "viewer">(role);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const dirty = selected !== role;

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await changeUserRole({ userId: id, role: selected });
      if (result.ok) {
        setSavedAt(Date.now());
        router.refresh();
      } else {
        setError(result.error);
        setSelected(role);
      }
    });
  }

  const justSaved = savedAt && Date.now() - savedAt < 2000;

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-3 py-3">
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[14px] font-medium text-ink">{name}</span>
          {isSelf && (
            <span className="mono-caps text-ink-4">(you)</span>
          )}
        </div>
        <div className="font-mono text-[11px] text-ink-3">{email}</div>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={selected}
          onChange={(e) =>
            setSelected(e.target.value as "ceo" | "designer" | "viewer")
          }
          disabled={pending}
          className="h-8 border border-rule-2 bg-paper px-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink focus:outline-none focus:border-ink"
        >
          <option value="ceo">CEO</option>
          <option value="designer">Designer</option>
          <option value="viewer">Viewer</option>
        </select>
        {dirty && (
          <Button size="sm" onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        )}
        {justSaved && !dirty && (
          <span className="inline-flex items-center gap-1 mono-caps text-seal-ink">
            <Check className="size-2.5" />
            saved
          </span>
        )}
        {error && (
          <span className="inline-flex items-center gap-1 mono-caps text-alert-ink">
            <AlertCircle className="size-2.5" />
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
