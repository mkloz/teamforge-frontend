import { BellOff, Bookmark, Pin } from "lucide-react";
import { memo } from "react";
import { UnifiedTypingIndicator } from "@/features/activity/components/chat/unified-typing-indicator";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import {
  formatCountdown,
  formatRelativeTime,
} from "@/features/activity/lib/chat-utils";
import {
  getConversationIsMuted,
  getConversationPlanDateTime,
  getConversationPlanStatus,
  getConversationSubtitle,
  getConversationTitle,
  getMessagePreviewText,
} from "@/features/activity/lib/unify-conversations";
import { cn } from "@/shared/lib/utils";
import { GroupIndicators } from "./group-indicators";
import { MsgStatusIcon } from "./msg-status-icon";
import { SubtitleIcon } from "./subtitle-icon";
import { UnreadBadge } from "./unread-badge";

interface ContentSectionProps {
  item: UnifiedConversation;
  isGroup: boolean;
  isSelected: boolean;
  isCompact?: boolean;
  isSavedView?: boolean;
  onTogglePinned?: () => void;
}

export const ContentSection = memo(
  ({
    item,
    isGroup,
    isSelected,
    isCompact = false,
    isSavedView = false,
    onTogglePinned,
  }: ContentSectionProps) => {
    const hasUnread = item.unreadCount > 0;
    const title = getConversationTitle(item);
    const previewMessage =
      isSavedView && item.latestSavedMessage
        ? item.latestSavedMessage
        : item.latestMessage;
    const subtitle =
      isSavedView && item.latestSavedMessage
        ? getMessagePreviewText(item.latestSavedMessage)
        : getConversationSubtitle(item);
    const planDateTime = isGroup ? getConversationPlanDateTime(item) : null;
    const countdown = planDateTime ? formatCountdown(planDateTime) : null;
    const isDraft = isGroup && getConversationPlanStatus(item) === "DRAFT";
    const isMuted = getConversationIsMuted(item);
    const latestMessage = item.latestMessage;
    const timestampMessage = isSavedView ? previewMessage : latestMessage;
    const hasIndicatorRow =
      isGroup && !isCompact && Boolean(countdown || isDraft);
    const pinButton =
      onTogglePinned && hasIndicatorRow ? (
        <button
          type="button"
          aria-label={item.isPinned ? "Unpin chat" : "Pin chat"}
          className={cn(
            "inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-transparent text-slate-muted/70 opacity-60 transition sm:opacity-0",
            "hover:border-forge-teal/20 hover:bg-forge-teal/8 hover:text-forge-teal",
            "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/25",
            item.isPinned &&
              "border-forge-teal/20 bg-forge-teal/10 text-forge-teal opacity-100",
            !item.isPinned && "sm:group-hover/item:opacity-100",
          )}
          onClick={(event) => {
            event.stopPropagation();
            onTogglePinned();
          }}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Pin className={cn("size-3", item.isPinned && "rotate-45")} />
        </button>
      ) : null;

    return (
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        {/* Title and Time row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <h3
              className={cn(
                "min-w-0 truncate font-bold tracking-tight transition-colors",
                "text-sm",
                isSelected
                  ? "text-ink"
                  : "text-ink/90 group-hover/item:text-ink",
              )}
            >
              {title}
            </h3>
            {item.savedMessageCount ? (
              <span className="type-signature-label inline-flex shrink-0 items-center gap-0.5 rounded-full bg-forge-teal/8 px-1.5 py-0.5 font-bold text-forge-teal leading-none">
                <Bookmark className="size-2.5 fill-forge-teal/15" />
                {item.savedMessageCount}
              </span>
            ) : null}
            {item.isPinned || isMuted ? (
              <span className="ml-auto flex shrink-0 items-center gap-1">
                {item.isPinned ? (
                  <>
                    <Pin
                      className={cn(
                        "shrink-0 rotate-45 text-forge-teal",
                        isCompact ? "size-3" : "size-3.5",
                      )}
                      aria-hidden="true"
                      strokeWidth={2.25}
                    />
                    <span className="sr-only">Pinned chat</span>
                  </>
                ) : null}
                {isMuted && (
                  <>
                    <BellOff
                      className={cn(
                        "shrink-0 text-slate-muted/60",
                        isCompact ? "size-3" : "size-3.5",
                      )}
                      aria-hidden="true"
                      strokeWidth={2.25}
                    />
                    <span className="sr-only">Notifications muted</span>
                  </>
                )}
              </span>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <time
              className={cn(
                "shrink-0 font-medium text-micro text-slate-muted tabular-nums",
                isCompact && "origin-right scale-90",
              )}
            >
              {timestampMessage?.createdAt
                ? formatRelativeTime(timestampMessage.createdAt)
                : ""}
            </time>
          </div>
        </div>

        {/* Subtitle and Unread row */}
        <div
          className={cn(
            "flex items-center justify-between gap-2",
            isCompact ? "mt-0" : "mt-0.5",
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
              <SubtitleIcon type={previewMessage?.type} isCompact={isCompact} />

              {item.isTyping && !isSavedView ? (
                <div className="fade-in slide-in-from-left-2 flex animate-in items-baseline gap-1 duration-300">
                  <span
                    className={cn(
                      "font-bold text-forge-teal leading-tight",
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
                    previewMessage?.isSystem && "text-slate-muted/60 italic",
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <UnreadBadge count={item.unreadCount} isCompact={isCompact} />
          </div>
        </div>

        {/* Group-specific indicators footer — Hidden in compact */}
        {hasIndicatorRow && (
          <GroupIndicators
            action={pinButton}
            countdown={countdown}
            isDraft={isDraft}
          />
        )}
      </div>
    );
  },
);
