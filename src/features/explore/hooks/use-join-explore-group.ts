import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { invalidateNotificationSurfaces } from "@/shared/api/query-invalidation";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import { ExploreQueries } from "../api/explore.queries";

export function useJoinExploreGroup(groupId: string) {
  return useMutation({
    meta: {
      telemetryName: trackedMutationNames.exploreJoinGroup,
    },
    mutationKey: ["explore", "join-group", groupId],
    mutationFn: () => ExploreQueries.joinGroup(groupId),
    onSuccess: (result) => {
      trackMutationOutcome(trackedMutationNames.exploreJoinGroup, "success", {
        requestId: result.requestId,
        joinStatus: result.data.status,
      });
      toast.success(
        result.data.status === "REQUESTED"
          ? "Join request sent."
          : "You joined the group.",
      );
    },
    onError: (error) => {
      trackMutationOutcome(trackedMutationNames.exploreJoinGroup, "error", {
        groupId,
      });
      toast.error(
        getApiErrorMessage(error, "We couldn't join that group right now."),
      );
    },
    onSettled: async () => {
      await invalidateNotificationSurfaces();
    },
  });
}
