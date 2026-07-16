import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import type { DirectChat } from "@/features/activity/lib/activity-contract";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import {
  DIRECT_CHAT_MUTE_ACTION_GUARD,
  DIRECT_CHAT_SAFETY_ACTION_GUARD,
  getDirectChatSafetyTargetUser,
  getNextDirectChatSafetyAction,
  invalidateDirectChatMuteQueries,
  optimisticallyToggleDirectChatMute,
  restoreDirectChatMuteSnapshot,
  runDirectChatMuteMutation,
  runDirectChatSafetyMutation,
  shouldClearSelectionAfterSafetyAction,
  shouldSkipDirectChatMuteAction,
  shouldSkipDirectChatSafetyAction,
  syncDirectChatMuteResult,
  trackDirectChatSafetyMutation,
} from "./direct-chat-safety-action-state";
import { useClearActivityRouteSelection } from "./use-clear-activity-route-selection";

export function useDirectChatSafetyActions(chat: DirectChat) {
  const queryClient = useQueryClient();
  const blockSubmitPendingRef = useRef(false);
  const muteSubmitPendingRef = useRef(false);
  const currentUserQuery = useQuery(currentUserQueryOptions());
  const clearRouteSelection = useClearActivityRouteSelection();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  const targetUser = getDirectChatSafetyTargetUser(
    chat,
    currentUserQuery.data?.id,
  );

  const mutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't change that block setting right now.",
    },
    mutationFn: runDirectChatSafetyMutation,
    onSuccess: async (result, { action }) => {
      trackDirectChatSafetyMutation(
        action,
        "success",
        chat.id,
        result.requestId,
      );

      if (shouldClearSelectionAfterSafetyAction(action)) {
        await clearRouteSelection();
      }
    },
    onError: (_error, { action }) => {
      trackDirectChatSafetyMutation(action, "error", chat.id);
    },
  });
  const muteMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't update notifications for this chat.",
    },
    mutationFn: () => runDirectChatMuteMutation(chat),
    onMutate: () => optimisticallyToggleDirectChatMute(queryClient, chat),
    onSuccess: (updatedChat) => {
      syncDirectChatMuteResult(queryClient, updatedChat);
    },
    onError: async (_error, _variables, context) => {
      restoreDirectChatMuteSnapshot(queryClient, chat.id, context);
    },
    onSettled: async () => {
      await invalidateDirectChatMuteQueries(queryClient, chat.id);
    },
  });

  function toggleBlock() {
    if (
      shouldSkipDirectChatSafetyAction({
        isPending: mutation.isPending,
        isSubmitPending: blockSubmitPendingRef.current,
        targetUser,
      })
    ) {
      return;
    }

    if (!targetUser) {
      return;
    }

    if (guardOfflineAction(DIRECT_CHAT_SAFETY_ACTION_GUARD)) {
      return;
    }

    const safetyTargetUser = targetUser;

    blockSubmitPendingRef.current = true;
    mutation.mutate(
      {
        action: getNextDirectChatSafetyAction(chat),
        targetUserId: safetyTargetUser.id,
      },
      {
        onSettled: () => {
          blockSubmitPendingRef.current = false;
        },
      },
    );
  }

  function toggleMute() {
    if (
      shouldSkipDirectChatMuteAction({
        isPending: muteMutation.isPending,
        isSubmitPending: muteSubmitPendingRef.current,
      })
    ) {
      return;
    }

    if (guardOfflineAction(DIRECT_CHAT_MUTE_ACTION_GUARD)) {
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
    canToggleBlock: Boolean(targetUser) && isOnline,
    isOnline,
    isBlockActionPending: mutation.isPending,
    isMuteActionDisabled: !isOnline,
    isMuteActionPending: muteMutation.isPending,
    toggleBlock,
    toggleMute,
  };
}
