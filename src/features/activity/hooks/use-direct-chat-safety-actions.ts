import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { toast } from "sonner";

import { AuthQueries } from "@/features/auth/api/auth.queries";
import {
  activityKindValues,
  activityPanelValues,
} from "@/shared/lib/activity-route";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

import { ActivityQueries } from "../api/activity.queries";
import type { DirectChat } from "../lib/activity-contract";

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
  const currentUserQuery = useQuery(AuthQueries.currentUser());
  const [, setRouteState] = useQueryStates(
    {
      kind: parseAsStringLiteral(activityKindValues),
      id: parseAsString,
      panel: parseAsStringLiteral(activityPanelValues),
      plan: parseAsString,
      proposal: parseAsString,
      message: parseAsString,
    },
    {
      history: "replace",
    },
  );

  const targetUser = useMemo(() => {
    if (!currentUserQuery.data) {
      return null;
    }

    return (
      chat.participants?.find(
        (participant) => participant.userId !== currentUserQuery.data.id,
      )?.user ?? null
    );
  }, [chat.participants, currentUserQuery.data]);

  const mutation = useMutation({
    mutationFn: ({ action, targetUserId }: DirectChatSafetyMutationInput) =>
      action === "block"
        ? ActivityQueries.blockUser(targetUserId)
        : ActivityQueries.unblockUser(targetUserId),
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
      await setRouteState({
        id: null,
        kind: null,
        message: null,
        panel: null,
        plan: null,
        proposal: null,
      });
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
