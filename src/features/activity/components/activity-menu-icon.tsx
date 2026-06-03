import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type ActivityMenuIconTone = "active" | "danger" | "default";

interface ActivityMenuIconProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: ActivityMenuIconTone;
}

export function ActivityMenuIcon({
  "aria-hidden": ariaHidden = true,
  children,
  className,
  tone = "default",
  ...props
}: ActivityMenuIconProps) {
  return (
    <span
      aria-hidden={ariaHidden}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-sm border border-border/40 bg-background/65 text-muted-foreground",
        tone === "active" &&
          "border-forge-teal/20 bg-forge-teal/8 text-forge-teal",
        tone === "danger" &&
          "border-destructive/20 bg-destructive/8 text-destructive",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
