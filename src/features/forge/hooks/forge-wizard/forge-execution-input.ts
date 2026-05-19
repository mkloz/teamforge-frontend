import {
  type AutoForgeExecutionInput,
  forgeExecutionInputSchema,
} from "@/features/forge/lib/forge-execution-schema";
import type { ForgeWizardData } from "@/features/forge/lib/forge-wizard";

function buildRawForgeExecutionInput(state: ForgeWizardData) {
  return {
    selectedActivity: state.selectedActivity,
    planName: state.planName,
    planDescription: state.planDescription,
    planDate: state.planDate,
    planTime: state.planTime,
    planLocation: state.planLocation,
    planLocationLat: state.planLocationLat,
    planLocationLng: state.planLocationLng,
    coverImage: state.coverImage,
    locationType: state.locationType,
    planCost: state.planCost,
    planCostAmount: state.planCostAmount,
    planCostDetails: state.planCostDetails,
    groupSizeMode: state.groupSizeMode,
    fixedSize: state.fixedSize,
    autoMinSize: state.autoMinSize,
    autoMaxSize: state.autoMaxSize,
    compatibilityWeight: state.compatibilityWeight,
    diversityWeight: state.diversityWeight,
    networkReachWeight: state.networkReachWeight,
    maxDistanceKm: state.maxDistanceKm,
    visibility: state.visibility,
    groupName: state.groupName,
    groupDescription: state.groupDescription,
    avatarImage: state.avatarImage,
  };
}

export interface ForgeExecutionValidation {
  canSubmit: boolean;
  message: string | null;
}

export function buildForgeExecutionInput(
  state: ForgeWizardData,
): AutoForgeExecutionInput {
  return forgeExecutionInputSchema.parse(buildRawForgeExecutionInput(state));
}

export function getForgeExecutionValidation(
  state: ForgeWizardData,
): ForgeExecutionValidation {
  const result = forgeExecutionInputSchema.safeParse(
    buildRawForgeExecutionInput(state),
  );

  if (result.success) {
    return {
      canSubmit: true,
      message: null,
    };
  }

  return {
    canSubmit: false,
    message: result.error.issues[0]?.message ?? "Check the plan details.",
  };
}

export function canSubmitForgeExecutionInput(state: ForgeWizardData) {
  return getForgeExecutionValidation(state).canSubmit;
}

export function getForgeExecutionValidationMessage(state: ForgeWizardData) {
  return getForgeExecutionValidation(state).message;
}
