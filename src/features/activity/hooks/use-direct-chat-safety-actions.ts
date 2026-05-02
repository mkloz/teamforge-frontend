import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type { DirectChat } from "@/features/activity/lib/activity-contract";
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
    mutationFn: ({ action, targetUserId }: DirectChatSafetyMutationInput) =>
      action === "block"
        ? ActivityCommands.blockUser(targetUserId)
        : ActivityCommands.unblockUser(targetUserId),
    onSuccess: async (result, { action }) => {
      trackMutationOutcome(getSafetyMutationName(action), "success", {
        chatId: chat.id,
        requestId: result.requestId,
      });

      if (action === "block") {
        toast.success("User blocked.");
        return;
      }

      toast.success("User unblocked.");
      await clearRouteSelection();
    },
    onError: (error, { action }) => {
      trackMutationOutcome(getSafetyMutationName(action), "error", {
        chatId: chat.id,
      });
      toast.error(
        getApiErrorMessage(
          error,
          action === "block"
            ? "We couldn't block that user right now."
            : "We couldn't unblock that user right now.",
        ),
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
    toggleBlock,
  };
}
