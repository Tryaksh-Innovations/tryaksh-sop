import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "relative bg-paper-2 text-ink border border-rule",
        "shadow-[0_1px_0_0_var(--rule)]",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1 px-5 pt-5 pb-3 border-b border-rule",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-sans text-[13px] font-semibold leading-none tracking-wide uppercase text-ink",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("font-sans text-xs text-ink-3 leading-snug", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("px-5 py-4", className)} {...props} />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-5 py-4 border-t border-rule", className)}
      {...props}
    />
  );
}

/**
 * Small section marker shown in a card corner — e.g. "§ 02".
 * Decorative; gives the engineering-manual feel.
 */
function CardMark({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("section-mark absolute right-3 top-3", className)}
      {...props}
    >
      {children}
    </span>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardMark,
};
