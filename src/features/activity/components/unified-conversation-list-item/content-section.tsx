import { cn } from "@/shared/lib/utils";
import { BellOff } from "lucide-react";
import { memo } from "react";
import type { UnifiedConversation } from "../../lib/activity-contract";
import { formatRelativeTime, formatCountdown } from "../../lib/chat-utils";
import {
  getConversationIsMuted,
  getConversationPlanDateTime,
  getConversationPlanStatus,
  getConversationSubtitle,
  getConversationTitle,
} from "../../lib/unify-conversations";
import { UnifiedTypingIndicator } from "../chat/unified-typing-indicator";
import { MsgStatusIcon } from "./msg-status-icon";
import { SubtitleIcon } from "./subtitle-icon";
import { UnreadBadge } from "./unread-badge";
import { GroupIndicators } from "./group-indicators";

interface ContentSectionProps {
  item: UnifiedConversation;
  isGroup: boolean;
  isSelected: boolean;
  isCompact?: boolean;
}

export const ContentSection = memo(
  ({ item, isGroup, isSelected, isCompact = false }: ContentSectionProps) => {
    const hasUnread = item.unreadCount > 0;
    const title = getConversationTitle(item);
    const subtitle = getConversationSubtitle(item);
    const countdown =
      isGroup && getConversationPlanDateTime(item)
        ? formatCountdown(getConversationPlanDateTime(item)!)
        : null;
    const isDraft = isGroup && getConversationPlanStatus(item) === "DRAFT";
    const isMuted = getConversationIsMuted(item);
    const latestMessage = item.latestMessage;

    return (
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Title and Time row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3
              className={cn(
                "font-bold truncate transition-colors tracking-tight",
                isCompact ? "text-[13px]" : "text-sm",
                isSelected
                  ? "text-ink"
                  : "text-ink/90 group-hover/item:text-ink",
              )}
            >
              {title}
            </h3>
            {!isGroup && isMuted && (
              <BellOff
                size={isCompact ? 9 : 11}
                className="text-slate-muted/60 shrink-0"
              />
            )}
          </div>
          <time
            className={cn(
              "text-micro font-medium text-slate-muted shrink-0 tabular-nums",
              isCompact && "scale-90 origin-right",
            )}
          >
            {latestMessage?.createdAt
              ? formatRelativeTime(latestMessage.createdAt)
              : ""}
          </time>
        </div>

        {/* Subtitle and Unread row */}
        <div
          className={cn(
            "flex items-center justify-between gap-2",
            isCompact ? "mt-0" : "mt-1",
          )}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {!isGroup && latestMessage?.isOwn && latestMessage?.status && (
              <MsgStatusIcon
                status={latestMessage.status}
                isCompact={isCompact}
              />
            )}
            <div className="flex items-center gap-1 overflow-hidden min-w-0">
              <SubtitleIcon type={latestMessage?.type} isCompact={isCompact} />

              {item.isTyping ? (
                <div className="flex items-baseline gap-1 animate-in fade-in slide-in-from-left-2 duration-300">
                  <span
                    className={cn(
                      "font-bold text-forge-teal leading-tight",
                      isCompact ? "text-[10px]" : "text-xs",
                    )}
                  >
                    typing
                  </span>
                  <UnifiedTypingIndicator
                    variant="minimal"
                    className={isCompact ? "h-2" : "h-2.5"}
                  />
                </div>
              ) : (
                <p
                  className={cn(
                    "truncate leading-tight",
                    isCompact ? "text-[11px]" : "text-xs",
                    hasUnread
                      ? "text-ink font-bold"
                      : "text-slate-muted/80 group-hover/item:text-slate-muted",
                    latestMessage?.isSystem && "italic text-slate-muted/60",
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <UnreadBadge count={item.unreadCount} isCompact={isCompact} />
        </div>

        {/* Group-specific indicators footer — Hidden in compact */}
        {isGroup && !isCompact && (
          <GroupIndicators countdown={countdown} isDraft={isDraft} />
        )}
      </div>
    );
  },
);
