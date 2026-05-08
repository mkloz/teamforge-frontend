import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { OnboardingCache } from "@/features/onboarding/api/onboarding-cache";
import { OnboardingCommands } from "@/features/onboarding/api/onboarding-commands";

interface UseSaveInterestsInput {
  canContinue: boolean;
  onComplete: () => void;
  selectedIds: string[];
}

export function useSaveInterests({
  canContinue,
  onComplete,
  selectedIds,
}: UseSaveInterestsInput) {
  const queryClient = useQueryClient();
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const { mutateAsync: saveInterests, isPending: isSaving } = useMutation({
    mutationFn: (
      payload: Parameters<typeof OnboardingCommands.setInterests>[0],
    ) => OnboardingCommands.setInterests(payload),
    onSuccess: async (result) => {
      OnboardingCache.applySavedInterests(queryClient, result.interests);
      await OnboardingCache.invalidateCurrentUser(queryClient);
    },
  });

  async function finalize() {
    if (!canContinue || isSaving) {
      return;
    }

    setSaveErrorMessage(null);

    try {
      await saveInterests({
        interestIds: selectedIds,
      });

      onComplete();
    } catch (error) {
      if (error instanceof Error && error.message) {
        setSaveErrorMessage(error.message);
        return;
      }

      setSaveErrorMessage(
        "We couldn’t save your interests just yet. Please try again.",
      );
    }
  }

  return {
    finalize,
    isSaving,
    saveErrorMessage,
  };
}
