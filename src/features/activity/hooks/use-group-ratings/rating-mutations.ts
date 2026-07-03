import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type { RatingMutationResult } from "@/features/activity/hooks/use-group-ratings/rating-types";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type { CreateRatingPayload } from "@/shared/schemas";

export function getCreateRatingMutationOptions(groupId: string) {
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

export function getDeferReviewMutationOptions(groupId: string) {
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
