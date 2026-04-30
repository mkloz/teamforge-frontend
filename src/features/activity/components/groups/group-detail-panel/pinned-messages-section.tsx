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
            className="group relative bg-canvas border border-border/40 rounded-xl p-3 hover:border-forge-teal/30 hover:bg-forge-teal/2 transition-all duration-200"
            role={onJumpToMessage ? "button" : undefined}
            tabIndex={onJumpToMessage ? 0 : undefined}
            onClick={() => onJumpToMessage?.(message.id)}
            onKeyDown={(event) => {
              if (
                onJumpToMessage &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                onJumpToMessage(message.id);
              }
            }}
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[12px] font-semibold text-ink leading-none">
                  {message.sender?.name || "System"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-muted font-medium">
                  {message.createdAt &&
                    dayjs(message.createdAt).format("MMM D")}
                </span>
                {onUnpinMessage ? (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    type="button"
                    className="h-6 w-6 rounded-full text-slate-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-ink"
                    onClick={(event) => {
                      event.stopPropagation();
                      void onUnpinMessage(message);
                    }}
                    aria-label="Unpin message"
                  >
                    <X size={12} />
                  </Button>
                ) : null}
              </div>
            </div>
            <p className="text-[13px] text-ink/80 leading-relaxed line-clamp-2">
              {message.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
