import { BellOff, Bookmark, Pin } from "lucide-react";
import { lazy, memo, Suspense } from "react";
import { useIsReviewWaiting } from "@/features/activity/hooks/use-is-review-waiting";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import { UnreadBadge } from "@/shared/components/common/unread-badge";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import {
  type ContentSectionViewState,
  getContentSectionViewState,
} from "./content-section-view-state";
import { GroupIndicators } from "./group-indicators";
import { MsgStatusIcon } from "./msg-status-icon";
import { SubtitleIcon } from "./subtitle-icon";

const UnifiedTypingIndicator = lazy(() =>
  import("@/features/activity/components/chat/unified-typing-indicator").then(
    (module) => ({
      default: module.UnifiedTypingIndicator,
    }),
  ),
);

const titleCounterPillClassName = "min-w-5";

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
    const isReviewWaiting = useIsReviewWaiting(item.group);
    const viewState = getContentSectionViewState({
      hasTogglePinned: Boolean(onTogglePinned),
      isCompact,
      isGroup,
      isReviewWaiting,
      isSavedView,
      item,
    });

    return (
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <ConversationTitleRow
          item={item}
          isCompact={isCompact}
          isReviewWaiting={isReviewWaiting}
          isSelected={isSelected}
          viewState={viewState}
          onTogglePinned={onTogglePinned}
        />

        <ConversationSubtitleRow
          item={item}
          isCompact={isCompact}
          isGroup={isGroup}
          isSavedView={isSavedView}
          viewState={viewState}
        />

        {viewState.hasIndicatorRow && (
          <GroupIndicators
            countdown={viewState.countdown}
            pendingProposalCount={viewState.pendingProposalCount}
            planStatus={viewState.planStatus}
            savedMessageCount={
              viewState.shouldShowSavedCountInIndicatorRow
                ? item.savedMessageCount
                : undefined
            }
            isReviewWaiting={isReviewWaiting}
          />
        )}
      </div>
    );
  },
);

function ConversationTitleRow({
  item,
  isCompact,
  isReviewWaiting,
  isSelected,
  viewState,
  onTogglePinned,
}: {
  item: UnifiedConversation;
  isCompact: boolean;
  isReviewWaiting: boolean;
  isSelected: boolean;
  viewState: ContentSectionViewState;
  onTogglePinned?: () => void;
}) {
  const titlePinButton =
    viewState.showTitlePinButton && onTogglePinned ? (
      <TitlePinButton onTogglePinned={onTogglePinned} />
    ) : null;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <h3
          className={cn(
            "min-w-0 truncate font-bold tracking-tight transition-colors",
            "text-sm",
            isSelected ? "text-ink" : "text-ink/90 group-hover/item:text-ink",
          )}
        >
          {viewState.title}
        </h3>
        {item.savedMessageCount &&
        !isCompact &&
        !viewState.shouldShowSavedCountInIndicatorRow &&
        !viewState.showInlineGroupIndicators ? (
          <StatusPill
            icon={Bookmark}
            iconClassName="fill-forge-teal/15"
            tone="teal"
            size="signature"
            surface="soft"
            className={titleCounterPillClassName}
          >
            {item.savedMessageCount}
          </StatusPill>
        ) : null}
        {viewState.isNotes ? (
          <StatusPill tone="amber" size="signature" surface="soft">
            Private
          </StatusPill>
        ) : null}
        {viewState.hasTitleUtilityCluster ? (
          <ConversationTitleUtilities
            item={item}
            isReviewWaiting={isReviewWaiting}
            titlePinButton={titlePinButton}
            viewState={viewState}
          />
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <time
          className={cn(
            "shrink-0 font-medium text-micro text-slate-muted tabular-nums",
            isCompact && "origin-right scale-90",
          )}
        >
          {viewState.formattedTimestamp}
        </time>
      </div>
    </div>
  );
}

function ConversationTitleUtilities({
  item,
  isReviewWaiting,
  titlePinButton,
  viewState,
}: {
  item: UnifiedConversation;
  isReviewWaiting: boolean;
  titlePinButton: React.ReactNode;
  viewState: ContentSectionViewState;
}) {
  return (
    <span className="ml-auto flex shrink-0 items-center gap-1">
      {!item.isPinned ? titlePinButton : null}
      {viewState.showInlineGroupIndicators ? (
        <GroupIndicators
          countdown={viewState.countdown}
          pendingProposalCount={viewState.pendingProposalCount}
          planStatus={viewState.planStatus}
          savedMessageCount={
            viewState.hasSavedMessages ? item.savedMessageCount : undefined
          }
          isReviewWaiting={isReviewWaiting}
          variant="inline"
        />
      ) : null}
      {viewState.showInlineMutedIndicator ? <MutedIndicator /> : null}
      {item.isPinned ? titlePinButton : null}
      {viewState.showStaticPinnedIcon ? <StaticPinnedIcon /> : null}
    </span>
  );
}

function ConversationSubtitleRow({
  item,
  isCompact,
  isGroup,
  isSavedView,
  viewState,
}: {
  item: UnifiedConversation;
  isCompact: boolean;
  isGroup: boolean;
  isSavedView: boolean;
  viewState: ContentSectionViewState;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2",
        isCompact ? "mt-0" : "mt-0.5",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="shrink-0">
          {!isGroup &&
            viewState.latestMessage?.isOwn &&
            viewState.latestMessage?.status && (
              <MsgStatusIcon
                status={viewState.latestMessage.status}
                isCompact={isCompact}
              />
            )}
        </span>
        <div className="flex min-w-0 items-center gap-1 overflow-hidden">
          <SubtitleIcon
            type={viewState.previewMessage?.type}
            isCompact={isCompact}
          />

          {item.isTyping && !isSavedView ? (
            <TypingPreview isCompact={isCompact} />
          ) : (
            <p
              className={cn(
                "truncate leading-tight",
                "text-xs",
                viewState.hasUnread
                  ? "font-bold text-ink"
                  : "text-slate-muted/80 group-hover/item:text-slate-muted",
                viewState.previewMessage?.isSystem &&
                  "text-slate-muted/60 italic",
              )}
            >
              {viewState.subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <UnreadBadge count={item.unreadCount} isCompact={isCompact} />
      </div>
    </div>
  );
}

function TitlePinButton({ onTogglePinned }: { onTogglePinned: () => void }) {
  return (
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
  );
}

function StaticPinnedIcon() {
  return (
    <>
      <IconTile
        size="2xs"
        shape="circle"
        tone="none"
        className="text-forge-teal"
      >
        <Pin
          className="size-3 rotate-45"
          aria-hidden="true"
          strokeWidth={2.2}
        />
      </IconTile>
      <span className="sr-only">Pinned chat</span>
    </>
  );
}

function TypingPreview({ isCompact }: { isCompact: boolean }) {
  return (
    <div className="fade-in slide-in-from-left-2 flex animate-in items-baseline gap-1 duration-300">
      <span
        className={cn("font-bold text-forge-teal leading-tight", "text-xs")}
      >
        typing
      </span>
      <Suspense
        fallback={
          <TypingDotsFallback className={isCompact ? "h-2" : "h-2.5"} />
        }
      >
        <UnifiedTypingIndicator
          variant="minimal"
          className={isCompact ? "h-2" : "h-2.5"}
        />
      </Suspense>
    </div>
  );
}

function MutedIndicator() {
  return (
    <IconTile
      aria-hidden={false}
      size="2xs"
      shape="circle"
      tone="muted"
      className="text-slate-muted/70"
      title="Notifications muted"
    >
      <BellOff aria-hidden="true" className="size-2.5" strokeWidth={2.2} />
      <span className="sr-only">Notifications muted</span>
    </IconTile>
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
