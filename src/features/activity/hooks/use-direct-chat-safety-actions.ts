import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityApi } from "@/features/activity/api/activity.api";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type { ActivityDirectSelectionData } from "@/features/activity/api/activity-query-data";
import { ACTIVITY_CHATS_QUERY_KEY } from "@/features/activity/api/activity-query-keys";
import type { DirectChat } from "@/features/activity/lib/activity-contract";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import type { ChatApi } from "@/shared/schemas";
import { useClearActivityRouteSelection } from "./use-clear-activity-route-selection";

type DirectChatSafetyAction = "block" | "unblock";

interface DirectChatSafetyMutationInput {
  action: DirectChatSafetyAction;
  targetUserId: string;
}

function getSafetyMutationName(action: DirectChatSafetyAction) {
  return action === "block"
    ? trackedMutationNames.activityBlockUser
    : trackedMutationNames.activityUnblockUser;
}

export function useDirectChatSafetyActions(chat: DirectChat) {
  const queryClient = useQueryClient();
  const currentUserQuery = useQuery(currentUserQueryOptions());
  const clearRouteSelection = useClearActivityRouteSelection();

  const targetUser = currentUserQuery.data
    ? (chat.participants?.find(
        (participant) => participant.userId !== currentUserQuery.data.id,
      )?.user ?? null)
    : null;

  const mutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't update that safety setting right now.",
    },
    mutationFn: ({ action, targetUserId }: DirectChatSafetyMutationInput) =>
      action === "block"
        ? ActivityCommands.blockUser(targetUserId)
        : ActivityCommands.unblockUser(targetUserId),
    onSuccess: async (result, { action }) => {
      trackMutationOutcome(getSafetyMutationName(action), "success", {
        chatId: chat.id,
        requestId: result.requestId,
      });

      if (action === "unblock") {
        await clearRouteSelection();
      }
    },
    onError: (_error, { action }) => {
      trackMutationOutcome(getSafetyMutationName(action), "error", {
        chatId: chat.id,
      });
    },
  });
  const muteMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't update notifications for this chat.",
    },
    mutationFn: () =>
      chat.isMuted
        ? ActivityApi.unmuteChat(chat.id)
        : ActivityApi.muteChat(chat.id),
    onSuccess: (updatedChat) => {
      queryClient.setQueryData<ChatApi[]>(
        ACTIVITY_CHATS_QUERY_KEY,
        (current) =>
          current?.map((item) =>
            item.id === updatedChat.id ? { ...item, ...updatedChat } : item,
          ) ?? current,
      );
      queryClient.setQueryData<ActivityDirectSelectionData>(
        APP_QUERY_KEYS.activity.directSelectionByChatId(updatedChat.id),
        (current) =>
          current?.chat
            ? {
                ...current,
                chat: {
                  ...current.chat,
                  isMuted: updatedChat.isMuted,
                },
              }
            : current,
      );
    },
  });

  function toggleBlock() {
    if (!targetUser) {
      return;
    }

    mutation.mutate({
      action: chat.isBlocked ? "unblock" : "block",
      targetUserId: targetUser.id,
    });
  }

  return {
    canToggleBlock: Boolean(targetUser),
    isBlockActionPending: mutation.isPending,
    isMuteActionPending: muteMutation.isPending,
    toggleBlock,
    toggleMute: () => muteMutation.mutate(),
  };
}
