"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateStageNotes } from "@/server/actions/workflow";
import { AlertCircle, Save } from "lucide-react";

interface StageNotesProps {
  stageRunId: string;
  initialNotes: string;
  canEdit: boolean;
}

export function StageNotes({
  stageRunId,
  initialNotes,
  canEdit,
}: StageNotesProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateStageNotes({
        stageRunId,
        notesMarkdown: notes,
      });
      if (result.ok) {
        setSavedAt(Date.now());
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (!canEdit && !notes) {
    return (
      <p className="text-[12px] text-ink-3 leading-snug">
        No notes for this run.
      </p>
    );
  }

  if (!canEdit) {
    return (
      <div className="font-display text-[13px] leading-relaxed text-ink-2 whitespace-pre-wrap">
        {notes}
      </div>
    );
  }

  const justSaved = savedAt && Date.now() - savedAt < 2000;

  return (
    <div className="space-y-2">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Working notes — kept across iterations and visible to the CEO at review."
        className="min-h-24"
      />
      {error && (
        <div className="flex items-start gap-2 border border-alert-ink/40 bg-alert-soft px-2 py-1.5 text-[11px]">
          <AlertCircle className="mt-0.5 size-3 shrink-0 text-alert-ink" />
          <span className="text-ink-2">{error}</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="mono-caps text-seal-ink">
          {justSaved ? "Saved" : ""}
        </span>
        <Button size="sm" variant="outline" onClick={save} disabled={pending}>
          <Save className="size-3" />
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
