import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type QueueTone = "amber" | "muted" | "teal";

interface AttentionQueueMetaProps {
  children: ReactNode;
  className?: string;
  icon: LucideIcon;
  labelClassName?: string;
  tone?: QueueTone;
}

export function AttentionQueueTypeLabel({
  children,
  icon: Icon,
  tone = "muted",
}: AttentionQueueMetaProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-full px-2 font-black text-micro uppercase leading-none",
        tone === "teal" && "bg-forge-teal/8 text-forge-teal",
        tone === "amber" && "bg-spark-amber/10 text-spark-amber",
        tone === "muted" && "bg-muted/70 text-muted-foreground",
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {children}
    </span>
  );
}

export function AttentionQueueMeta({
  children,
  className,
  icon: Icon,
  labelClassName,
  tone = "muted",
}: AttentionQueueMetaProps) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 font-bold text-xs leading-none",
        tone === "teal" && "text-forge-teal",
        tone === "amber" && "text-spark-amber",
        tone === "muted" && "text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className={cn("truncate", labelClassName)}>{children}</span>
    </span>
  );
}
