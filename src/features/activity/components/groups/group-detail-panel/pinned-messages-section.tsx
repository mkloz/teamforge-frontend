import { Pin } from "lucide-react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import dayjs from "dayjs";

interface PinnedMessagesSectionProps {
  pinnedMessages: UnifiedMessage[];
}

export function PinnedMessagesSection({
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
            className="group relative bg-canvas border border-border/40 rounded-xl p-3 hover:border-forge-teal/30 hover:bg-forge-teal/2 transition-all duration-200 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-[12px] font-semibold text-ink leading-none">
                {message.sender?.name || "System"}
              </span>
              <span className="text-[10px] text-slate-muted font-medium">
                {message.createdAt && dayjs(message.createdAt).format("MMM D")}
              </span>
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
