import { useMutation } from "@tanstack/react-query";
import { HomeCache } from "@/features/home/api/home-cache";
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
    onMutate: async () => {
      await HomeCache.cancelRecommendations();

      const previousRecommendations = HomeCache.getRecommendationsSnapshot();
      HomeCache.removeRecommendedGroup(groupId);

      return { previousRecommendations };
    },
    onSuccess: (result) => {
      trackMutationOutcome(trackedMutationNames.exploreJoinGroup, "success", {
        requestId: result.requestId,
        joinStatus: result.data.status,
      });
    },
    onError: (_error, _variables, context) => {
      HomeCache.restoreRecommendations(context?.previousRecommendations);
      trackMutationOutcome(trackedMutationNames.exploreJoinGroup, "error", {
        groupId,
      });
    },
    onSettled: async () => {
      await invalidateNotificationSurfaces();
    },
  });
}
