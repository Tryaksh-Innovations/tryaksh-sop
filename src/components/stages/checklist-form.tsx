"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { upsertChecklistResponse } from "@/server/actions/workflow";
import { cn } from "@/lib/utils";
import { AlertCircle, MinusCircle, Loader2, Check } from "lucide-react";

interface ChecklistItemRow {
  id: string;
  sectionHeading: string | null;
  label: string;
  criterion: string;
  displayOrder: number;
}

interface ResponseRow {
  checklistItemId: string;
  checked: boolean;
  initials: string | null;
  naReason: string | null;
}

interface ChecklistFormProps {
  stageRunId: string;
  items: ChecklistItemRow[];
  responses: ResponseRow[];
  canEdit: boolean;
  lockedReason?: string;
}

type State = "unchecked" | "checked" | "na";

interface ItemUiState {
  state: State;
  initials: string;
  naReason: string;
  saving: boolean;
  error: string | null;
  savedAt: number | null;
}

function initialUiState(resp: ResponseRow | undefined): ItemUiState {
  if (!resp) {
    return {
      state: "unchecked",
      initials: "",
      naReason: "",
      saving: false,
      error: null,
      savedAt: null,
    };
  }
  let state: State = "unchecked";
  if (resp.checked) state = "checked";
  else if (resp.naReason) state = "na";
  return {
    state,
    initials: resp.initials ?? "",
    naReason: resp.naReason ?? "",
    saving: false,
    error: null,
    savedAt: null,
  };
}

function groupItems(items: ChecklistItemRow[]) {
  const groups: { heading: string | null; items: ChecklistItemRow[] }[] = [];
  let cur: { heading: string | null; items: ChecklistItemRow[] } | null = null;
  for (const it of items) {
    if (it.sectionHeading || !cur) {
      cur = { heading: it.sectionHeading ?? null, items: [] };
      groups.push(cur);
    }
    cur.items.push(it);
  }
  return groups;
}

export function ChecklistForm({
  stageRunId,
  items,
  responses,
  canEdit,
  lockedReason,
}: ChecklistFormProps) {
  const byId = new Map(responses.map((r) => [r.checklistItemId, r]));
  const [uiByItem, setUiByItem] = useState<Record<string, ItemUiState>>(() => {
    const init: Record<string, ItemUiState> = {};
    for (const item of items) init[item.id] = initialUiState(byId.get(item.id));
    return init;
  });
  const [pending, startTransition] = useTransition();

  function update(itemId: string, patch: Partial<ItemUiState>) {
    setUiByItem((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...patch } }));
  }

  function save(itemId: string) {
    const ui = uiByItem[itemId];
    update(itemId, { saving: true, error: null });
    startTransition(async () => {
      const result = await upsertChecklistResponse({
        stageRunId,
        checklistItemId: itemId,
        state: ui.state,
        initials: ui.state === "checked" ? ui.initials : null,
        naReason: ui.state === "na" ? ui.naReason : null,
      });
      if (result.ok) {
        update(itemId, {
          saving: false,
          error: null,
          savedAt: Date.now(),
        });
      } else {
        update(itemId, { saving: false, error: result.error });
      }
    });
  }

  function setState(itemId: string, newState: State) {
    update(itemId, { state: newState });
    if (newState === "unchecked") {
      setTimeout(() => save(itemId), 0);
    }
  }

  const groups = groupItems(items);

  const totalRequired = items.length;
  const completed = items.filter((it) => {
    const ui = uiByItem[it.id];
    return (
      (ui.state === "checked" && ui.initials.trim()) ||
      (ui.state === "na" && ui.naReason.trim())
    );
  }).length;

  let itemCounter = 0;

  return (
    <div className="space-y-6">
      {lockedReason && (
        <div className="flex items-start gap-2.5 border border-warn-ink/40 bg-warn-soft px-3 py-2.5">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-warn-ink" />
          <span className="text-[12px] text-ink-2">{lockedReason}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-rule pb-2">
        <div className="flex items-baseline gap-2 font-mono">
          <span className="tabular text-[18px] text-ink">
            {String(completed).padStart(2, "0")}
          </span>
          <span className="text-[11px] text-ink-3">
            / {String(totalRequired).padStart(2, "0")} complete
          </span>
        </div>
        {pending && (
          <span className="inline-flex items-center gap-1.5 mono-caps text-ink-3">
            <Loader2 className="size-3 animate-spin" />
            Saving
          </span>
        )}
      </div>

      {groups.map((g, gIdx) => (
        <div key={gIdx} className="space-y-3">
          {g.heading && (
            <div className="flex items-center gap-3 pt-2">
              <span className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.14em]">
                {g.heading}
              </span>
              <div className="flex-1 h-px bg-rule" />
            </div>
          )}
          <ol className="space-y-2">
            {g.items.map((item) => {
              itemCounter++;
              const ui = uiByItem[item.id];
              const justSaved =
                ui.savedAt && Date.now() - ui.savedAt < 1500 ? true : false;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "relative grid grid-cols-[auto_minmax(0,1fr)] gap-3 border p-3 transition-colors",
                    ui.state === "checked" &&
                      "border-seal-ink/30 bg-seal-soft/60",
                    ui.state === "na" && "border-warn-ink/30 bg-warn-soft/60",
                    ui.state === "unchecked" &&
                      "border-rule bg-paper-2"
                  )}
                >
                  {/* Left: item number + state shape */}
                  <div className="flex flex-col items-center gap-2 pt-0.5">
                    <span className="font-mono text-[10px] text-ink-3 tabular">
                      {String(itemCounter).padStart(2, "0")}
                    </span>
                    <Checkbox
                      checked={ui.state === "checked"}
                      disabled={!canEdit}
                      onCheckedChange={(v) =>
                        setState(item.id, v ? "checked" : "unchecked")
                      }
                    />
                  </div>

                  {/* Right: content */}
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[14px] font-medium text-ink leading-snug">
                          {item.label}
                        </div>
                        <div className="mt-1 text-[12px] text-ink-2 leading-snug">
                          {item.criterion}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {ui.state === "checked" && (
                          <span className="inline-flex items-center gap-1 border border-seal-ink/40 bg-paper px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-seal-ink">
                            <Check className="size-2.5" />
                            Done
                          </span>
                        )}
                        {ui.state === "na" && (
                          <span className="inline-flex items-center border border-warn-ink/40 bg-paper px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-warn-ink">
                            N/A
                          </span>
                        )}
                      </div>
                    </div>

                    {ui.state === "checked" && (
                      <div className="flex items-end gap-3">
                        <div className="flex-1 max-w-[200px]">
                          <label className="mono-caps text-ink-3 block mb-1">
                            Initials
                          </label>
                          <Input
                            value={ui.initials}
                            onChange={(e) =>
                              update(item.id, {
                                initials: e.target.value.toUpperCase(),
                              })
                            }
                            onBlur={() => save(item.id)}
                            disabled={!canEdit}
                            placeholder="ABC"
                            className="h-8 font-mono"
                            maxLength={8}
                          />
                        </div>
                        {justSaved && (
                          <span className="pb-2 mono-caps text-seal-ink">
                            saved
                          </span>
                        )}
                      </div>
                    )}

                    {ui.state === "na" && (
                      <div className="space-y-1">
                        <label className="mono-caps text-ink-3 block">
                          N/A reason · required
                        </label>
                        <Textarea
                          value={ui.naReason}
                          onChange={(e) =>
                            update(item.id, { naReason: e.target.value })
                          }
                          onBlur={() => save(item.id)}
                          disabled={!canEdit}
                          placeholder="Why this item does not apply…"
                          className="min-h-12 text-[12px]"
                        />
                        {justSaved && (
                          <span className="mono-caps text-seal-ink">
                            saved
                          </span>
                        )}
                      </div>
                    )}

                    {ui.error && (
                      <div className="border border-alert-ink/40 bg-alert-soft px-2 py-1 text-[11px] text-alert-ink">
                        {ui.error}
                      </div>
                    )}

                    {canEdit && (
                      <div className="flex items-center gap-1 pt-1">
                        {ui.state !== "na" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 normal-case text-[11px] tracking-normal"
                            onClick={() => setState(item.id, "na")}
                          >
                            <MinusCircle className="size-3" />
                            Mark N/A
                          </Button>
                        )}
                        {ui.state === "na" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 normal-case text-[11px] tracking-normal"
                            onClick={() => setState(item.id, "unchecked")}
                          >
                            Clear N/A
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
