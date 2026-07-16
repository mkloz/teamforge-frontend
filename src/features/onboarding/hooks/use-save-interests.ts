import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { OnboardingCache } from "@/features/onboarding/api/onboarding-cache";
import { OnboardingCommands } from "@/features/onboarding/api/onboarding-commands";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

interface UseSaveInterestsInput {
  blockedSaveMessage?: string | null;
  canContinue: boolean;
  onComplete: () => void;
  selectedIds: string[];
}

const OFFLINE_SAVE_INTERESTS_ERROR =
  "You are offline. Reconnect before saving your interests.";
const SAVE_INTERESTS_FALLBACK_ERROR =
  "We couldn’t save your interests just yet. Please try again.";

type GuardOfflineAction = ReturnType<
  typeof useOfflineActionGuard
>["guardOfflineAction"];
type SaveInterestsPayload = Parameters<
  typeof OnboardingCommands.setInterests
>[0];
type SaveInterestsMutation = (
  payload: SaveInterestsPayload,
) => Promise<unknown>;

export function useSaveInterests({
  blockedSaveMessage = null,
  canContinue,
  onComplete,
  selectedIds,
}: UseSaveInterestsInput) {
  const queryClient = useQueryClient();
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const { mutateAsync: saveInterests, isPending: isSaving } = useMutation({
    meta: {
      errorToastMessage:
        "We couldn't save your interests just yet. Please try again.",
    },
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

    if (blockedSaveMessage) {
      setSaveErrorMessage(blockedSaveMessage);
      return;
    }

    if (shouldSkipSaveInterestsForOffline(guardOfflineAction)) {
      setSaveErrorMessage(OFFLINE_SAVE_INTERESTS_ERROR);
      return;
    }

    try {
      await saveSelectedInterests(saveInterests, selectedIds);
      onComplete();
    } catch (error) {
      setSaveErrorMessage(getSaveInterestsErrorMessage(error));
    }
  }

  return {
    finalize,
    isOnline,
    isSaving,
    saveErrorMessage,
  };
}

function shouldSkipSaveInterestsForOffline(
  guardOfflineAction: GuardOfflineAction,
) {
  return guardOfflineAction({
    id: "onboarding-interests-save-offline",
    description: "Reconnect before saving your interests.",
  });
}

function saveSelectedInterests(
  saveInterests: SaveInterestsMutation,
  selectedIds: string[],
) {
  return saveInterests({
    interestIds: selectedIds,
  });
}

function getSaveInterestsErrorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : SAVE_INTERESTS_FALLBACK_ERROR;
}
