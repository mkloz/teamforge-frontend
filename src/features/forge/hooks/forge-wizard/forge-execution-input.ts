import type { ZodIssue } from "zod";
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
  input: AutoForgeExecutionInput | null;
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
      input: result.data,
      message: null,
    };
  }

  return {
    canSubmit: false,
    input: null,
    message: getForgeValidationMessage(state, result.error.issues),
  };
}

export function canSubmitForgeExecutionInput(state: ForgeWizardData) {
  return getForgeExecutionValidation(state).canSubmit;
}

export function getForgeExecutionValidationMessage(state: ForgeWizardData) {
  return getForgeExecutionValidation(state).message;
}

export function getForgeExecutionIssueMessage(issue?: ZodIssue) {
  if (!issue) {
    return "Finish the plan details before forming the group.";
  }

  const field = issue.path[0];

  if (field === "selectedActivity") {
    return "Choose an activity before forming the group.";
  }

  if (field === "planName") {
    return issue.message;
  }

  if (field === "planDate" || field === "planTime") {
    return issue.message;
  }

  if (field === "planLocation" || field === "planLocationLat") {
    return issue.message;
  }

  if (field === "planCostAmount") {
    return issue.message;
  }

  if (field === "autoMinSize") {
    return "Keep the minimum group size below the maximum.";
  }

  return issue.message || "Finish the plan details before forming the group.";
}

function getForgeValidationMessage(state: ForgeWizardData, issues: ZodIssue[]) {
  const planName = state.planName.trim();

  if (!state.selectedActivity) {
    return "Choose an activity before forming the group.";
  }

  if (planName.length === 0) {
    return "Add a plan name before forming the group.";
  }

  if (planName.length < 3) {
    return "Use at least 3 characters for the plan name.";
  }

  if (!state.planDate && !state.planTime) {
    return "Add a date and time before forming the group.";
  }

  if (!state.planDate) {
    return "Add a date before forming the group.";
  }

  if (!state.planTime) {
    return "Add a time before forming the group.";
  }

  return getForgeExecutionIssueMessage(issues[0]);
}
