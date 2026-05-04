import type { ForgeWizardData } from "@/features/forge/lib/forge-wizard";

import { getForgeExecutionValidation } from "./forge-execution-input";

export function useForgeWizardDerivedState(state: ForgeWizardData) {
  const activeParticipants = state.participants.filter(
    (participant) => !state.removedIds.has(participant.userId),
  );
  const forgeExecutionValidation = getForgeExecutionValidation(state);
  const canAdvanceStep1 = !!state.selectedActivity;
  const canAdvanceStep2 = forgeExecutionValidation.canSubmit;
  const forgeValidationMessage = forgeExecutionValidation.message;
  const isPreForge = state.step <= 4;
  const canGoBack =
    (state.step > 1 && state.step <= 4) || state.step === 6 || state.step === 7;

  return {
    activeParticipants,
    canAdvanceStep1,
    canAdvanceStep2,
    forgeValidationMessage,
    isPreForge,
    canGoBack,
  };
}
