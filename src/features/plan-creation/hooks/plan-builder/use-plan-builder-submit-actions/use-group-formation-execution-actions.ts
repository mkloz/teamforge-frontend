import { type RefObject, useRef } from "react";
import { ZodError } from "zod";

import {
  AutomaticGroupFormationRequestSubmissionError,
  MissingPlanCreationInterestSignalsError,
  PlanCreationCommands,
} from "@/features/plan-creation/api/plan-creation-commands";
import type { AutomaticGroupFormationExecutionInput } from "@/features/plan-creation/lib/group-formation-execution-schema";
import { getPlanCreationDraftOperationKey } from "@/features/plan-creation/store/plan-builder-session-storage";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

import {
  getGroupFormationExecutionIssueMessage,
  getGroupFormationExecutionValidation,
} from "../group-formation-execution-input";
import {
  applyGroupFormationExecutionFailure,
  applyGroupFormationExecutionResult,
} from "../plan-creation-submit-results";
import type {
  GroupFormationExecutionMode,
  UsePlanBuilderSubmitActionsOptions,
} from "./types";

function executePlanCreationCommand(
  mode: GroupFormationExecutionMode,
  state: UsePlanBuilderSubmitActionsOptions["state"],
  input: AutomaticGroupFormationExecutionInput | null,
  autoRequestKeys: AutoRequestKeys | null,
  manualOperationKey: string | null,
) {
  if (!input) {
    throw new Error("Group formation input was not validated.");
  }

  if (mode === "AUTO") {
    if (!autoRequestKeys) {
      throw new Error("The group request key was not prepared.");
    }

    return PlanCreationCommands.executeAutomaticGroupFormation(
      input,
      autoRequestKeys,
      state.activityId,
      getExistingAutomaticGroupFormationRequest(state),
    );
  }

  if (!manualOperationKey) {
    throw new Error("The manual group request key was not prepared.");
  }
  return PlanCreationCommands.executeManualGroupFormation(
    input,
    manualOperationKey,
    state.activityId,
  );
}

interface UseGroupFormationExecutionActionsOptions
  extends Pick<
    UsePlanBuilderSubmitActionsOptions,
    | "dispatch"
    | "locationContext"
    | "runPlanCreationAnimation"
    | "state"
    | "syncStep"
    | "syncTargets"
  > {
  setField: UsePlanBuilderSubmitActionsOptions["setField"];
}

type GroupFormationExecutionValidation = ReturnType<
  typeof getGroupFormationExecutionValidation
>;
type GroupFormationExecutionResult = Parameters<
  typeof applyGroupFormationExecutionResult
>[0];
type PlanCreationMutationName = ReturnType<typeof getPlanCreationMutationName>;

interface GroupFormationExecutionErrorContext
  extends Pick<
    UseGroupFormationExecutionActionsOptions,
    "dispatch" | "setField" | "state" | "syncStep" | "syncTargets"
  > {
  mutationName: PlanCreationMutationName;
}

interface PlanCreationAnimationExecutionContext
  extends GroupFormationExecutionErrorContext {
  mode: GroupFormationExecutionMode;
  autoRequestKeys: AutoRequestKeys | null;
  manualOperationKey: string | null;
  validation: GroupFormationExecutionValidation | null;
}

const PLAN_CREATION_PLAN_VALIDATION_TOAST_TITLE = "Finish the plan first";

function getZodIssueMessage(error: ZodError) {
  return getGroupFormationExecutionIssueMessage(error.issues[0]);
}

export function useGroupFormationExecutionActions({
  dispatch,
  locationContext,
  runPlanCreationAnimation,
  setField,
  state,
  syncStep,
  syncTargets,
}: UseGroupFormationExecutionActionsOptions) {
  const autoOperationRef = useRef<{
    fingerprint: string;
    idempotencyKeys: AutoRequestKeys;
  } | null>(null);
  const { guardOfflineAction } = useOfflineActionGuard();

  function executeGroupFormation(mode: GroupFormationExecutionMode) {
    if (
      guardOfflineAction({
        id: "group-formation-execution-offline",
        description:
          mode === "AUTO"
            ? "Reconnect before starting this group request."
            : "Reconnect before forming a Findafew group.",
      })
    ) {
      return;
    }

    const mutationName = getPlanCreationMutationName(mode);
    const validation = getGroupFormationExecutionValidationForMode(
      mode,
      state,
      locationContext,
    );

    if (validation && !validation.canSubmit) {
      handlePlanCreationPlanValidationBlock(validation, {
        dispatch,
        syncStep,
      });
      return;
    }

    const autoRequestKeys =
      mode === "AUTO" && validation?.input
        ? getAutoRequestKeys(autoOperationRef, validation.input, state)
        : null;
    const manualOperationKey =
      mode === "MANUAL" && validation?.input
        ? getPlanCreationDraftOperationKey(
            "manual-plan-creation",
            JSON.stringify(validation.input),
          )
        : null;

    runPlanCreationAnimation(async () => {
      await runGroupFormationExecution({
        dispatch,
        mode,
        autoRequestKeys,
        manualOperationKey,
        mutationName,
        state,
        setField,
        syncStep,
        syncTargets,
        validation,
      });
    });
  }

  function handleManualGroupFormation() {
    executeGroupFormation("MANUAL");
  }

  function handleAutomaticGroupFormation() {
    executeGroupFormation("AUTO");
  }

  return {
    handleAutomaticGroupFormation,
    handleManualGroupFormation,
  };
}

function getPlanCreationMutationName(mode: GroupFormationExecutionMode) {
  return mode === "AUTO"
    ? trackedMutationNames.planCreationAuto
    : trackedMutationNames.planCreationManual;
}

function getGroupFormationExecutionValidationForMode(
  _mode: GroupFormationExecutionMode,
  state: UsePlanBuilderSubmitActionsOptions["state"],
  locationContext: UsePlanBuilderSubmitActionsOptions["locationContext"],
) {
  return getGroupFormationExecutionValidation(state, locationContext);
}

function handlePlanCreationPlanValidationBlock(
  validation: GroupFormationExecutionValidation,
  {
    dispatch,
    syncStep,
  }: Pick<UseGroupFormationExecutionActionsOptions, "dispatch" | "syncStep">,
) {
  const message =
    validation.message ?? "Finish the plan details before continuing.";

  showPlanCreationPlanValidationToast(new Error(message), message);
  returnToPlanCreationPlanStep({ dispatch, syncStep });
}

function handleGroupFormationExecutionError(
  error: unknown,
  context: GroupFormationExecutionErrorContext,
) {
  if (error instanceof MissingPlanCreationInterestSignalsError) {
    showAppErrorToast(error, {
      fallbackMessage:
        "Add at least one interest so Findafew can use your profile when forming the group.",
      id: "plan-creation-missing-interest-signals",
      title: "Interests needed",
    });
    return null;
  }

  if (error instanceof AutomaticGroupFormationRequestSubmissionError) {
    context.setField("activityId", error.activityId);
    context.syncTargets({ activityId: error.activityId, groupId: null });
    showAppErrorToast(error, {
      fallbackMessage:
        "Your activity was saved, but the group request could not be confirmed. Try again to safely resend it.",
      id: "automatic-group-formation-request-submit",
      title: "Request not confirmed",
    });
    return null;
  }

  if (error instanceof ZodError) {
    handlePlanCreationZodExecutionError(error, context);
    return null;
  }

  applyGroupFormationExecutionFailure(error, context.state, {
    dispatch: context.dispatch,
    mutationName: context.mutationName,
    syncStep: context.syncStep,
    syncTargets: context.syncTargets,
  });
  return null;
}

async function runGroupFormationExecution(
  context: PlanCreationAnimationExecutionContext,
) {
  const result = await executePlanCreationCommand(
    context.mode,
    context.state,
    context.validation?.input ?? null,
    context.autoRequestKeys,
    context.manualOperationKey,
  ).catch((error) => handleGroupFormationExecutionError(error, context));

  if (!result) {
    return;
  }

  handleGroupFormationExecutionSuccess(result, context);
}

function handleGroupFormationExecutionSuccess(
  result: GroupFormationExecutionResult,
  context: PlanCreationAnimationExecutionContext,
) {
  applyGroupFormationExecutionResult(result, {
    dispatch: context.dispatch,
    mutationName: context.mutationName,
    successStep: getPlanCreationSuccessStep(context.mode),
    syncStep: context.syncStep,
    syncTargets: context.syncTargets,
  });
}

interface AutoRequestKeys {
  request: string;
  resume: string;
}

function getAutoRequestKeys(
  operationRef: RefObject<{
    fingerprint: string;
    idempotencyKeys: AutoRequestKeys;
  } | null>,
  input: AutomaticGroupFormationExecutionInput,
  state: UsePlanBuilderSubmitActionsOptions["state"],
) {
  const fingerprint = JSON.stringify({
    input,
    requestId: state.automaticGroupFormationRequestId,
    revision: state.automaticGroupFormationRequestRevision,
  });

  if (operationRef.current?.fingerprint === fingerprint) {
    return operationRef.current.idempotencyKeys;
  }

  const idempotencyKeys = {
    request: getPlanCreationDraftOperationKey("auto-request", fingerprint),
    resume: getPlanCreationDraftOperationKey("auto-resume", fingerprint),
  };
  operationRef.current = { fingerprint, idempotencyKeys };
  return idempotencyKeys;
}

function getExistingAutomaticGroupFormationRequest(
  state: UsePlanBuilderSubmitActionsOptions["state"],
) {
  if (
    !state.automaticGroupFormationRequestId ||
    !state.automaticGroupFormationRequestRevision
  ) {
    return null;
  }

  const lifecycle = state.automaticGroupFormationRequestLifecycle;
  if (
    lifecycle !== "DRAFT" &&
    lifecycle !== "SEARCHING" &&
    lifecycle !== "PAUSED"
  ) {
    return null;
  }

  return {
    id: state.automaticGroupFormationRequestId,
    revision: state.automaticGroupFormationRequestRevision,
    lifecycle,
  };
}

function handlePlanCreationZodExecutionError(
  error: ZodError,
  {
    dispatch,
    syncStep,
  }: Pick<GroupFormationExecutionErrorContext, "dispatch" | "syncStep">,
) {
  const message = getZodIssueMessage(error);

  showPlanCreationPlanValidationToast(error, message);
  returnToPlanCreationPlanStep({ dispatch, syncStep });
}

function showPlanCreationPlanValidationToast(error: Error, message: string) {
  showAppErrorToast(error, {
    fallbackMessage: message,
    id: "plan-creation-plan-validation",
    title: PLAN_CREATION_PLAN_VALIDATION_TOAST_TITLE,
  });
}

function returnToPlanCreationPlanStep({
  dispatch,
  syncStep,
}: Pick<UseGroupFormationExecutionActionsOptions, "dispatch" | "syncStep">) {
  dispatch({
    type: "set-step",
    step: 3,
    navDirection: "back",
  });
  syncStep(3, { history: "push" });
}

function getPlanCreationSuccessStep(mode: GroupFormationExecutionMode) {
  return mode === "MANUAL" ? 6 : 5;
}
