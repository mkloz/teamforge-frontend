import { cn } from "@/shared/lib/utils";
import { BellOff } from "lucide-react";
import { memo } from "react";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import {
  formatRelativeTime,
  formatCountdown,
} from "@/features/activity/lib/chat-utils";
import {
  getConversationIsMuted,
  getConversationPlanDateTime,
  getConversationPlanStatus,
  getConversationSubtitle,
  getConversationTitle,
} from "@/features/activity/lib/unify-conversations";
import { UnifiedTypingIndicator } from "@/features/activity/components/chat/unified-typing-indicator";
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
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        {/* Title and Time row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3
              className={cn(
                "truncate font-bold tracking-tight transition-colors",
                "text-sm",
                isSelected
                  ? "text-ink"
                  : "text-ink/90 group-hover/item:text-ink",
              )}
            >
              {title}
            </h3>
            {!isGroup && isMuted && (
              <BellOff
                className={cn(
                  "shrink-0 text-slate-muted/60",
                  isCompact ? "size-3" : "size-3.5",
                )}
              />
            )}
          </div>
          <time
            className={cn(
              "shrink-0 text-micro font-medium text-slate-muted tabular-nums",
              isCompact && "origin-right scale-90",
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
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            {!isGroup && latestMessage?.isOwn && latestMessage?.status && (
              <MsgStatusIcon
                status={latestMessage.status}
                isCompact={isCompact}
              />
            )}
            <div className="flex min-w-0 items-center gap-1 overflow-hidden">
              <SubtitleIcon type={latestMessage?.type} isCompact={isCompact} />

              {item.isTyping ? (
                <div className="flex animate-in items-baseline gap-1 duration-300 fade-in slide-in-from-left-2">
                  <span
                    className={cn(
                      "leading-tight font-bold text-forge-teal",
                      "text-xs",
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
                    "text-xs",
                    hasUnread
                      ? "font-bold text-ink"
                      : "text-slate-muted/80 group-hover/item:text-slate-muted",
                    latestMessage?.isSystem && "text-slate-muted/60 italic",
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
