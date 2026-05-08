import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { HomeCommands } from "@/features/home/api/home-commands";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";

export function useHomeInvitationActions() {
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    mutateAsync: acceptInvite,
    isPending: isAccepting,
    variables: acceptingInviteId,
  } = useMutation({
    mutationKey: ["home", "invitation", "accept"],
    mutationFn: (inviteId: string) => HomeCommands.acceptInvitation(inviteId),
  });

  const {
    mutateAsync: declineInvite,
    isPending: isDeclining,
    variables: decliningInviteId,
  } = useMutation({
    mutationKey: ["home", "invitation", "decline"],
    mutationFn: (inviteId: string) => HomeCommands.declineInvitation(inviteId),
  });

  async function acceptInvitation(inviteId: string) {
    setActionError(null);

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
  };
}
