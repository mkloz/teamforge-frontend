import { useMutation, useQuery } from "@tanstack/react-query";
import { SettingsCache } from "@/features/settings/api/settings-cache";
import { SettingsCommands } from "@/features/settings/api/settings-commands";
import { SettingsQueryFactory } from "@/features/settings/api/settings-query-factory";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export function useSettingsBlockedUsers(enabled: boolean) {
  const blockedUsersQuery = useQuery({
    ...SettingsQueryFactory.blockedUsers(),
    enabled,
  });

  const unblockMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't unblock that user right now.",
      telemetryName: trackedMutationNames.settingsUnblockUser,
    },
    mutationFn: (userId: string) => SettingsCommands.unblockUser(userId),
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

      await SettingsCache.invalidateBlockedUserSurfaces();
    },
    onError: (_error, _userId, context) => {
      trackMutationOutcome(trackedMutationNames.settingsUnblockUser, "error");
      SettingsCache.restoreBlockedUsers(context?.previousBlockedUsers);
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
