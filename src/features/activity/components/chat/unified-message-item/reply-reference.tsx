import { cn } from "@/shared/lib/utils";
import { memo } from "react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

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
          "mb-1.5 px-2.5 py-1.5 rounded-xl flex flex-col gap-0.5 min-w-30 max-w-full overflow-hidden",
          isOwn ? "bg-white/15" : "bg-muted/50 border-l-2 border-forge-teal",
        )}
      >
        <div className="text-micro font-bold text-forge-teal truncate tracking-tighter opacity-90 uppercase">
          {replyTo.sender?.name}
        </div>
        <p
          className={cn(
            "text-micro truncate leading-tight opacity-90",
            !isOwn && "text-slate-muted",
          )}
        >
          {replyTo.content}
        </p>
      </div>
    );
  },
);
