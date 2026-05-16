import { Reply } from "lucide-react";
import { memo } from "react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";

interface ReplyReferenceProps {
  replyTo: UnifiedMessage["replyTo"];
  isOwn: boolean;
  onActivate?: (messageId: string) => void;
}

export const ReplyReference = memo(
  ({ replyTo, isOwn, onActivate }: ReplyReferenceProps) => {
    if (!replyTo) return null;

    const className = cn(
      "mb-1.5 flex min-w-30 max-w-full items-stretch gap-2 self-stretch overflow-hidden rounded-lg px-2 py-1.5 text-left transition",
      isOwn ? "bg-canvas/45 dark:bg-white/7" : "bg-muted/45 dark:bg-white/6",
      onActivate &&
        "cursor-pointer hover:bg-forge-teal/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/35",
    );
    const content = (
      <>
        <div className="w-1 shrink-0 rounded-full bg-forge-teal opacity-80" />
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex min-w-0 items-center gap-1.5">
            <Reply className="size-3 shrink-0 text-forge-teal" />
            <span className="min-w-0 flex-1 truncate font-bold text-forge-teal text-micro uppercase tracking-tight">
              {replyTo.sender?.name}
            </span>
          </div>
          <p className="truncate font-medium text-micro text-slate-muted leading-relaxed">
            {replyTo.content}
          </p>
        </div>
      </>
    );

    if (onActivate) {
      return (
        <button
          type="button"
          aria-label="View original message"
          className={className}
          onClick={() => onActivate(replyTo.id)}
        >
          {content}
        </button>
      );
    }

    return <div className={className}>{content}</div>;
  },
);
