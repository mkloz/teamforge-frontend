import dayjs from "dayjs";
import { Pin, X } from "lucide-react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { Button } from "@/shared/components/ui/button";

interface PinnedMessagesSectionProps {
  onJumpToMessage?: (messageId: string) => void;
  onUnpinMessage?: (message: UnifiedMessage) => Promise<void> | void;
  pinnedMessages: UnifiedMessage[];
}

export function PinnedMessagesSection({
  onJumpToMessage,
  onUnpinMessage,
  pinnedMessages,
}: PinnedMessagesSectionProps) {
  if (pinnedMessages.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <Pin className="size-4 rotate-45 text-forge-teal" />
        <h4 className="font-bold text-slate-muted text-xs">Pinned messages</h4>
      </div>

      <div className="divide-y divide-border/70 border-border/70 border-y">
        {pinnedMessages.map((message) => (
          <div
            key={message.id}
            className="group relative flex items-start gap-1 py-2.5"
          >
            {onJumpToMessage ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onJumpToMessage(message.id)}
                className="h-auto min-w-0 flex-1 justify-start rounded-lg border-0 bg-transparent p-1 text-left focus-visible:ring-forge-teal/30"
                contentClassName="block h-auto min-w-0"
                aria-label={`Jump to pinned message from ${message.sender?.name || "System"}`}
              >
                <PinnedMessageSummary message={message} />
              </Button>
            ) : (
              <div className="min-w-0 flex-1 p-1">
                <PinnedMessageSummary message={message} />
              </div>
            )}

            {onUnpinMessage ? (
              <Button
                variant="accentGhost"
                size="icon-xs"
                type="button"
                className="mt-0.5 shrink-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => {
                  void onUnpinMessage(message);
                }}
                aria-label="Unpin message"
              >
                <X className="size-3.5" />
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function PinnedMessageSummary({ message }: { message: UnifiedMessage }) {
  return (
    <>
      <div className="mb-1 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-ink text-sm leading-none">
            {message.sender?.name || "System"}
          </span>
        </div>
        <span className="shrink-0 font-medium text-slate-muted text-xs">
          {message.createdAt && dayjs(message.createdAt).format("MMM D")}
        </span>
      </div>
      <p className="line-clamp-2 break-words text-ink/80 text-sm leading-relaxed">
        {message.content}
      </p>
    </>
  );
}
