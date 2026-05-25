import { Monitor } from "lucide-react";

export function MobileGate() {
  return (
    <div className="md:hidden mb-6 flex items-start gap-2 border border-warn-ink/40 bg-warn-soft p-3">
      <Monitor className="mt-0.5 size-3.5 shrink-0 text-warn-ink" />
      <div>
        <div className="mono-caps text-warn-ink">Best on desktop</div>
        <p className="mt-1 text-[12px] text-ink-2">
          Stage checklists and approval panels are tuned for wider screens.
        </p>
      </div>
    </div>
  );
}
