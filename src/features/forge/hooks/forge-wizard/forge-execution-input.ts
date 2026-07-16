import type { ZodIssue } from "zod";
import {
  type AutoForgeExecutionInput,
  forgeExecutionInputSchema,
} from "@/features/forge/lib/forge-execution-schema";
import type { ForgeWizardData } from "@/features/forge/lib/forge-wizard";

const DEFAULT_FORGE_EXECUTION_MESSAGE =
  "Finish the plan details before continuing.";
const ISSUE_MESSAGE_FIELDS = new Set<unknown>([
  "planName",
  "planDate",
  "planTime",
  "planLocation",
  "planLocationLat",
  "planCostAmount",
]);
const ISSUE_FIELD_MESSAGES = new Map<unknown, string>([
  ["selectedActivity", "Choose an activity before continuing."],
  ["autoMinSize", "Keep the minimum group size below the maximum."],
]);

function buildRawForgeExecutionInput(state: ForgeWizardData) {
  return {
    forgeScope: state.forgeScope,
    selectedActivity: state.selectedActivity,
    planCategory: state.planCategory,
    planName: state.planName,
    planDescription: state.planDescription,
    planScheduleMode: state.planScheduleMode,
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

export function getForgeExecutionIssueMessage(issue?: ZodIssue) {
  if (!issue) {
    return DEFAULT_FORGE_EXECUTION_MESSAGE;
  }

  const field = issue.path[0];
  const fieldMessage = ISSUE_FIELD_MESSAGES.get(field);

  if (fieldMessage) {
    return fieldMessage;
  }

  if (ISSUE_MESSAGE_FIELDS.has(field)) {
    return issue.message;
  }

  return issue.message || DEFAULT_FORGE_EXECUTION_MESSAGE;
}

function getForgeValidationMessage(state: ForgeWizardData, issues: ZodIssue[]) {
  const planName = state.planName.trim();
  const planNameMessage = getPlanNameValidationMessage(planName);
  const scheduleMessage = getPlanScheduleValidationMessage(state);

  if (!state.selectedActivity) {
    return "Choose an activity before continuing.";
  }

  if (planNameMessage) {
    return planNameMessage;
  }

  if (scheduleMessage) {
    return scheduleMessage;
  }

  return getForgeExecutionIssueMessage(issues[0]);
}

function getPlanNameValidationMessage(planName: string) {
  if (planName.length === 0) {
    return "Add a plan name before continuing.";
  }

  if (planName.length < 3) {
    return "Use at least 3 characters for the plan name.";
  }

  return null;
}

function getPlanScheduleValidationMessage({
  planScheduleMode,
  planDate,
  planTime,
}: ForgeWizardData) {
  if (planScheduleMode === "TO_BE_DECIDED") {
    return null;
  }

  if (!planDate && !planTime) {
    return "Add a date and time before continuing.";
  }

  if (!planDate) {
    return "Add a date before continuing.";
  }

  if (!planTime) {
    return "Add a time before continuing.";
  }

  return null;
}
