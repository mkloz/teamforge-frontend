import type { ZodIssue } from "zod";
import {
  type AutomaticGroupFormationExecutionInput,
  groupFormationExecutionInputSchema,
} from "@/features/plan-creation/lib/group-formation-execution-schema";
import type { PlanBuilderData } from "@/features/plan-creation/lib/plan-builder";

const DEFAULT_PLAN_CREATION_EXECUTION_MESSAGE =
  "Finish the plan details before continuing.";
const LOCAL_LOCATION_REQUIRED_MESSAGE =
  "Local group formation needs private coordinates. Use your location here or add it in account settings.";
const LOCAL_LOCATION_LOADING_MESSAGE = "Checking your saved location…";
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
  ["autoMinSize", "Keep the minimum group size at or below the maximum."],
]);

function buildRawGroupFormationExecutionInput(state: PlanBuilderData) {
  return {
    groupFormationScope: state.groupFormationScope,
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

export interface GroupFormationExecutionValidation {
  canSubmit: boolean;
  input: AutomaticGroupFormationExecutionInput | null;
  message: string | null;
}

export interface FormationLocationContext {
  isLoading: boolean;
  locationLat: number | null;
  locationLng: number | null;
}

export type LocalFormationLocationState = "loading" | "ready" | "required";

export function getGroupFormationExecutionValidation(
  state: PlanBuilderData,
  locationContext?: FormationLocationContext,
): GroupFormationExecutionValidation {
  const result = groupFormationExecutionInputSchema.safeParse(
    buildRawGroupFormationExecutionInput(state),
  );

  if (result.success) {
    const localLocationMessage = getLocalLocationRequirementMessage(
      result.data,
      locationContext,
    );

    if (localLocationMessage) {
      return {
        canSubmit: false,
        input: null,
        message: localLocationMessage,
      };
    }

    return {
      canSubmit: true,
      input: result.data,
      message: null,
    };
  }

  return {
    canSubmit: false,
    input: null,
    message: getPlanCreationValidationMessage(state, result.error.issues),
  };
}

function getLocalLocationRequirementMessage(
  input: AutomaticGroupFormationExecutionInput,
  locationContext?: FormationLocationContext,
) {
  if (!locationContext) {
    return null;
  }

  const state = getLocalFormationLocationState({
    groupFormationScope: input.groupFormationScope,
    locationContext,
    planLocationLat: input.planLocationLat,
    planLocationLng: input.planLocationLng,
  });

  if (state === "loading") {
    return LOCAL_LOCATION_LOADING_MESSAGE;
  }

  return state === "required" ? LOCAL_LOCATION_REQUIRED_MESSAGE : null;
}

export function getLocalFormationLocationState({
  groupFormationScope,
  locationContext,
  planLocationLat,
  planLocationLng,
}: {
  groupFormationScope: PlanBuilderData["groupFormationScope"];
  locationContext: FormationLocationContext;
  planLocationLat: number | null;
  planLocationLng: number | null;
}): LocalFormationLocationState {
  if (
    groupFormationScope !== "LOCAL" ||
    hasCoordinatePair(planLocationLat, planLocationLng) ||
    hasCoordinatePair(locationContext.locationLat, locationContext.locationLng)
  ) {
    return "ready";
  }

  return locationContext.isLoading ? "loading" : "required";
}

export function hasCoordinatePair(
  locationLat: number | null,
  locationLng: number | null,
) {
  return locationLat !== null && locationLng !== null;
}

export function getGroupFormationExecutionIssueMessage(issue?: ZodIssue) {
  if (!issue) {
    return DEFAULT_PLAN_CREATION_EXECUTION_MESSAGE;
  }

  const field = issue.path[0];
  const fieldMessage = ISSUE_FIELD_MESSAGES.get(field);

  if (fieldMessage) {
    return fieldMessage;
  }

  if (ISSUE_MESSAGE_FIELDS.has(field)) {
    return issue.message;
  }

  return issue.message || DEFAULT_PLAN_CREATION_EXECUTION_MESSAGE;
}

function getPlanCreationValidationMessage(
  state: PlanBuilderData,
  issues: ZodIssue[],
) {
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

  return getGroupFormationExecutionIssueMessage(issues[0]);
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
}: PlanBuilderData) {
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
