import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  ACTIVITY_CHATS_QUERY_KEY,
  ACTIVITY_DIRECT_SELECTION_QUERY_KEY,
  ACTIVITY_FRIENDSHIPS_QUERY_KEY,
} from "@/features/activity/api/activity-query-keys";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type { FriendshipApi } from "@/shared/schemas";

import { SettingsQueries } from "../api/settings.queries";

const SETTINGS_BLOCKED_USERS_QUERY_KEY = ["settings", "blocked-users"] as const;

function removeBlockedUser(
  blockedUsers: FriendshipApi[] | undefined,
  userId: string,
) {
  return (
    blockedUsers?.filter(
      (friendship) =>
        friendship.counterpart.id !== userId &&
        friendship.receiverId !== userId,
    ) ?? []
  );
}

export function useSettingsBlockedUsers(enabled: boolean) {
  const queryClient = useQueryClient();
  const blockedUsersQuery = useQuery({
    queryKey: SETTINGS_BLOCKED_USERS_QUERY_KEY,
    queryFn: SettingsQueries.getBlockedUsers,
    enabled,
    staleTime: 30_000,
  });

  const unblockMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.settingsUnblockUser,
    },
    mutationFn: SettingsQueries.unblockUser,
    onMutate: async (userId) => {
      await queryClient.cancelQueries({
        queryKey: SETTINGS_BLOCKED_USERS_QUERY_KEY,
      });

      const previousBlockedUsers = queryClient.getQueryData<FriendshipApi[]>(
        SETTINGS_BLOCKED_USERS_QUERY_KEY,
      );

      queryClient.setQueryData<FriendshipApi[]>(
        SETTINGS_BLOCKED_USERS_QUERY_KEY,
        removeBlockedUser(previousBlockedUsers, userId),
      );

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

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: SETTINGS_BLOCKED_USERS_QUERY_KEY,
        }),
        queryClient.invalidateQueries({
          queryKey: ACTIVITY_FRIENDSHIPS_QUERY_KEY,
        }),
        queryClient.invalidateQueries({
          queryKey: ACTIVITY_CHATS_QUERY_KEY,
        }),
        queryClient.invalidateQueries({
          queryKey: ACTIVITY_DIRECT_SELECTION_QUERY_KEY,
        }),
      ]);
    },
    onError: (error, _userId, context) => {
      trackMutationOutcome(trackedMutationNames.settingsUnblockUser, "error");
      queryClient.setQueryData(
        SETTINGS_BLOCKED_USERS_QUERY_KEY,
        context?.previousBlockedUsers,
      );
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
