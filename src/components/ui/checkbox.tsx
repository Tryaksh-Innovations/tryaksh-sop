"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative size-[14px] shrink-0 rounded-none border border-ink/70 bg-paper transition-all",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-ink data-[state=checked]:text-paper data-[state=checked]:border-ink",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <Check className="size-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
