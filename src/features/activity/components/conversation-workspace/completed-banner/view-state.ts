import type { Group } from "@/features/activity/lib/activity-contract";
import type { useCompletedGroupRating } from "./use-completed-group-rating";

export type CompletedGroupRating = ReturnType<typeof useCompletedGroupRating>;

export interface CompletedReviewGateViewState {
  deferralDisabled: boolean;
  deferralTitle: string | undefined;
  groupTitle: string;
  isReviewFormBusy: boolean;
  pendingCountLabel: number | "No";
  ratingLabel: string;
  shouldShowGate: boolean;
  showOfflineNotice: boolean;
  submitDisabled: boolean;
  submitTitle: string | undefined;
}

export function getCompletedReviewGateViewState(
  group: Group,
  rating: CompletedGroupRating,
): CompletedReviewGateViewState {
  const isReviewFormBusy = rating.isSubmitting || rating.isDeferring;

  return {
    deferralDisabled: isReviewDeferralDisabled(rating),
    deferralTitle: getReviewReconnectTitle(
      rating.isOnline,
      "moving review prompts",
    ),
    groupTitle: getCompletedGroupTitle(group),
    isReviewFormBusy,
    pendingCountLabel: getPendingReviewCountLabel(rating.pendingCount),
    ratingLabel: getRatingLabel(rating.selectedMember),
    shouldShowGate: shouldShowCompletedReviewGate(group, rating),
    showOfflineNotice: !rating.isOnline,
    submitDisabled: isReviewSubmitDisabled(rating),
    submitTitle: getReviewReconnectTitle(rating.isOnline, "submitting reviews"),
  };
}

function getCompletedGroupTitle(group: Group) {
  return group.plan?.title ?? group.name;
}

function getPendingReviewCountLabel(
  pendingCount: number,
): CompletedReviewGateViewState["pendingCountLabel"] {
  return pendingCount || "No";
}

function getRatingLabel(
  selectedMember: CompletedGroupRating["selectedMember"],
) {
  const selectedMemberUser = selectedMember?.user;
  return selectedMemberUser
    ? `Rating for ${selectedMemberUser.name}`
    : "Rating";
}

function shouldShowCompletedReviewGate(
  group: Group,
  rating: CompletedGroupRating,
) {
  return (
    group.plan?.status === "COMPLETED" &&
    (rating.isLoading || rating.isError || rating.shouldBlockReview)
  );
}

function isReviewDeferralDisabled(rating: CompletedGroupRating) {
  return !rating.isOnline || rating.isSubmitting;
}

function isReviewSubmitDisabled(rating: CompletedGroupRating) {
  return !rating.isOnline || !rating.activeUserId || rating.score === 0;
}

function getReviewReconnectTitle(isOnline: boolean, action: string) {
  return isOnline ? undefined : `Reconnect before ${action}.`;
}
