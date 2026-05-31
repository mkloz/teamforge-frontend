import { BellOff, Bookmark, Pin } from "lucide-react";
import { lazy, memo, Suspense } from "react";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import {
  formatCountdown,
  formatRelativeTime,
} from "@/features/activity/lib/chat-utils";
import {
  getConversationIsMuted,
  getConversationIsNotes,
  getConversationSubtitle,
  getConversationTitle,
  getMessagePreviewText,
} from "@/features/activity/lib/unify-conversations";
import { cn } from "@/shared/lib/utils";
import { GroupIndicators } from "./group-indicators";
import { MsgStatusIcon } from "./msg-status-icon";
import { SubtitleIcon } from "./subtitle-icon";
import { UnreadBadge } from "./unread-badge";

const UnifiedTypingIndicator = lazy(() =>
  import("@/features/activity/components/chat/unified-typing-indicator").then(
    (module) => ({
      default: module.UnifiedTypingIndicator,
    }),
  ),
);

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
    const plan = isGroup ? item.group?.plan : null;
    const countdown =
      plan?.status === "CONFIRMED" && plan.dateTime
        ? formatCountdown(plan.dateTime)
        : null;
    const pendingProposalCount =
      item.activeProposalCount ?? getPendingProposalCount(item);
    const hasCountdownIndicator = Boolean(countdown);
    const hasPlanStatusIndicator = Boolean(!countdown && plan?.status);
    const hasSavedMessages = Boolean(item.savedMessageCount);
    const hasPendingProposal = pendingProposalCount > 0;
    const visibleGroupIndicatorCount =
      Number(hasCountdownIndicator) +
      Number(hasPlanStatusIndicator) +
      Number(hasSavedMessages) +
      Number(hasPendingProposal);
    const isMuted = getConversationIsMuted(item);
    const showInlineGroupIndicators =
      isGroup && !isCompact && !isMuted && visibleGroupIndicatorCount === 1;
    const isNotes = getConversationIsNotes(item);
    const latestMessage = item.latestMessage;
    const timestampMessage = isSavedView ? previewMessage : latestMessage;
    const hasIndicatorRow =
      isGroup &&
      !isCompact &&
      (visibleGroupIndicatorCount > 1 ||
        (isMuted && visibleGroupIndicatorCount > 0));
    const showSavedCountInIndicatorRow = hasIndicatorRow && hasSavedMessages;
    const showStaticPinnedIcon = item.isPinned;
    const showInlineMutedIndicator = isMuted;
    const showTitlePinButton = Boolean(
      onTogglePinned &&
        !item.isPinned &&
        (showInlineMutedIndicator || showInlineGroupIndicators),
    );
    const hasTitleUtilityCluster =
      showInlineGroupIndicators ||
      showInlineMutedIndicator ||
      showTitlePinButton ||
      showStaticPinnedIcon;
    const titlePinButton =
      showTitlePinButton && onTogglePinned ? (
        <button
          type="button"
          aria-label="Pin chat"
          className={cn(
            "relative z-20 hidden size-4 shrink-0 items-center justify-center rounded-full text-slate-muted/70 transition",
            "hover:bg-forge-teal/8 hover:text-forge-teal",
            "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/25",
            "opacity-100 group-focus-within/item:inline-flex group-hover/item:inline-flex",
          )}
          onClick={(event) => {
            event.stopPropagation();
            onTogglePinned();
          }}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Pin className="size-3" strokeWidth={2.2} />
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
            {item.savedMessageCount &&
            !isCompact &&
            !showSavedCountInIndicatorRow &&
            !showInlineGroupIndicators ? (
              <span className="type-signature-label inline-flex shrink-0 items-center gap-0.5 rounded-full bg-forge-teal/8 px-1.5 py-0.5 font-bold text-forge-teal leading-none">
                <Bookmark className="size-2.5 fill-forge-teal/15" />
                {item.savedMessageCount}
              </span>
            ) : null}
            {isNotes ? (
              <span className="type-signature-label inline-flex shrink-0 items-center rounded-full bg-spark-amber/10 px-1.5 py-0.5 font-bold text-spark-amber leading-none">
                Private
              </span>
            ) : null}
            {hasTitleUtilityCluster ? (
              <span className="ml-auto flex shrink-0 items-center gap-1">
                {!item.isPinned ? titlePinButton : null}
                {showInlineGroupIndicators ? (
                  <GroupIndicators
                    countdown={countdown}
                    pendingProposalCount={pendingProposalCount}
                    planStatus={countdown ? null : plan?.status}
                    savedMessageCount={
                      hasSavedMessages ? item.savedMessageCount : undefined
                    }
                    variant="inline"
                  />
                ) : null}
                {showInlineMutedIndicator ? <MutedIndicator /> : null}
                {item.isPinned ? titlePinButton : null}
                {showStaticPinnedIcon ? (
                  <>
                    <span className="inline-flex size-4 shrink-0 items-center justify-center text-forge-teal">
                      <Pin
                        className="size-3 rotate-45"
                        aria-hidden="true"
                        strokeWidth={2.2}
                      />
                    </span>
                    <span className="sr-only">Pinned chat</span>
                  </>
                ) : null}
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
                  <Suspense
                    fallback={
                      <TypingDotsFallback
                        className={isCompact ? "h-2" : "h-2.5"}
                      />
                    }
                  >
                    <UnifiedTypingIndicator
                      variant="minimal"
                      className={isCompact ? "h-2" : "h-2.5"}
                    />
                  </Suspense>
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
            countdown={countdown}
            pendingProposalCount={pendingProposalCount}
            planStatus={countdown ? null : plan?.status}
            savedMessageCount={
              showSavedCountInIndicatorRow ? item.savedMessageCount : undefined
            }
          />
        )}
      </div>
    );
  },
);

function getPendingProposalCount(item: UnifiedConversation) {
  if (item.kind !== "group") {
    return 0;
  }

  const pendingProposalIds = new Set(
    (item.group?.plan?.proposals ?? [])
      .filter((proposal) => proposal.status === "PENDING")
      .map((proposal) => proposal.id),
  );
  const latestProposal = item.latestMessage?.proposal;

  if (latestProposal?.status === "PENDING") {
    pendingProposalIds.add(latestProposal.id);
  }

  return pendingProposalIds.size;
}

function MutedIndicator() {
  return (
    <span
      className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-slate-muted/10 text-slate-muted/70"
      title="Notifications muted"
    >
      <BellOff aria-hidden="true" className="size-2.5" strokeWidth={2.2} />
      <span className="sr-only">Notifications muted</span>
    </span>
  );
}

function TypingDotsFallback({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-end justify-start gap-1", className)}>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="mb-0.5 size-1 rounded-full bg-forge-teal/70 opacity-60"
        />
      ))}
    </span>
  );
}
