import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type { RatingMutationResult } from "@/features/activity/hooks/use-group-ratings/rating-types";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type {
  CreateRatingPayload,
  RecordGroupParticipationPayload,
} from "@/shared/schemas";

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
    onSuccess: (result: RatingMutationResult) => {
      trackRatingSubmitSuccess(result);
    },
    onError: () => {
      trackRatingSubmitError();
    },
  };
}

export function getDeferReviewMutationOptions(groupId: string) {
  return {
    meta: {
      errorToastMessage: "We couldn't save that review choice right now.",
    },
    mutationFn: ActivityCommands.deferGroupReview.bind(null, groupId),
  };
}

export function getRecordParticipationMutationOptions(groupId: string) {
  return {
    meta: {
      errorToastMessage: "We couldn't save your answer right now.",
    },
    mutationFn: (payload: RecordGroupParticipationPayload) =>
      ActivityCommands.recordGroupParticipation(groupId, payload),
  };
}

function trackRatingSubmitSuccess(result: RatingMutationResult) {
  trackMutationOutcome(
    trackedMutationNames.activityGroupRatingSubmit,
    "success",
    {
      requestId: result.requestId,
    },
  );
}

function trackRatingSubmitError() {
  trackMutationOutcome(trackedMutationNames.activityGroupRatingSubmit, "error");
}
