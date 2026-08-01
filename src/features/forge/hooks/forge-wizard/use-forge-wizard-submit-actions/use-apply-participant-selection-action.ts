import { useState } from "react";

import { ForgeApi } from "@/features/forge/api/forge.api";
import type { ForgeWizardData } from "@/features/forge/lib/forge-wizard";
import { showAppErrorMessageToast } from "@/shared/lib/app-toast";

interface UseApplyParticipantSelectionActionOptions {
  goNext: () => void;
  state: ForgeWizardData;
}

export function useApplyParticipantSelectionAction({
  goNext,
  state,
}: UseApplyParticipantSelectionActionOptions) {
  const [isApplyingParticipantSelection, setIsApplyingParticipantSelection] =
    useState(false);

  const handleContinueFromSuccess = async () => {
    if (isApplyingParticipantSelection) return;

    if (state.removedIds.size === 0) {
      goNext();
      return;
    }

    if (!state.groupId) {
      showAppErrorMessageToast(
        "The group is not ready to update yet. Try again in a moment.",
      );
      return;
    }

    const groupId = state.groupId;

    setIsApplyingParticipantSelection(true);
    try {
      await Promise.all(
        [...state.removedIds].map((memberId) =>
          ForgeApi.removeGroupMember(groupId, memberId),
        ),
      );
      goNext();
    } catch {
      showAppErrorMessageToast(
        "We couldn't update this group. Your selection is still here.",
      );
    } finally {
      setIsApplyingParticipantSelection(false);
    }
  };

  return {
    handleContinueFromSuccess,
    isApplyingParticipantSelection,
  };
}
