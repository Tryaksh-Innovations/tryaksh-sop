"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteProject } from "@/server/actions/projects";
import { AlertCircle, Trash2 } from "lucide-react";

interface Props {
  projectId: string;
  projectCode: string;
  projectName: string;
}

export function DeleteProjectDialog({
  projectId,
  projectCode,
  projectName,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await deleteProject({ projectId, typedCode: typed });
      if (result.ok) {
        router.push("/projects");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function close() {
    if (pending) return;
    setOpen(false);
    setTyped("");
    setError(null);
  }

  return (
    <>
      {/* Danger zone block */}
      <div className="border border-alert-ink/40 bg-alert-soft/40">
        <div className="border-b border-alert-ink/30 bg-alert-soft px-5 py-2.5">
          <span className="mono-caps text-alert-ink">Danger zone</span>
        </div>
        <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[14px] font-medium text-ink">
              Delete this project
            </div>
            <div className="mt-1 text-[12px] text-ink-2 leading-snug max-w-md">
              Permanently removes the project, all stage runs, checklist
              responses, external links, approvals, and related audit
              entries. A single &quot;hard delete&quot; entry is written to
              the global audit for traceability. <span className="font-semibold">Cannot be undone.</span>
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setOpen(true)}
          >
            <Trash2 className="size-3.5" />
            Delete project
          </Button>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/40 backdrop-blur-sm p-4"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md border border-ink bg-paper shadow-[6px_6px_0_0_var(--rule)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-rule bg-alert-soft px-5 py-3">
              <div className="mono-caps text-alert-ink">
                Confirm hard delete
              </div>
            </div>

            <div className="px-5 py-5 space-y-4">
              <p className="text-[13px] text-ink-2 leading-relaxed">
                You are about to permanently delete{" "}
                <span className="font-mono text-ink">{projectCode}</span> —{" "}
                <span className="font-medium text-ink">{projectName}</span>
                . This action <span className="font-semibold">cannot be undone</span>.
              </p>

              <div className="border-l-2 border-alert pl-3 text-[11px] text-ink-3 leading-snug">
                Every stage run, checklist response, external link, approval,
                and related audit entry will be removed.
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-code">
                  Type{" "}
                  <span className="font-mono text-ink normal-case tracking-normal">
                    {projectCode}
                  </span>{" "}
                  to confirm
                </Label>
                <Input
                  id="confirm-code"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoComplete="off"
                  autoFocus
                  className="font-mono"
                  placeholder={projectCode}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 border border-alert-ink/40 bg-alert-soft p-2.5 text-[12px]">
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-alert-ink" />
                  <span className="text-ink-2">{error}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-rule bg-paper-2/40 px-5 py-3">
              <Button
                type="button"
                variant="ghost"
                onClick={close}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={submit}
                disabled={pending || typed.trim() !== projectCode}
              >
                <Trash2 className="size-3.5" />
                {pending ? "Deleting…" : "Delete forever"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
