import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { HomeQueries } from "../api/home.queries";

export function useHomeInvitationActions() {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const acceptMutation = useMutation({
    mutationKey: ["home", "invitation", "accept"],
    mutationFn: HomeQueries.acceptInvitation,
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });

  const declineMutation = useMutation({
    mutationKey: ["home", "invitation", "decline"],
    mutationFn: HomeQueries.declineInvitation,
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });

  const acceptInvitation = useCallback(
    async (inviteId: string) => {
      setActionError(null);

      try {
        return await acceptMutation.mutateAsync(inviteId);
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
    [acceptMutation],
  );

  const declineInvitation = useCallback(
    async (inviteId: string) => {
      setActionError(null);

      try {
        return await declineMutation.mutateAsync(inviteId);
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
    [declineMutation],
  );

  return {
    acceptInvitation,
    declineInvitation,
    isAccepting: acceptMutation.isPending,
    isDeclining: declineMutation.isPending,
    acceptingInviteId: acceptMutation.variables ?? null,
    decliningInviteId: declineMutation.variables ?? null,
    actionError,
    clearActionError: () => setActionError(null),
  };
}
