import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-none border-0 border-b border-rule-2 bg-transparent",
        "px-0 py-1.5 font-sans text-[14px] text-ink",
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

export { Input };
