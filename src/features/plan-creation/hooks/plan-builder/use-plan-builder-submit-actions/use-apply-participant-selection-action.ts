import { useState } from "react";

import { PlanCreationApi } from "@/features/plan-creation/api/plan-creation.api";
import type { PlanBuilderData } from "@/features/plan-creation/lib/plan-builder";
import { showAppErrorMessageToast } from "@/shared/lib/app-toast";

interface UseApplyParticipantSelectionActionOptions {
  goNext: () => void;
  state: PlanBuilderData;
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
          PlanCreationApi.removeGroupMember(groupId, memberId),
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
