import { useIsReviewWaiting } from "@/features/activity/hooks/use-is-review-waiting";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import { ConversationSubtitleRow } from "./content-section/subtitle-row";
import { ConversationTitleRow } from "./content-section/title-row";
import {
  type ContentSectionViewState,
  getContentSectionViewState,
} from "./content-section-view-state";
import { GroupIndicators } from "./group-indicators";

interface ContentSectionProps {
  item: UnifiedConversation;
  density: "compact" | "default";
  selection: "selected" | "idle";
  source: "saved" | "conversation";
  onTogglePinned?: () => void;
}

export function ContentSection({
  item,
  density,
  selection,
  source,
  onTogglePinned,
}: ContentSectionProps) {
  const isCompact = density === "compact";
  const isGroup = item.kind === "group";
  const isSavedView = source === "saved";
  const isSelected = selection === "selected";
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
        <ContentIndicatorRow
          item={item}
          isReviewWaiting={isReviewWaiting}
          viewState={viewState}
        />
      )}
    </div>
  );
}

function ContentIndicatorRow({
  item,
  isReviewWaiting,
  viewState,
}: {
  item: UnifiedConversation;
  isReviewWaiting: boolean;
  viewState: ContentSectionViewState;
}) {
  return (
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
  );
}
