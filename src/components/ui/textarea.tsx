import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-none border border-rule-2 bg-paper px-3 py-2",
        "font-sans text-[14px] text-ink",
        "transition-colors",
        "placeholder:text-ink-4",
        "focus:outline-none focus:border-ink",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-alert",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
