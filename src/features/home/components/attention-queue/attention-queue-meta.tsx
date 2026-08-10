import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { StatusPill } from "@/shared/components/ui/status-pill";
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
  className,
  icon: Icon,
  tone = "muted",
}: AttentionQueueMetaProps) {
  return (
    <StatusPill
      icon={Icon}
      size="xs"
      surface="soft"
      textCase="upper"
      tone={tone === "muted" ? "neutral" : tone}
      className={cn("h-5 px-2 font-black text-xs tracking-normal", className)}
    >
      {children}
    </StatusPill>
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
        tone === "teal" && "text-foreground",
        tone === "amber" && "text-brand-amber",
        tone === "muted" && "text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className={cn("truncate", labelClassName)}>{children}</span>
    </span>
  );
}
