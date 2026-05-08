import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { SettingsCache } from "@/features/settings/api/settings-cache";
import { SettingsCommands } from "@/features/settings/api/settings-commands";
import { SettingsQueryFactory } from "@/features/settings/api/settings-query-factory";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export function useSettingsBlockedUsers(enabled: boolean) {
  const blockedUsersQuery = useQuery({
    ...SettingsQueryFactory.blockedUsers(),
    enabled,
  });

  const unblockMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.settingsUnblockUser,
    },
    mutationFn: SettingsCommands.unblockUser,
    onMutate: async (userId) => {
      await SettingsCache.cancelBlockedUsers();

      const previousBlockedUsers = SettingsCache.getBlockedUsersSnapshot();
      SettingsCache.removeBlockedUser(userId);

      return { previousBlockedUsers };
    },
    onSuccess: async (result) => {
      trackMutationOutcome(
        trackedMutationNames.settingsUnblockUser,
        "success",
        {
          requestId: result.requestId,
        },
      );
      toast.success("User unblocked.");

      await SettingsCache.invalidateBlockedUserSurfaces();
    },
    onError: (error, _userId, context) => {
      trackMutationOutcome(trackedMutationNames.settingsUnblockUser, "error");
      SettingsCache.restoreBlockedUsers(context?.previousBlockedUsers);
      toast.error(
        getApiErrorMessage(error, "We couldn't unblock that user right now."),
      );
    },
  });

  return {
    blockedUsers: blockedUsersQuery.data ?? [],
    isLoadingBlockedUsers: blockedUsersQuery.isLoading,
    blockedUsersError: blockedUsersQuery.isError
      ? "We couldn't load your blocked users right now."
      : null,
    unblockBlockedUser: (userId: string) => unblockMutation.mutateAsync(userId),
    unblockingBlockedUserId: unblockMutation.isPending
      ? (unblockMutation.variables ?? null)
      : null,
  };
}
