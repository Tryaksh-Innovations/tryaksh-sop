import Image from "next/image";

interface LoadingScreenProps {
  /** Short label shown beneath the logo. Defaults to a generic one. */
  label?: string;
  /** Document ID line shown above the logo. */
  docId?: string;
  /** When true the component fills the viewport. */
  fullscreen?: boolean;
}

/**
 * Branded loading state — a breathing Tryaksh mark with corner crosshairs
 * and a scan-line progress bar. Matches the controlled-document aesthetic.
 */
export function LoadingScreen({
  label = "Polling document",
  docId = "TRYAKSH-SOP-PCB-001 · v2.0",
  fullscreen = false,
}: LoadingScreenProps) {
  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 grid place-items-center bg-paper"
          : "grid place-items-center py-24 min-h-[420px]"
      }
    >
      <div className="relative flex flex-col items-center gap-8 px-8">
        {/* doc id */}
        <div className="mono-caps text-ink-3 tabular">{docId}</div>

        {/* logo with corner crosshairs */}
        <div className="relative">
          <CornerMark className="-top-3 -left-3" />
          <CornerMark className="-top-3 -right-3" />
          <CornerMark className="-bottom-3 -left-3" />
          <CornerMark className="-bottom-3 -right-3" />
          <Image
            src="/tryaksh-logo.png"
            alt="Tryaksh"
            width={1024}
            height={768}
            priority
            className="h-16 md:h-20 w-auto anim-breathe select-none dark:invert"
          />
        </div>

        {/* scan-line progress bar */}
        <div className="relative w-44 h-px bg-rule overflow-hidden">
          <div className="absolute inset-y-0 w-1/2 bg-ink anim-scan" />
        </div>

        {/* label */}
        <div className="flex items-center gap-2">
          <span className="size-1.5 bg-signal rounded-full anim-blink" />
          <span className="mono-caps text-ink-2">{label}</span>
        </div>
      </div>
    </div>
  );
}

function CornerMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={`absolute size-2 ${className ?? ""}`}>
      <span className="absolute inset-x-0 top-0 h-px bg-ink-3" />
      <span className="absolute inset-y-0 left-0 w-px bg-ink-3" />
    </span>
  );
}

/**
 * Compact inline variant — for areas inside the app shell. Uses the same
 * breathing logo treatment but at a smaller scale.
 */
export function LoadingInline({
  label = "Loading",
}: {
  label?: string;
}) {
  return (
    <div className="grid place-items-center py-16">
      <div className="flex flex-col items-center gap-5">
        <Image
          src="/tryaksh-logo.png"
          alt="Tryaksh"
          width={1024}
          height={768}
          className="h-10 w-auto anim-breathe select-none dark:invert"
        />
        <div className="relative w-28 h-px bg-rule overflow-hidden">
          <div className="absolute inset-y-0 w-1/2 bg-ink anim-scan" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-1 bg-signal rounded-full anim-blink" />
          <span className="mono-caps text-ink-3">{label}</span>
        </div>
      </div>
    </div>
  );
}
