import { useMutation, useQuery } from "@tanstack/react-query";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type { DirectChat } from "@/features/activity/lib/activity-contract";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
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
    toggleBlock,
  };
}
