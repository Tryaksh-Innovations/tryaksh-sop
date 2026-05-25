import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none",
    "font-sans text-[12px] font-medium leading-none tracking-wide uppercase",
    "transition-all duration-150 ease-out",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:shrink-0",
    "outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink",
  ].join(" "),
  {
    variants: {
      variant: {
        // primary — solid ink button (the dominant CTA)
        default:
          "bg-ink text-paper hover:bg-ink-2 [&_svg]:opacity-90",
        // signal — the hot orange accent for the most important action on a page
        signal:
          "bg-signal text-paper hover:bg-signal-2 [&_svg]:opacity-90 tracking-[0.08em]",
        // destructive — controlled red
        destructive:
          "bg-alert text-paper hover:opacity-90 [&_svg]:opacity-90",
        // outline — hairline border, ink text
        outline:
          "border border-ink/80 text-ink hover:bg-ink hover:text-paper",
        // secondary — subtle, ink on paper-3
        secondary:
          "bg-paper-3 text-ink hover:bg-paper-4 border border-rule",
        // ghost — invisible until hover
        ghost:
          "text-ink-2 hover:text-ink hover:bg-paper-3",
        // link — no chrome, just underline
        link:
          "text-ink underline-offset-4 hover:underline normal-case tracking-normal",
      },
      size: {
        default: "h-9 px-4 has-[>svg]:px-3.5",
        sm: "h-7 px-3 text-[11px] has-[>svg]:px-2.5",
        lg: "h-11 px-6 text-[13px] has-[>svg]:px-5",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
