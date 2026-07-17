import type { Group } from "@/features/activity/lib/activity-contract";
import type { useCompletedGroupRating } from "./use-completed-group-rating";

export type CompletedGroupRating = ReturnType<typeof useCompletedGroupRating>;

export interface CompletedReviewGateViewState {
  deferralDisabled: boolean;
  deferralTitle: string | undefined;
  groupTitle: string;
  headerLabel: "Plan check-in" | "Review checkpoint";
  isReviewFormBusy: boolean;
  pendingCountLabel: number | "No";
  participationDisabled: boolean;
  participationTitle: string | undefined;
  ratingLabel: string;
  shouldShowGate: boolean;
  showParticipationPrompt: boolean;
  showPendingCount: boolean;
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
      "choosing a review option",
    ),
    groupTitle: getCompletedGroupTitle(group),
    headerLabel:
      rating.participationStatus === null
        ? "Plan check-in"
        : "Review checkpoint",
    isReviewFormBusy,
    pendingCountLabel: getPendingReviewCountLabel(rating.pendingCount),
    participationDisabled: !rating.isOnline || rating.isSubmittingParticipation,
    participationTitle: getReviewReconnectTitle(
      rating.isOnline,
      "answering the plan check-in",
    ),
    ratingLabel: getRatingLabel(rating.selectedMember),
    shouldShowGate: shouldShowCompletedReviewGate(group, rating),
    showParticipationPrompt:
      rating.canRecordParticipation && rating.participationStatus === null,
    showPendingCount: rating.participationStatus === "PARTICIPATED",
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
  if (group.plan?.status !== "COMPLETED") {
    return false;
  }

  if (rating.isLoading || rating.isError) {
    return true;
  }

  if (rating.canRecordParticipation && rating.participationStatus === null) {
    return true;
  }

  return (
    rating.participationStatus === "PARTICIPATED" && rating.shouldBlockReview
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
