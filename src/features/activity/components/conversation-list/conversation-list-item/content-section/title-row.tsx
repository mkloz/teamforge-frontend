import { BellOff, Bookmark, Pin } from "lucide-react";
import type { ReactNode } from "react";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import type { ContentSectionViewState } from "../content-section-view-state";
import { GroupIndicators } from "../group-indicators";

export function ConversationTitleRow({
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
  const titlePinButton = getTitlePinButton(
    viewState,
    item.isPinned,
    onTogglePinned,
  );

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <ConversationTitle isSelected={isSelected} title={viewState.title} />
        <NotesPrivacyPill isVisible={viewState.isNotes} />
        <ConversationTitleUtilitiesSlot
          item={item}
          isCompact={isCompact}
          isReviewWaiting={isReviewWaiting}
          titlePinButton={titlePinButton}
          viewState={viewState}
        />
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <ConversationTimestamp
          formattedTimestamp={viewState.formattedTimestamp}
          isCompact={isCompact}
        />
      </div>
    </div>
  );
}

function getTitlePinButton(
  viewState: ContentSectionViewState,
  isPinned: boolean | undefined,
  onTogglePinned?: () => void,
) {
  return viewState.showTitlePinButton && onTogglePinned ? (
    <TitlePinButton
      isPinned={Boolean(isPinned)}
      onTogglePinned={onTogglePinned}
    />
  ) : null;
}

function ConversationTitle({
  isSelected,
  title,
}: {
  isSelected: boolean;
  title: string;
}) {
  return (
    <p
      className={cn(
        "min-w-0 truncate font-bold tracking-tight transition-colors",
        "text-sm",
        getTitleTextClassName(isSelected),
      )}
    >
      {title}
    </p>
  );
}

function getTitleTextClassName(isSelected: boolean) {
  return isSelected ? "text-ink" : "text-ink/90 group-hover/item:text-ink";
}

function ConversationTitleUtilitiesSlot({
  item,
  isCompact,
  isReviewWaiting,
  titlePinButton,
  viewState,
}: {
  item: UnifiedConversation;
  isCompact: boolean;
  isReviewWaiting: boolean;
  titlePinButton: ReactNode;
  viewState: ContentSectionViewState;
}) {
  const savedMessageCount = shouldShowStandaloneSavedMessageCount({
    isCompact,
    savedMessageCount: item.savedMessageCount,
    viewState,
  })
    ? item.savedMessageCount
    : undefined;

  if (!viewState.hasTitleUtilityCluster && !savedMessageCount) {
    return null;
  }

  return (
    <ConversationTitleUtilities
      item={item}
      isReviewWaiting={isReviewWaiting}
      savedMessageCount={savedMessageCount}
      titlePinButton={titlePinButton}
      viewState={viewState}
    />
  );
}

function ConversationTimestamp({
  formattedTimestamp,
  isCompact,
}: {
  formattedTimestamp: string;
  isCompact: boolean;
}) {
  return (
    <time
      className={cn(
        "shrink-0 font-medium text-slate-muted text-xs tabular-nums",
        isCompact && "leading-none",
      )}
    >
      {formattedTimestamp}
    </time>
  );
}

function ConversationTitleUtilities({
  item,
  isReviewWaiting,
  savedMessageCount,
  titlePinButton,
  viewState,
}: {
  item: UnifiedConversation;
  isReviewWaiting: boolean;
  savedMessageCount: number | undefined;
  titlePinButton: ReactNode;
  viewState: ContentSectionViewState;
}) {
  return (
    <span className="ml-auto flex shrink-0 items-center gap-1">
      <TitlePinButtonSlot
        isPinned={item.isPinned}
        placement="unpinned"
        titlePinButton={titlePinButton}
      />
      <InlineGroupIndicatorsSlot
        item={item}
        isReviewWaiting={isReviewWaiting}
        viewState={viewState}
      />
      <SavedMessageCountPill count={savedMessageCount} />
      <InlineMutedIndicatorSlot viewState={viewState} />
      <TitlePinButtonSlot
        isPinned={item.isPinned}
        placement="pinned"
        titlePinButton={titlePinButton}
      />
      <StaticPinnedIconSlot viewState={viewState} />
    </span>
  );
}

function TitlePinButtonSlot({
  isPinned,
  placement,
  titlePinButton,
}: {
  isPinned: boolean | undefined;
  placement: "pinned" | "unpinned";
  titlePinButton: ReactNode;
}) {
  if (shouldShowTitlePinButtonInSlot(isPinned, placement)) {
    return titlePinButton;
  }

  return null;
}

function shouldShowTitlePinButtonInSlot(
  isPinned: boolean | undefined,
  placement: "pinned" | "unpinned",
) {
  return placement === "pinned" ? Boolean(isPinned) : !isPinned;
}

function InlineGroupIndicatorsSlot({
  item,
  isReviewWaiting,
  viewState,
}: {
  item: UnifiedConversation;
  isReviewWaiting: boolean;
  viewState: ContentSectionViewState;
}) {
  if (!viewState.showInlineGroupIndicators) {
    return null;
  }

  return (
    <GroupIndicators
      countdown={viewState.countdown}
      pendingProposalCount={viewState.pendingProposalCount}
      savedMessageCount={
        viewState.hasSavedMessages ? item.savedMessageCount : undefined
      }
      isReviewWaiting={isReviewWaiting}
      variant="inline"
    />
  );
}

function InlineMutedIndicatorSlot({
  viewState,
}: {
  viewState: ContentSectionViewState;
}) {
  return viewState.showInlineMutedIndicator ? <MutedIndicator /> : null;
}

function StaticPinnedIconSlot({
  viewState,
}: {
  viewState: ContentSectionViewState;
}) {
  return viewState.showStaticPinnedIcon ? <StaticPinnedIcon /> : null;
}

function SavedMessageCountPill({ count }: { count: number | undefined }) {
  if (!count) {
    return null;
  }

  return (
    <StatusPill
      icon={Bookmark}
      iconClassName="fill-forge-teal/15"
      tone="teal"
      size="signature"
      surface="soft"
      className="min-w-4 px-1"
      numeric
    >
      {count}
    </StatusPill>
  );
}

function shouldShowStandaloneSavedMessageCount({
  isCompact,
  savedMessageCount,
  viewState,
}: {
  isCompact: boolean;
  savedMessageCount: number | undefined;
  viewState: ContentSectionViewState;
}) {
  return (
    Boolean(savedMessageCount) &&
    !isCompact &&
    !viewState.shouldShowSavedCountInIndicatorRow &&
    !viewState.showInlineGroupIndicators
  );
}

function NotesPrivacyPill({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <StatusPill tone="amber" size="signature" surface="soft">
      Private
    </StatusPill>
  );
}

function TitlePinButton({
  isPinned,
  onTogglePinned,
}: {
  isPinned: boolean;
  onTogglePinned: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={isPinned ? "Unpin chat" : "Pin chat"}
      className={cn(
        "relative z-20 hidden size-6 shrink-0 items-center justify-center rounded-full text-slate-muted/70 transition",
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
      <Pin className="size-2.5" strokeWidth={2.2} />
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
        className="size-3.5 text-forge-teal"
      >
        <Pin
          className="size-2.5 rotate-45"
          aria-hidden="true"
          strokeWidth={2.2}
        />
      </IconTile>
      <span className="sr-only">Pinned chat</span>
    </>
  );
}

function MutedIndicator() {
  return (
    <IconTile
      aria-hidden={false}
      size="2xs"
      shape="circle"
      tone="muted"
      className="size-3.5 text-slate-muted/70"
      title="Notifications muted"
    >
      <BellOff aria-hidden="true" className="size-2" strokeWidth={2.2} />
      <span className="sr-only">Notifications muted</span>
    </IconTile>
  );
}
