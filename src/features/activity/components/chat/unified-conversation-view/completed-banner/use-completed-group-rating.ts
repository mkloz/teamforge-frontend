import { startTransition, useMemo, useOptimistic, useState } from "react";

import { useGroupRatings } from "@/features/activity/hooks/use-group-ratings";
import type {
  Group,
  GroupMember,
} from "@/features/activity/lib/activity-contract";
import { warnInDevelopment } from "@/shared/lib/development-warning";
import type { ReviewDeferralReason } from "@/shared/schemas";

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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, ReviewDraft>>(
    {},
  );
  const [optimisticRatedUserIds, addOptimisticRatedUser] = useOptimistic(
    ratedUserIds,
    (current, userId: string) => new Set([...current, userId]),
  );

  const rateableMembers = useMemo(
    () =>
      (group.members ?? [])
        .filter((member) => member.leftAt === null)
        .filter((member) => member.userId !== currentUserId)
        .filter((member) => member.user !== undefined),
    [currentUserId, group.members],
  );
  const pendingMembers = useMemo(
    () =>
      pendingUserIds.size > 0
        ? rateableMembers.filter((member) => pendingUserIds.has(member.userId))
        : rateableMembers.filter(
            (member) => !optimisticRatedUserIds.has(member.userId),
          ),
    [optimisticRatedUserIds, pendingUserIds, rateableMembers],
  );
  const nextMember = rateableMembers.find(
    (member) =>
      pendingMembers.some((pending) => pending.userId === member.userId) &&
      !optimisticRatedUserIds.has(member.userId),
  );
  const activeUserId =
    selectedUserId && !optimisticRatedUserIds.has(selectedUserId)
      ? selectedUserId
      : (nextMember?.userId ?? null);
  const selectedMember =
    rateableMembers.find((member) => member.userId === activeUserId) ?? null;
  const allRated =
    rateableMembers.length > 0 &&
    rateableMembers.every((member) =>
      optimisticRatedUserIds.has(member.userId),
    );
  const currentPlanId = reviewState?.currentPlan?.id ?? group.plan?.id ?? null;
  const activeDraft = activeUserId
    ? (reviewDrafts[activeUserId] ?? emptyReviewDraft)
    : emptyReviewDraft;

  const selectMember = (member: GroupMember) => {
    setSelectedUserId(member.userId);
  };

  const setScore = (score: number) => {
    if (!activeUserId) {
      return;
    }

    setReviewDrafts((current) => ({
      ...current,
      [activeUserId]: {
        ...(current[activeUserId] ?? emptyReviewDraft),
        score,
      },
    }));
  };

  const setComment = (comment: string) => {
    if (!activeUserId) {
      return;
    }

    setReviewDrafts((current) => ({
      ...current,
      [activeUserId]: {
        ...(current[activeUserId] ?? emptyReviewDraft),
        comment,
      },
    }));
  };

  const submitActiveRating = () => {
    if (!activeUserId || activeDraft.score === 0) {
      return;
    }

    const reviewedUserId = activeUserId;
    const submittedDraft = activeDraft;
    const ratingPayload = {
      groupId: group.id,
      rateeId: reviewedUserId,
      score: submittedDraft.score,
      comment: submittedDraft.comment.trim() || undefined,
    };

    startTransition(async () => {
      addOptimisticRatedUser(reviewedUserId);
      try {
        await submitRating(ratingPayload);
        setSelectedUserId(null);
        setReviewDrafts((current) => {
          const next = { ...current };
          delete next[reviewedUserId];
          return next;
        });
      } catch (error) {
        warnInDevelopment("Completed group rating submission failed.", error);
      }
    });
  };

  const deferActiveReview = (reason: ReviewDeferralReason) => {
    if (!currentPlanId) {
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
