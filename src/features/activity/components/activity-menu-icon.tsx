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
        "flex size-7 shrink-0 items-center justify-center text-muted-foreground",
        tone === "active" && "text-foreground",
        tone === "danger" && "text-destructive",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
