import type { PlanBuilderData } from "@/features/plan-creation/lib/plan-builder";

import {
  type FormationLocationContext,
  getGroupFormationExecutionValidation,
  getLocalFormationLocationState,
} from "./group-formation-execution-input";

export function usePlanBuilderDerivedState(
  state: PlanBuilderData,
  locationContext: FormationLocationContext,
) {
  const activeParticipants = state.participants.filter(
    (participant) => !state.removedIds.has(participant.userId),
  );
  const groupFormationExecutionValidation =
    getGroupFormationExecutionValidation(state, locationContext);
  const localFormationLocationState = getLocalFormationLocationState({
    groupFormationScope: state.groupFormationScope,
    locationContext,
    planLocationLat: state.planLocationLat,
    planLocationLng: state.planLocationLng,
  });
  const canAdvanceStep1 = !!state.selectedActivity;
  const canAdvanceStep2 = groupFormationExecutionValidation.canSubmit;
  const planCreationValidationMessage =
    groupFormationExecutionValidation.message;
  const isPrePlanCreation = state.step <= 4;
  const canGoBack =
    (state.step > 1 && state.step <= 4) || state.step === 6 || state.step === 7;

  return {
    activeParticipants,
    canAdvanceStep1,
    canAdvanceStep2,
    planCreationValidationMessage,
    isPrePlanCreation,
    canGoBack,
    hasLocalFormationCoordinates: localFormationLocationState === "ready",
    isCheckingLocalFormationCoordinates:
      localFormationLocationState === "loading",
  };
}
