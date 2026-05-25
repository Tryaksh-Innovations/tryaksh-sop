import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center gap-1 px-1.5 py-0.5 w-fit whitespace-nowrap shrink-0",
    "font-mono text-[10px] font-medium leading-none tracking-[0.12em] uppercase",
    "border [&>svg]:size-2.5 [&>svg]:pointer-events-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-ink bg-ink text-paper",
        secondary:
          "border-rule-2 bg-paper-3 text-ink-2",
        outline:
          "border-rule-2 bg-transparent text-ink-2",
        seal:
          "border-seal-ink/40 bg-seal-soft text-seal-ink",
        blueprint:
          "border-blueprint-ink/40 bg-blueprint-soft text-blueprint-ink",
        warn:
          "border-warn-ink/40 bg-warn-soft text-warn-ink",
        alert:
          "border-alert-ink/40 bg-alert-soft text-alert-ink",
        signal:
          "border-signal-ink/40 bg-signal-soft text-signal-ink",
        destructive:
          "border-alert bg-alert text-paper",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
