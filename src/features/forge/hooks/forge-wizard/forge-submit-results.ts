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
    syncStep,
    syncTargets,
  }: ForgeResultSideEffectOptions,
) {
  dispatch({
    type: "apply-forge-result",
    result: result.forgeResult,
    participants: result.participants,
    activityId: result.activityId,
    groupId: result.groupId,
    chatId: result.chatId,
    planId: result.planId,
  });
  syncTargets({
    activityId: result.activityId,
    groupId: result.groupId,
  });
  syncStep(4, { history: "push" });
  trackMutationOutcome(
    mutationName,
    result.forgeResult === "SUCCESS" ? "success" : "error",
    {
      result: result.forgeResult,
      createActivityRequestId: result.requestIds.createActivity,
      forgeActivityRequestId: result.requestIds.forgeActivity,
    },
  );
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
  syncStep(4, { history: "push" });
}
