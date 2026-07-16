import type { ForgeExecutionResult } from "@/features/forge/api/forge-types";
import type { ForgeWizardData, Step } from "@/features/forge/lib/forge-wizard";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import type { trackedMutationNames } from "@/shared/lib/telemetry-contract";

import type { ForgeWizardDispatch } from "./forge-wizard-hook.types";

type ForgeMutationName =
  (typeof trackedMutationNames)[keyof typeof trackedMutationNames];

interface ForgeResultSideEffectOptions {
  dispatch: ForgeWizardDispatch;
  mutationName: ForgeMutationName;
  successStep?: Step;
  syncStep: (step: Step, options?: { history?: "push" | "replace" }) => void;
  syncTargets: (targets: {
    activityId?: string | null;
    groupId?: string | null;
  }) => void;
}

export function applyForgeExecutionResult(
  result: ForgeExecutionResult,
  {
    dispatch,
    mutationName,
    successStep = 5,
    syncStep,
    syncTargets,
  }: ForgeResultSideEffectOptions,
) {
  const completed =
    result.forgeResult === "SUCCESS" || result.forgeResult === "SEARCHING";
  const targetStep = result.forgeResult === "SUCCESS" ? successStep : 5;

  dispatch({
    type: "apply-forge-result",
    result: result.forgeResult,
    participants: result.participants,
    activityId: result.activityId,
    groupId: result.groupId,
    chatId: result.chatId,
    planId: result.planId,
    step: targetStep,
  });
  syncTargets({
    activityId: result.activityId,
    groupId: result.groupId,
  });
  syncStep(targetStep, { history: "push" });
  trackMutationOutcome(mutationName, completed ? "success" : "error", {
    result: result.forgeResult,
    createActivityRequestId: result.requestIds.createActivity,
    autoForgeRequestId: result.requestIds.autoForgeRequest,
    forgeActivityRequestId: result.requestIds.forgeActivity,
  });
}

export function applyForgeExecutionFailure(
  error: unknown,
  state: ForgeWizardData,
  {
    dispatch,
    mutationName,
    syncStep,
    syncTargets,
  }: ForgeResultSideEffectOptions,
) {
  captureException(mutationName, error, {
    selectedActivity: state.selectedActivity ?? "missing",
  });
  trackMutationOutcome(mutationName, "error", {
    result: "exception",
  });
  dispatch({
    type: "apply-forge-result",
    result: "FAILED",
    participants: [],
    activityId: null,
    groupId: null,
    chatId: null,
    planId: null,
  });
  syncTargets({
    activityId: null,
    groupId: null,
  });
  syncStep(5, { history: "push" });
}
