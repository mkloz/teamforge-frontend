import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { HomeCache } from "@/features/home/api/home-cache";
import { HomeCommands } from "@/features/home/api/home-commands";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";

interface InvitationMutationContext {
  previousInvitations: ReturnType<typeof HomeCache.getInvitationsSnapshot>;
}

export function useHomeInvitationActions() {
  const [actionError, setActionError] = useState<string | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  const {
    mutateAsync: acceptInvite,
    isPending: isAccepting,
    variables: acceptingInviteId,
  } = useMutation({
    meta: {
      errorToastMessage: "We couldn't accept that invite right now.",
    },
    mutationKey: ["home", "invitation", "accept"],
    mutationFn: (inviteId: string) => HomeCommands.acceptInvitation(inviteId),
    onMutate: async (inviteId) => {
      await HomeCache.cancelInvitations();

      const previousInvitations = HomeCache.getInvitationsSnapshot();
      HomeCache.removeInvitation(inviteId);

      return { previousInvitations } satisfies InvitationMutationContext;
    },
    onError: (_error, _inviteId, context) => {
      HomeCache.restoreInvitations(context?.previousInvitations);
    },
  });

  const {
    mutateAsync: declineInvite,
    isPending: isDeclining,
    variables: decliningInviteId,
  } = useMutation({
    meta: {
      errorToastMessage: "We couldn't decline that invite right now.",
    },
    mutationKey: ["home", "invitation", "decline"],
    mutationFn: (inviteId: string) => HomeCommands.declineInvitation(inviteId),
    onMutate: async (inviteId) => {
      await HomeCache.cancelInvitations();

      const previousInvitations = HomeCache.getInvitationsSnapshot();
      HomeCache.removeInvitation(inviteId);

      return { previousInvitations } satisfies InvitationMutationContext;
    },
    onError: (_error, _inviteId, context) => {
      HomeCache.restoreInvitations(context?.previousInvitations);
    },
  });

  async function acceptInvitation(inviteId: string) {
    setActionError(null);

    if (
      guardOfflineAction({
        id: "home-invite-accept-offline",
        description: "Reconnect before accepting this invite.",
      })
    ) {
      setActionError("You are offline. Reconnect before accepting invites.");
      return null;
    }

    try {
      return await acceptInvite(inviteId);
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "We couldn't accept that invite right now."),
      );
      throw error;
    }
  }

  async function declineInvitation(inviteId: string) {
    setActionError(null);

    if (
      guardOfflineAction({
        id: "home-invite-decline-offline",
        description: "Reconnect before declining this invite.",
      })
    ) {
      setActionError("You are offline. Reconnect before declining invites.");
      return null;
    }

    try {
      return await declineInvite(inviteId);
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "We couldn't decline that invite right now."),
      );
      throw error;
    }
  }

  return {
    acceptInvitation,
    declineInvitation,
    isAccepting,
    isDeclining,
    acceptingInviteId: acceptingInviteId ?? null,
    decliningInviteId: decliningInviteId ?? null,
    actionError,
    clearActionError: () => setActionError(null),
    isOnline,
  };
}
