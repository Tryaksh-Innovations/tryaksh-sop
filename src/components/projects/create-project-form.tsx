"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProject } from "@/server/actions/projects";
import { AlertCircle } from "lucide-react";

interface DesignerOption {
  id: string;
  name: string;
  email: string;
}

interface FieldErrors {
  code?: string;
  name?: string;
  designClass?: string;
  designerId?: string;
}

export function CreateProjectForm({
  designers,
}: {
  designers: DesignerOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [designClass, setDesignClass] = useState<"A" | "B" | "C" | "">("");
  const [designerId, setDesignerId] = useState(designers[0]?.id ?? "");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await createProject({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        designClass: designClass || undefined,
        designerId,
      });

      if (result.ok) {
        router.push(`/projects/${result.projectId}`);
      } else {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  if (designers.length === 0) {
    return (
      <div className="border border-alert-ink/40 bg-alert-soft p-4">
        <div className="mono-caps text-alert-ink">No designers available</div>
        <p className="mt-2 text-[12px] text-ink-2 leading-snug">
          Promote at least one user from the Settings page, or seed users via
          the database before opening a project.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="code">Project code</Label>
        <Input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="DRTG-MAIN-V2"
          required
          aria-invalid={!!fieldErrors.code || undefined}
          autoComplete="off"
          className="font-mono text-[16px]"
        />
        <p className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.12em]">
          Uppercase letters, digits, hyphens · Used in filenames and Git tags
        </p>
        {fieldErrors.code && (
          <p className="text-[11px] text-alert-ink">{fieldErrors.code}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Project name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="DRTG main board, revision 2"
          required
          aria-invalid={!!fieldErrors.name || undefined}
          className="font-display text-[18px]"
        />
        {fieldErrors.name && (
          <p className="text-[11px] text-alert-ink">{fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="designClass">Design class</Label>
        <select
          id="designClass"
          value={designClass}
          onChange={(e) =>
            setDesignClass(e.target.value as "A" | "B" | "C" | "")
          }
          required
          aria-invalid={!!fieldErrors.designClass || undefined}
          className="flex h-9 w-full rounded-none border-0 border-b border-rule-2 bg-transparent px-0 font-sans text-[14px] text-ink focus:outline-none focus:border-ink"
        >
          <option value="" disabled>
            Pick a class…
          </option>
          <option value="A">A — instrument-critical (all 4 gates)</option>
          <option value="B">B — supporting hardware (3 gates)</option>
          <option value="C">C — internal tools/fixtures (DFM only)</option>
        </select>
        <p className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.12em]">
          Engineering Standards §3 · When in doubt, classify higher
        </p>
        {fieldErrors.designClass && (
          <p className="text-[11px] text-alert-ink">{fieldErrors.designClass}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="designer">Designer</Label>
        <select
          id="designer"
          value={designerId}
          onChange={(e) => setDesignerId(e.target.value)}
          required
          aria-invalid={!!fieldErrors.designerId || undefined}
          className="flex h-9 w-full rounded-none border-0 border-b border-rule-2 bg-transparent px-0 font-sans text-[14px] text-ink focus:outline-none focus:border-ink"
        >
          {designers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.email})
            </option>
          ))}
        </select>
        {fieldErrors.designerId && (
          <p className="text-[11px] text-alert-ink">{fieldErrors.designerId}</p>
        )}
      </div>

      {formError && (
        <div className="flex items-start gap-2 border border-alert-ink/40 bg-alert-soft p-3">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-alert-ink" />
          <span className="text-[12px] text-ink-2">{formError}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-rule">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button type="submit" variant="signal" disabled={pending}>
          {pending ? "Issuing…" : "Issue project"}
        </Button>
      </div>
    </form>
  );
}
