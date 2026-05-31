import { useMutation } from "@tanstack/react-query";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export function useJoinExploreGroup(groupId: string) {
  return useMutation({
    meta: {
      errorToastMessage: "We couldn't join that group right now.",
      telemetryName: trackedMutationNames.exploreJoinGroup,
    },
    mutationKey: ["explore", "join-group", groupId],
    mutationFn: async () => {
      const { ExploreCommands } = await import(
        "@/features/explore/api/explore-commands"
      );

      return ExploreCommands.joinGroup(groupId);
    },
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
      const { invalidateNotificationSurfaces } = await import(
        "@/shared/api/query-invalidation"
      );

      await invalidateNotificationSurfaces();
    },
  });
}
