import type { GroupFormationExecutionResult } from "@/features/plan-creation/api/plan-creation-types";
import type {
  PlanBuilderData,
  Step,
} from "@/features/plan-creation/lib/plan-builder";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import type { trackedMutationNames } from "@/shared/lib/telemetry-contract";

import type { PlanBuilderDispatch } from "./plan-builder-hook.types";

type PlanCreationMutationName =
  (typeof trackedMutationNames)[keyof typeof trackedMutationNames];

interface GroupFormationResultSideEffectOptions {
  dispatch: PlanBuilderDispatch;
  mutationName: PlanCreationMutationName;
  successStep?: Step;
  syncStep: (step: Step, options?: { history?: "push" | "replace" }) => void;
  syncTargets: (targets: {
    activityId?: string | null;
    groupId?: string | null;
    requestId?: string | null;
  }) => void;
}

export function applyGroupFormationExecutionResult(
  result: GroupFormationExecutionResult,
  {
    dispatch,
    mutationName,
    successStep = 5,
    syncStep,
    syncTargets,
  }: GroupFormationResultSideEffectOptions,
) {
  const completed =
    result.groupFormationResult === "SUCCESS" ||
    result.groupFormationResult === "SEARCHING";
  const targetStep =
    result.groupFormationResult === "SUCCESS" ? successStep : 5;

  dispatch({
    type: "apply-plan-creation-result",
    result: result.groupFormationResult,
    participants: result.participants,
    activityId: result.activityId,
    automaticGroupFormationRequest: result.automaticGroupFormationRequest,
    groupId: result.groupId,
    chatId: result.chatId,
    planId: result.planId,
    step: targetStep,
  });
  syncTargets({
    activityId: result.activityId,
    groupId: result.groupId,
    requestId: result.automaticGroupFormationRequest?.id ?? null,
  });
  syncStep(targetStep, { history: "push" });
  trackMutationOutcome(mutationName, completed ? "success" : "error", {
    result: result.groupFormationResult,
    createActivityRequestId: result.requestIds.createActivity,
    automaticGroupFormationRequestId:
      result.requestIds.automaticGroupFormationRequest,
    groupFormationActivityRequestId: result.requestIds.groupFormationActivity,
  });
}

export function applyGroupFormationExecutionFailure(
  error: unknown,
  state: PlanBuilderData,
  {
    dispatch,
    mutationName,
    syncStep,
    syncTargets,
  }: GroupFormationResultSideEffectOptions,
) {
  captureException(mutationName, error, {
    selectedActivity: state.selectedActivity ?? "missing",
  });
  trackMutationOutcome(mutationName, "error", {
    result: "exception",
  });
  dispatch({
    type: "apply-plan-creation-result",
    result: "FAILED",
    participants: [],
    activityId: null,
    automaticGroupFormationRequest: null,
    groupId: null,
    chatId: null,
    planId: null,
  });
  syncTargets({
    activityId: null,
    groupId: null,
    requestId: null,
  });
  syncStep(5, { history: "push" });
}
