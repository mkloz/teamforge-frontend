import { Reply } from "lucide-react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";

interface ReplyReferenceProps {
  replyTo: UnifiedMessage["replyTo"];
  isOwn: boolean;
  onActivate?: (messageId: string) => void;
}

export function ReplyReference({
  replyTo,
  isOwn,
  onActivate,
}: ReplyReferenceProps) {
  if (!replyTo) return null;

  const className = getReplyReferenceClassName({
    isActionable: Boolean(onActivate),
    isOwn,
  });

  if (onActivate) {
    return (
      <button
        type="button"
        aria-label="View original message"
        className={className}
        onClick={() => onActivate(replyTo.id)}
      >
        <ReplyReferenceContent replyTo={replyTo} />
      </button>
    );
  }

  return (
    <div className={className}>
      <ReplyReferenceContent replyTo={replyTo} />
    </div>
  );
}

function ReplyReferenceContent({
  replyTo,
}: {
  replyTo: NonNullable<UnifiedMessage["replyTo"]>;
}) {
  return (
    <>
      <div className="w-1 shrink-0 rounded-full bg-primary opacity-80" />
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex min-w-0 items-center gap-1.5">
          <Reply className="size-3 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate font-bold text-micro text-primary">
            {replyTo.sender?.name}
          </span>
        </div>
        <p className="truncate font-medium text-micro text-slate-muted leading-relaxed">
          {replyTo.content}
        </p>
      </div>
    </>
  );
}

function getReplyReferenceClassName({
  isActionable,
  isOwn,
}: {
  isActionable: boolean;
  isOwn: boolean;
}) {
  return cn(
    "mb-1.5 flex w-0 min-w-full max-w-full items-stretch gap-2 overflow-hidden rounded-lg px-2 py-1.5 text-left transition",
    isOwn ? "bg-canvas/45 dark:bg-white/7" : "bg-muted/45 dark:bg-white/6",
    isActionable &&
      "cursor-pointer hover:bg-primary/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
  );
}
