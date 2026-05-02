import { startTransition, useMemo, useOptimistic, useState } from "react";

import { useGroupRatings } from "@/features/activity/hooks/use-group-ratings";
import type {
  Group,
  GroupMember,
} from "@/features/activity/lib/activity-contract";

export function useCompletedGroupRating(group: Group) {
  const {
    currentUserId,
    submittedRatings,
    ratedUserIds,
    isLoading,
    isError,
    refetch,
    submitRating,
    isSubmitting,
  } = useGroupRatings(group.id);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
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
  const nextMember = rateableMembers.find(
    (member) => !optimisticRatedUserIds.has(member.userId),
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

  const selectMember = (member: GroupMember) => {
    setSelectedUserId(member.userId);
    setScore(0);
    setComment("");
  };

  const submitActiveRating = () => {
    if (!activeUserId || score === 0) {
      return;
    }

    const ratingPayload = {
      groupId: group.id,
      rateeId: activeUserId,
      score,
      comment: comment.trim() || undefined,
    };

    startTransition(async () => {
      addOptimisticRatedUser(activeUserId);
      try {
        await submitRating(ratingPayload);
        setSelectedUserId(null);
        setScore(0);
        setComment("");
      } catch {
        // TanStack Query owns the user-facing error toast.
      }
    });
  };

  return {
    activeUserId,
    allRated,
    comment,
    isError,
    isLoading,
    isSubmitting,
    rateableMembers,
    ratedUserIds: optimisticRatedUserIds,
    refetch,
    score,
    selectMember,
    selectedMember,
    setComment,
    setScore,
    submitActiveRating,
    submittedRatings,
  };
}
