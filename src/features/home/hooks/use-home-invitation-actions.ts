import { useMutation, useQueryClient } from "@tanstack/react-query";

import { HomeQueries } from "../api/home.queries";

export function useHomeInvitationActions() {
  const queryClient = useQueryClient();

  const invalidateRelatedQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["home"] }),
      queryClient.invalidateQueries({ queryKey: ["groups"] }),
      queryClient.invalidateQueries({ queryKey: ["explore-groups"] }),
    ]);
  };

  const acceptMutation = useMutation({
    mutationKey: ["home", "invitation", "accept"],
    mutationFn: HomeQueries.acceptInvitation,
    onSuccess: invalidateRelatedQueries,
  });

  const declineMutation = useMutation({
    mutationKey: ["home", "invitation", "decline"],
    mutationFn: HomeQueries.declineInvitation,
    onSuccess: invalidateRelatedQueries,
  });

  return {
    acceptInvitation: acceptMutation.mutateAsync,
    declineInvitation: declineMutation.mutateAsync,
    isAccepting: acceptMutation.isPending,
    isDeclining: declineMutation.isPending,
    acceptingInviteId: acceptMutation.variables ?? null,
    decliningInviteId: declineMutation.variables ?? null,
  };
}
