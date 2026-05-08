import { memo } from "react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";

interface ReplyReferenceProps {
  replyTo: UnifiedMessage["replyTo"];
  isOwn: boolean;
}

export const ReplyReference = memo(
  ({ replyTo, isOwn }: ReplyReferenceProps) => {
    if (!replyTo) return null;
    return (
      <div
        className={cn(
          "mb-1.5 flex min-w-30 max-w-full flex-col gap-0.5 overflow-hidden rounded-xl px-2.5 py-1.5",
          isOwn ? "bg-white/15" : "border-forge-teal border-l-2 bg-muted/50",
        )}
      >
        <div className="truncate font-bold text-forge-teal text-micro uppercase tracking-tighter opacity-90">
          {replyTo.sender?.name}
        </div>
        <p
          className={cn(
            "truncate text-micro leading-tight opacity-90",
            !isOwn && "text-slate-muted",
          )}
        >
          {replyTo.content}
        </p>
      </div>
    );
  },
);
