import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type { CreateRatingPayload, GroupReviewState } from "@/shared/schemas";

interface RatingSummary {
  planId: string | null;
  rateeId: string;
  raterId: string;
}

type RatingMutationResult = Awaited<
  ReturnType<typeof ActivityCommands.createGroupRating>
>;

interface RefetchableQuery {
  refetch: () => Promise<unknown>;
}

export function useGroupRatings(groupId: string) {
  const { data: currentUser } = useCurrentUserQuery();
  const ratingsQuery = useQuery(ActivityQueryFactory.groupRatings(groupId));
  const reviewStateQuery = useQuery(
    ActivityQueryFactory.groupReviewState(groupId),
  );
  const currentUserId = getCurrentUserId(currentUser);
  const reviewState = reviewStateQuery.data;
  const currentPlanId = getCurrentPlanId(reviewState);
  const submittedRateeIds = getSubmittedRateeIds(reviewState);
  const pendingRateeIds = getPendingRateeIds(reviewState);

  const createRatingMutation = useMutation(
    getCreateRatingMutationOptions(groupId),
  );
  const deferReviewMutation = useMutation(
    getDeferReviewMutationOptions(groupId),
  );

  const submittedRatings = useMemo(() => {
    return getSubmittedRatings({
      currentPlanId,
      currentUserId,
      ratings: ratingsQuery.data,
    });
  }, [currentPlanId, currentUserId, ratingsQuery.data]);
  const ratedUserIds = useMemo(
    () =>
      getRatedUserIds({
        submittedRateeIds,
        submittedRatings,
      }),
    [submittedRateeIds, submittedRatings],
  );
  const pendingUserIds = useMemo(
    () => getPendingUserIds(pendingRateeIds),
    [pendingRateeIds],
  );
  const queryState = getGroupRatingsQueryState({
    ratingsQuery,
    reviewStateQuery,
  });

  return {
    currentUserId,
    deferReview: deferReviewMutation.mutateAsync,
    isDeferring: deferReviewMutation.isPending,
    submittedRatings,
    ratedUserIds,
    pendingUserIds,
    reviewState: getReviewStateValue(reviewState),
    shouldBlockReview: getShouldBlockReview(reviewState),
    isLoading: queryState.isLoading,
    isError: queryState.isError,
    refetch: () =>
      refetchGroupRatingData({
        ratingsQuery,
        reviewStateQuery,
      }),
    submitRating: createRatingMutation.mutateAsync,
    isSubmitting: createRatingMutation.isPending,
  };
}

function getCurrentUserId(currentUser: { id: string } | null | undefined) {
  return currentUser?.id ?? null;
}

function getCurrentPlanId(reviewState: GroupReviewState | undefined) {
  return reviewState?.currentPlan?.id;
}

function getSubmittedRateeIds(reviewState: GroupReviewState | undefined) {
  return reviewState?.submittedRateeIds;
}

function getPendingRateeIds(reviewState: GroupReviewState | undefined) {
  return reviewState?.pendingRateeIds;
}

function getReviewStateValue(reviewState: GroupReviewState | undefined) {
  return reviewState ?? null;
}

function getShouldBlockReview(reviewState: GroupReviewState | undefined) {
  return reviewState?.shouldBlockReview ?? false;
}

function getCreateRatingMutationOptions(groupId: string) {
  return {
    meta: {
      errorToastConflictMessage:
        "You've already rated this person for this group.",
      errorToastMessage: "We couldn't submit that rating right now.",
      telemetryName: trackedMutationNames.activityGroupRatingSubmit,
    },
    mutationFn: (payload: CreateRatingPayload) =>
      ActivityCommands.createGroupRating(groupId, payload),
    onSuccess: (result: RatingMutationResult, payload: CreateRatingPayload) => {
      trackRatingSubmitSuccess(groupId, payload, result);
    },
    onError: (_error: unknown, payload: CreateRatingPayload) => {
      trackRatingSubmitError(groupId, payload);
    },
  };
}

function getDeferReviewMutationOptions(groupId: string) {
  return {
    meta: {
      errorToastMessage: "We couldn't move that review prompt right now.",
    },
    mutationFn: ActivityCommands.deferGroupReview.bind(null, groupId),
  };
}

function trackRatingSubmitSuccess(
  groupId: string,
  payload: CreateRatingPayload,
  result: RatingMutationResult,
) {
  trackMutationOutcome(
    trackedMutationNames.activityGroupRatingSubmit,
    "success",
    {
      groupId,
      score: payload.score,
      requestId: result.requestId,
      updatedTrustScore: result.data.updatedTrustScore,
    },
  );
}

function trackRatingSubmitError(groupId: string, payload: CreateRatingPayload) {
  trackMutationOutcome(
    trackedMutationNames.activityGroupRatingSubmit,
    "error",
    {
      groupId,
      score: payload.score,
    },
  );
}

function getSubmittedRatings({
  currentPlanId,
  currentUserId,
  ratings,
}: {
  currentPlanId: string | undefined;
  currentUserId: string | null;
  ratings: RatingSummary[] | undefined;
}) {
  return (
    ratings?.filter(
      (rating) =>
        rating.raterId === currentUserId &&
        (!currentPlanId || rating.planId === currentPlanId),
    ) ?? []
  );
}

function getRatedUserIds({
  submittedRateeIds,
  submittedRatings,
}: {
  submittedRateeIds: GroupReviewState["submittedRateeIds"] | undefined;
  submittedRatings: RatingSummary[];
}) {
  return new Set(
    submittedRateeIds ?? submittedRatings.map((rating) => rating.rateeId),
  );
}

function getPendingUserIds(
  pendingRateeIds: GroupReviewState["pendingRateeIds"] | undefined,
) {
  return new Set(pendingRateeIds ?? []);
}

function getGroupRatingsQueryState({
  ratingsQuery,
  reviewStateQuery,
}: {
  ratingsQuery: { isError: boolean; isLoading: boolean };
  reviewStateQuery: { isError: boolean; isLoading: boolean };
}) {
  return {
    isError: ratingsQuery.isError || reviewStateQuery.isError,
    isLoading: ratingsQuery.isLoading || reviewStateQuery.isLoading,
  };
}

async function refetchGroupRatingData({
  ratingsQuery,
  reviewStateQuery,
}: {
  ratingsQuery: RefetchableQuery;
  reviewStateQuery: RefetchableQuery;
}) {
  await Promise.all([ratingsQuery.refetch(), reviewStateQuery.refetch()]);
}
