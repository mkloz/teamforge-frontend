import { useMutation } from "@tanstack/react-query";
import { HomeCommands } from "@/features/home/api/home-commands";
import { invalidateNotificationSurfaces } from "@/shared/api/query-invalidation";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export function useJoinHomeRecommendedGroup(groupId: string) {
  return useMutation({
    meta: {
      errorToastMessage: "We couldn't join that group right now.",
      telemetryName: trackedMutationNames.exploreJoinGroup,
    },
    mutationKey: ["home", "recommended-group", "join", groupId],
    mutationFn: () => HomeCommands.joinRecommendedGroup(groupId),
    onSuccess: (result) => {
      trackMutationOutcome(trackedMutationNames.exploreJoinGroup, "success", {
        requestId: result.requestId,
        joinStatus: result.data.status,
      });
    },
    onError: (_error) => {
      trackMutationOutcome(trackedMutationNames.exploreJoinGroup, "error", {
        groupId,
      });
    },
    onSettled: async () => {
      await invalidateNotificationSurfaces();
    },
  });
}
