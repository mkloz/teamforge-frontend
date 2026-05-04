import { Pin, X } from "lucide-react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import dayjs from "dayjs";
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
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Pin size={14} className="text-forge-teal rotate-45" />
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-muted">
          Pinned Messages
        </h4>
      </div>

      <div className="space-y-2">
        {pinnedMessages.map((message) => (
          <div
            key={message.id}
            className="group relative flex items-start gap-1 bg-canvas border border-border/40 rounded-xl p-2 hover:border-forge-teal/30 hover:bg-forge-teal/2 transition-all duration-200"
          >
            {onJumpToMessage ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onJumpToMessage(message.id)}
                className="h-auto min-w-0 flex-1 justify-start rounded-lg border-0 bg-transparent p-1 text-left shadow-none hover:bg-transparent focus-visible:ring-forge-teal/30"
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
                variant="ghost"
                size="icon-xs"
                type="button"
                className="mt-0.5 h-6 w-6 shrink-0 rounded-full text-slate-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-ink"
                onClick={() => {
                  void onUnpinMessage(message);
                }}
                aria-label="Unpin message"
              >
                <X size={12} />
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
        <div className="min-w-0">
          <span className="text-[12px] font-semibold text-ink leading-none">
            {message.sender?.name || "System"}
          </span>
        </div>
        <span className="text-[10px] text-slate-muted font-medium">
          {message.createdAt && dayjs(message.createdAt).format("MMM D")}
        </span>
      </div>
      <p className="text-[13px] text-ink/80 leading-relaxed line-clamp-2">
        {message.content}
      </p>
    </>
  );
}
