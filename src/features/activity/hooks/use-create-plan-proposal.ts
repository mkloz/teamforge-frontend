import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { CreatePlanProposalDto } from "@/features/activity/api/activity.api";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type { Plan } from "@/features/activity/lib/activity-contract";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";

interface UseCreatePlanProposalOptions {
  onCreated?: () => void;
}

export function useCreatePlanProposal(
  plan: Plan,
  { onCreated }: UseCreatePlanProposalOptions = {},
) {
  const [error, setError] = useState<string | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const createMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't submit that proposal. Please try again.",
    },
    mutationKey: ["activity", "proposal", "create", plan.id],
    mutationFn: (payload: CreatePlanProposalDto) =>
      ActivityCommands.createPlanProposal(plan.id, payload, plan.groupId),
    onSuccess: () => {
      setError(null);
      onCreated?.();
    },
    onError: (mutationError) => {
      setError(
        getApiErrorMessage(
          mutationError,
          "We couldn't submit that proposal. Please try again.",
        ),
      );
    },
  });

  async function createProposal(payload: CreatePlanProposalDto) {
    setError(null);

    if (
      guardOfflineAction({
        id: "activity-plan-proposal-create-offline",
        description: "Reconnect before suggesting plan changes.",
      })
    ) {
      setError("You are offline. Reconnect before suggesting plan changes.");
      return null;
    }

    return createMutation.mutateAsync(payload);
  }

  return {
    createProposal,
    error,
    isCreating: createMutation.isPending,
    isOnline,
    setError,
  };
}
