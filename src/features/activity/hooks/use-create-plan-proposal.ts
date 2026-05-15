import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { CreatePlanProposalDto } from "@/features/activity/api/activity.api";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type { Plan } from "@/features/activity/lib/activity-contract";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";

interface UseCreatePlanProposalOptions {
  onCreated?: () => void;
}

export function useCreatePlanProposal(
  plan: Plan,
  { onCreated }: UseCreatePlanProposalOptions = {},
) {
  const [error, setError] = useState<string | null>(null);
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

  return {
    createProposal: createMutation.mutateAsync,
    error,
    isCreating: createMutation.isPending,
    setError,
  };
}
