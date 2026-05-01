import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { invalidateNotificationSurfaces } from "@/shared/api/query-invalidation";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { HomeQueries } from "../api/home.queries";

export function useHomeInvitationActions() {
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    mutateAsync: acceptInvite,
    isPending: isAccepting,
    variables: acceptingInviteId,
  } = useMutation({
    mutationKey: ["home", "invitation", "accept"],
    mutationFn: HomeQueries.acceptInvitation,
    onSettled: async () => {
      await invalidateNotificationSurfaces();
    },
  });

  const {
    mutateAsync: declineInvite,
    isPending: isDeclining,
    variables: decliningInviteId,
  } = useMutation({
    mutationKey: ["home", "invitation", "decline"],
    mutationFn: HomeQueries.declineInvitation,
    onSettled: async () => {
      await invalidateNotificationSurfaces();
    },
  });

  const acceptInvitation = useCallback(
    async (inviteId: string) => {
      setActionError(null);

      try {
        return await acceptInvite(inviteId);
      } catch (error) {
        setActionError(
          getApiErrorMessage(
            error,
            "We couldn't accept that invite right now.",
          ),
        );
        throw error;
      }
    },
    [acceptInvite],
  );

  const declineInvitation = useCallback(
    async (inviteId: string) => {
      setActionError(null);

      try {
        return await declineInvite(inviteId);
      } catch (error) {
        setActionError(
          getApiErrorMessage(
            error,
            "We couldn't decline that invite right now.",
          ),
        );
        throw error;
      }
    },
    [declineInvite],
  );

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
