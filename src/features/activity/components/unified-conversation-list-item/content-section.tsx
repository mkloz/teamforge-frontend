import { cn } from "@/shared/lib/utils";
import { BellOff } from "lucide-react";
import { memo } from "react";
import type { UnifiedConversation } from "../../types/unified-conversation.types";
import { formatRelativeTime, formatCountdown } from "../../lib/chat-utils";
import { UnifiedTypingIndicator } from "../chat/unified-typing-indicator";
import { MsgStatusIcon } from "./msg-status-icon";
import { SubtitleIcon } from "./subtitle-icon";
import { UnreadBadge } from "./unread-badge";
import { GroupIndicators } from "./group-indicators";

interface ContentSectionProps {
  item: UnifiedConversation;
  isGroup: boolean;
  isSelected: boolean;
}

export const ContentSection = memo(
  ({ item, isGroup, isSelected }: ContentSectionProps) => {
    const hasUnread = item.unreadCount > 0;
    const countdown =
      isGroup && item.planDateTime ? formatCountdown(item.planDateTime) : null;
    const isDraft = isGroup && item.planStatus === "DRAFT";

    return (
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Title and Time row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3
              className={cn(
                "text-sm font-bold truncate transition-colors",
                isSelected
                  ? "text-ink"
                  : "text-ink/90 group-hover/item:text-ink",
              )}
            >
              {item.title}
            </h3>
            {!isGroup && item.isMuted && (
              <BellOff size={11} className="text-slate-muted/60 shrink-0" />
            )}
          </div>
          <time className="text-micro font-medium text-slate-muted shrink-0 tabular-nums">
            {formatRelativeTime(item.timestamp)}
          </time>
        </div>

        {/* Subtitle and Unread row */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {!isGroup && item.lastMessageIsOwn && item.lastMessageStatus && (
              <MsgStatusIcon status={item.lastMessageStatus} />
            )}
            <div className="flex items-center gap-1 overflow-hidden min-w-0">
              <SubtitleIcon type={item.subtitleIcon} />

              {item.isTyping ? (
                <div className="flex items-baseline gap-1 animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="text-xs font-bold text-forge-teal leading-tight">
                    typing
                  </span>
                  <UnifiedTypingIndicator variant="minimal" className="h-2.5" />
                </div>
              ) : (
                <p
                  className={cn(
                    "text-xs truncate leading-tight",
                    hasUnread
                      ? "text-ink font-bold"
                      : "text-slate-muted/80 group-hover/item:text-slate-muted",
                    item.lastMessageIsSystem && "italic text-slate-muted/60",
                  )}
                >
                  {item.subtitle}
                </p>
              )}
            </div>
          </div>

          <UnreadBadge count={item.unreadCount} />
        </div>

        {/* Group-specific indicators footer */}
        {isGroup && (
          <GroupIndicators
            countdown={countdown}
            isDraft={isDraft}
            pendingProposals={item.pendingProposals}
          />
        )}
      </div>
    );
  },
);
