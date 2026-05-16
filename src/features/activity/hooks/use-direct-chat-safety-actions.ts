import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { ActivityApi } from "@/features/activity/api/activity.api";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import {
  getActivityMutationKey,
  runExclusiveActivityMutation,
} from "@/features/activity/api/activity-mutation-lock";
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
  const blockSubmitPendingRef = useRef(false);
  const muteSubmitPendingRef = useRef(false);
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
      runExclusiveActivityMutation(
        getActivityMutationKey("friendship", targetUserId, "safety"),
        () =>
          action === "block"
            ? ActivityCommands.blockUser(targetUserId)
            : ActivityCommands.unblockUser(targetUserId),
      ),
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
      runExclusiveActivityMutation(
        getActivityMutationKey("chat", chat.id, "muted"),
        () =>
          chat.isMuted
            ? ActivityApi.unmuteChat(chat.id)
            : ActivityApi.muteChat(chat.id),
      ),
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
                  hasUnread: updatedChat.hasUnread,
                  isPinned: updatedChat.isPinned,
                  isMuted: updatedChat.isMuted,
                  unreadCount: updatedChat.unreadCount,
                },
              }
            : current,
      );
    },
    onError: async () => {
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: ACTIVITY_CHATS_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: APP_QUERY_KEYS.activity.directSelectionByChatId(chat.id),
        }),
      ]);
    },
  });

  function toggleBlock() {
    if (!targetUser || mutation.isPending || blockSubmitPendingRef.current) {
      return;
    }

    blockSubmitPendingRef.current = true;
    mutation.mutate(
      {
        action: chat.isBlocked ? "unblock" : "block",
        targetUserId: targetUser.id,
      },
      {
        onSettled: () => {
          blockSubmitPendingRef.current = false;
        },
      },
    );
  }

  function toggleMute() {
    if (muteMutation.isPending || muteSubmitPendingRef.current) {
      return;
    }

    muteSubmitPendingRef.current = true;
    muteMutation.mutate(undefined, {
      onSettled: () => {
        muteSubmitPendingRef.current = false;
      },
    });
  }

  return {
    canToggleBlock: Boolean(targetUser),
    isBlockActionPending: mutation.isPending,
    isMuteActionPending: muteMutation.isPending,
    toggleBlock,
    toggleMute,
  };
}
