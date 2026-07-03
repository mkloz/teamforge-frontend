import type { ReactNode } from "react";
import type { Group } from "@/features/activity/lib/activity-contract";
import { CompletedReviewGateBody } from "./completed-review-gate-body";
import { CompletedReviewGateHeader } from "./completed-review-gate-header";
import { useCompletedGroupRating } from "./use-completed-group-rating";
import { getCompletedReviewGateViewState } from "./view-state";

interface CompletedReviewGateProps {
  children: ReactNode;
  group: Group;
}

export function CompletedReviewGate({
  children,
  group,
}: CompletedReviewGateProps) {
  const rating = useCompletedGroupRating(group);
  const viewState = getCompletedReviewGateViewState(group, rating);

  if (!viewState.shouldShowGate) {
    return <>{children}</>;
  }

  return (
    <div className="relative z-10 shrink-0 border-border border-t bg-canvas/60 backdrop-blur-sm">
      <CompletedReviewGateHeader
        pendingCountLabel={viewState.pendingCountLabel}
      />
      <CompletedReviewGateBody rating={rating} viewState={viewState} />
    </div>
  );
}
