import { startTransition, useOptimistic, useState } from "react";

import { getRateableReviewMembers } from "@/features/activity/hooks/activity-review-waiting-state";
import { useGroupRatings } from "@/features/activity/hooks/use-group-ratings";
import type {
  Group,
  GroupMember,
} from "@/features/activity/lib/activity-contract";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { warnInDevelopment } from "@/shared/lib/development-warning";
import type {
  CreateRatingPayload,
  ReviewDeferralReason,
} from "@/shared/schemas";

interface ReviewDraft {
  comment: string;
  score: number;
}

const emptyReviewDraft: ReviewDraft = {
  comment: "",
  score: 0,
};

export function useCompletedGroupRating(group: Group) {
  const {
    currentUserId,
    deferReview,
    submittedRatings,
    ratedUserIds,
    pendingUserIds,
    reviewState,
    shouldBlockReview,
    isLoading,
    isError,
    refetch,
    submitRating,
    isDeferring,
    isSubmitting,
  } = useGroupRatings(group.id);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, ReviewDraft>>(
    {},
  );
  const [optimisticRatedUserIds, addOptimisticRatedUser] = useOptimistic(
    ratedUserIds,
    (current, userId: string) => new Set([...current, userId]),
  );

  const rateableMembers = getRateableReviewMembers(
    group.members,
    currentUserId,
  );
  const pendingMembers = getPendingReviewMembers({
    optimisticRatedUserIds,
    pendingUserIds,
    rateableMembers,
  });
  const nextMember = getNextPendingReviewMember({
    optimisticRatedUserIds,
    pendingMembers,
    rateableMembers,
  });
  const activeUserId = getActiveReviewUserId({
    nextMember,
    optimisticRatedUserIds,
    selectedUserId,
  });
  const selectedMember = getSelectedRateableMember(
    rateableMembers,
    activeUserId,
  );
  const allRated = getAllRateableMembersRated(
    rateableMembers,
    optimisticRatedUserIds,
  );
  const currentPlanId = getCurrentReviewPlanId(group, reviewState);
  const activeDraft = getActiveReviewDraft(reviewDrafts, activeUserId);

  const selectMember = (member: GroupMember) => {
    setSelectedUserId(member.userId);
  };

  const setScore = (score: number) => {
    if (!activeUserId) {
      return;
    }

    setReviewDrafts((current) => ({
      ...current,
      [activeUserId]: getUpdatedReviewDraft(current[activeUserId], { score }),
    }));
  };

  const setComment = (comment: string) => {
    if (!activeUserId) {
      return;
    }

    setReviewDrafts((current) => ({
      ...current,
      [activeUserId]: getUpdatedReviewDraft(current[activeUserId], { comment }),
    }));
  };

  const submitActiveRating = () => {
    const ratingPayload = getActiveRatingPayload({
      activeDraft,
      activeUserId,
      currentPlanId,
      groupId: group.id,
    });

    if (!ratingPayload) {
      return;
    }

    if (
      guardOfflineAction({
        id: "activity-group-rating-submit-offline",
        description: "Reconnect before submitting teammate reviews.",
      })
    ) {
      return;
    }

    const reviewedUserId = ratingPayload.rateeId;

    startTransition(async () => {
      addOptimisticRatedUser(reviewedUserId);
      try {
        await submitRating(ratingPayload);
        setSelectedUserId(null);
        setReviewDrafts((current) =>
          removeReviewDraft(current, reviewedUserId),
        );
      } catch (error) {
        warnInDevelopment("Completed group rating submission failed.", error);
      }
    });
  };

  const deferActiveReview = (reason: ReviewDeferralReason) => {
    if (!currentPlanId) {
      return;
    }

    if (
      guardOfflineAction({
        id: "activity-group-review-deferral-offline",
        description: "Reconnect before moving review prompts.",
      })
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await deferReview({
          planId: currentPlanId,
          reason,
        });
      } catch (error) {
        warnInDevelopment("Completed group review deferral failed.", error);
      }
    });
  };

  return {
    activeUserId,
    allRated,
    comment: activeDraft.comment,
    deferActiveReview,
    isError,
    isDeferring,
    isLoading,
    isOnline,
    isSubmitting,
    pendingCount: pendingMembers.length,
    rateableMembers,
    ratedUserIds: optimisticRatedUserIds,
    refetch,
    shouldBlockReview,
    score: activeDraft.score,
    selectMember,
    selectedMember,
    setComment,
    setScore,
    submitActiveRating,
    submittedRatings,
  };
}

function getPendingReviewMembers({
  optimisticRatedUserIds,
  pendingUserIds,
  rateableMembers,
}: {
  optimisticRatedUserIds: ReadonlySet<string>;
  pendingUserIds: ReadonlySet<string>;
  rateableMembers: GroupMember[];
}) {
  if (pendingUserIds.size > 0) {
    return rateableMembers.filter((member) =>
      pendingUserIds.has(member.userId),
    );
  }

  return rateableMembers.filter(
    (member) => !optimisticRatedUserIds.has(member.userId),
  );
}

function getNextPendingReviewMember({
  optimisticRatedUserIds,
  pendingMembers,
  rateableMembers,
}: {
  optimisticRatedUserIds: ReadonlySet<string>;
  pendingMembers: GroupMember[];
  rateableMembers: GroupMember[];
}) {
  return rateableMembers.find(
    (member) =>
      pendingMembers.some((pending) => pending.userId === member.userId) &&
      !optimisticRatedUserIds.has(member.userId),
  );
}

function getActiveReviewUserId({
  nextMember,
  optimisticRatedUserIds,
  selectedUserId,
}: {
  nextMember: GroupMember | undefined;
  optimisticRatedUserIds: ReadonlySet<string>;
  selectedUserId: string | null;
}) {
  if (selectedUserId && !optimisticRatedUserIds.has(selectedUserId)) {
    return selectedUserId;
  }

  return nextMember?.userId ?? null;
}

function getSelectedRateableMember(
  rateableMembers: GroupMember[],
  activeUserId: string | null,
) {
  return (
    rateableMembers.find((member) => member.userId === activeUserId) ?? null
  );
}

function getAllRateableMembersRated(
  rateableMembers: GroupMember[],
  optimisticRatedUserIds: ReadonlySet<string>,
) {
  return (
    rateableMembers.length > 0 &&
    rateableMembers.every((member) => optimisticRatedUserIds.has(member.userId))
  );
}

function getCurrentReviewPlanId(
  group: Group,
  reviewState: ReturnType<typeof useGroupRatings>["reviewState"],
) {
  return reviewState?.currentPlan?.id ?? group.plan?.id ?? null;
}

function getActiveReviewDraft(
  reviewDrafts: Record<string, ReviewDraft>,
  activeUserId: string | null,
) {
  return activeUserId
    ? (reviewDrafts[activeUserId] ?? emptyReviewDraft)
    : emptyReviewDraft;
}

function getUpdatedReviewDraft(
  currentDraft: ReviewDraft | undefined,
  patch: Partial<ReviewDraft>,
): ReviewDraft {
  return {
    ...(currentDraft ?? emptyReviewDraft),
    ...patch,
  };
}

function getActiveRatingPayload({
  activeDraft,
  activeUserId,
  currentPlanId,
  groupId,
}: {
  activeDraft: ReviewDraft;
  activeUserId: string | null;
  currentPlanId: string | null;
  groupId: string;
}): CreateRatingPayload | null {
  if (!activeUserId || !currentPlanId || activeDraft.score === 0) {
    return null;
  }

  return {
    groupId,
    planId: currentPlanId,
    rateeId: activeUserId,
    score: activeDraft.score,
    comment: activeDraft.comment.trim() || undefined,
  };
}

function removeReviewDraft(
  reviewDrafts: Record<string, ReviewDraft>,
  reviewedUserId: string,
) {
  const next = { ...reviewDrafts };
  delete next[reviewedUserId];
  return next;
}
