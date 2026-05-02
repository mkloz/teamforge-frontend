import type { ForgeWizardData } from "@/features/forge/lib/forge-wizard";

export function useForgeWizardDerivedState(state: ForgeWizardData) {
  const activeParticipants = state.participants.filter(
    (participant) => !state.removedIds.has(participant.userId),
  );
  const canAdvanceStep1 = !!state.selectedActivity;
  const paidAmount = Number(state.planCostAmount);
  const canAdvanceStep2 =
    state.planName.trim().length >= 3 &&
    (state.planCost === "FREE" ||
      (Number.isFinite(paidAmount) && paidAmount > 0));
  const isPreForge = state.step <= 3;
  const canGoBack =
    (state.step > 1 && state.step <= 3) || state.step === 5 || state.step === 6;

  return {
    activeParticipants,
    canAdvanceStep1,
    canAdvanceStep2,
    isPreForge,
    canGoBack,
  };
}
