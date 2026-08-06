import { type RefObject, useRef } from "react";
import { ZodError } from "zod";

import {
  AutoForgeRequestSubmissionError,
  ForgeCommands,
  MissingForgeInterestSignalsError,
} from "@/features/forge/api/forge-commands";
import type { AutoForgeExecutionInput } from "@/features/forge/lib/forge-execution-schema";
import { getForgeDraftOperationKey } from "@/features/forge/store/forge-wizard-session-storage";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

import {
  getForgeExecutionIssueMessage,
  getForgeExecutionValidation,
} from "../forge-execution-input";
import {
  applyForgeExecutionFailure,
  applyForgeExecutionResult,
} from "../forge-submit-results";
import type {
  ForgeExecutionMode,
  UseForgeWizardSubmitActionsOptions,
} from "./types";

function executeForgeCommand(
  mode: ForgeExecutionMode,
  state: UseForgeWizardSubmitActionsOptions["state"],
  input: AutoForgeExecutionInput | null,
  autoRequestKeys: AutoRequestKeys | null,
  manualOperationKey: string | null,
) {
  if (!input) {
    throw new Error("Forge execution input was not validated.");
  }

  if (mode === "AUTO") {
    if (!autoRequestKeys) {
      throw new Error("The Forge request key was not prepared.");
    }

    return ForgeCommands.executeAutoForge(
      input,
      autoRequestKeys,
      state.activityId,
      getExistingAutoForgeRequest(state),
    );
  }

  if (!manualOperationKey) {
    throw new Error("The manual Forge request key was not prepared.");
  }
  return ForgeCommands.executeManualForge(
    input,
    manualOperationKey,
    state.activityId,
  );
}

interface UseForgeExecutionActionsOptions
  extends Pick<
    UseForgeWizardSubmitActionsOptions,
    "dispatch" | "runForgeAnimation" | "state" | "syncStep" | "syncTargets"
  > {
  setField: UseForgeWizardSubmitActionsOptions["setField"];
}

type ForgeExecutionValidation = ReturnType<typeof getForgeExecutionValidation>;
type ForgeExecutionResult = Parameters<typeof applyForgeExecutionResult>[0];
type ForgeMutationName = ReturnType<typeof getForgeMutationName>;

interface ForgeExecutionErrorContext
  extends Pick<
    UseForgeExecutionActionsOptions,
    "dispatch" | "setField" | "state" | "syncStep" | "syncTargets"
  > {
  mutationName: ForgeMutationName;
}

interface ForgeAnimationExecutionContext extends ForgeExecutionErrorContext {
  mode: ForgeExecutionMode;
  autoRequestKeys: AutoRequestKeys | null;
  manualOperationKey: string | null;
  validation: ForgeExecutionValidation | null;
}

const FORGE_PLAN_VALIDATION_TOAST_TITLE = "Finish the plan first";

function getZodIssueMessage(error: ZodError) {
  return getForgeExecutionIssueMessage(error.issues[0]);
}

export function useForgeExecutionActions({
  dispatch,
  runForgeAnimation,
  setField,
  state,
  syncStep,
  syncTargets,
}: UseForgeExecutionActionsOptions) {
  const autoOperationRef = useRef<{
    fingerprint: string;
    idempotencyKeys: AutoRequestKeys;
  } | null>(null);
  const { guardOfflineAction } = useOfflineActionGuard();

  function executeForge(mode: ForgeExecutionMode) {
    if (
      guardOfflineAction({
        id: "forge-execution-offline",
        description:
          mode === "AUTO"
            ? "Reconnect before starting this group request."
            : "Reconnect before forming a TeamForge group.",
      })
    ) {
      return;
    }

    const mutationName = getForgeMutationName(mode);
    const validation = getForgeExecutionValidationForMode(mode, state);

    if (validation && !validation.canSubmit) {
      handleForgePlanValidationBlock(validation, {
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
        ? getForgeDraftOperationKey(
            "manual-forge",
            JSON.stringify(validation.input),
          )
        : null;

    runForgeAnimation(async () => {
      await runForgeExecution({
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

  function handleManualForge() {
    executeForge("MANUAL");
  }

  function handleAutoForge() {
    executeForge("AUTO");
  }

  return {
    handleAutoForge,
    handleManualForge,
  };
}

function getForgeMutationName(mode: ForgeExecutionMode) {
  return mode === "AUTO"
    ? trackedMutationNames.forgeAuto
    : trackedMutationNames.forgeManual;
}

function getForgeExecutionValidationForMode(
  _mode: ForgeExecutionMode,
  state: UseForgeWizardSubmitActionsOptions["state"],
) {
  return getForgeExecutionValidation(state);
}

function handleForgePlanValidationBlock(
  validation: ForgeExecutionValidation,
  {
    dispatch,
    syncStep,
  }: Pick<UseForgeExecutionActionsOptions, "dispatch" | "syncStep">,
) {
  const message =
    validation.message ?? "Finish the plan details before continuing.";

  showForgePlanValidationToast(new Error(message), message);
  returnToForgePlanStep({ dispatch, syncStep });
}

function handleForgeExecutionError(
  error: unknown,
  context: ForgeExecutionErrorContext,
) {
  if (error instanceof MissingForgeInterestSignalsError) {
    showAppErrorToast(error, {
      fallbackMessage:
        "Add at least one interest so TeamForge can use your profile when forming the group.",
      id: "forge-missing-interest-signals",
      title: "Interests needed",
    });
    return null;
  }

  if (error instanceof AutoForgeRequestSubmissionError) {
    context.setField("activityId", error.activityId);
    context.syncTargets({ activityId: error.activityId, groupId: null });
    showAppErrorToast(error, {
      fallbackMessage:
        "Your activity was saved, but the Forge request could not be confirmed. Try again to safely resend it.",
      id: "auto-forge-request-submit",
      title: "Request not confirmed",
    });
    return null;
  }

  if (error instanceof ZodError) {
    handleForgeZodExecutionError(error, context);
    return null;
  }

  applyForgeExecutionFailure(error, context.state, {
    dispatch: context.dispatch,
    mutationName: context.mutationName,
    syncStep: context.syncStep,
    syncTargets: context.syncTargets,
  });
  return null;
}

async function runForgeExecution(context: ForgeAnimationExecutionContext) {
  const result = await executeForgeCommand(
    context.mode,
    context.state,
    context.validation?.input ?? null,
    context.autoRequestKeys,
    context.manualOperationKey,
  ).catch((error) => handleForgeExecutionError(error, context));

  if (!result) {
    return;
  }

  handleForgeExecutionSuccess(result, context);
}

function handleForgeExecutionSuccess(
  result: ForgeExecutionResult,
  context: ForgeAnimationExecutionContext,
) {
  applyForgeExecutionResult(result, {
    dispatch: context.dispatch,
    mutationName: context.mutationName,
    successStep: getForgeSuccessStep(context.mode),
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
  input: AutoForgeExecutionInput,
  state: UseForgeWizardSubmitActionsOptions["state"],
) {
  const fingerprint = JSON.stringify({
    input,
    requestId: state.autoForgeRequestId,
    revision: state.autoForgeRequestRevision,
  });

  if (operationRef.current?.fingerprint === fingerprint) {
    return operationRef.current.idempotencyKeys;
  }

  const idempotencyKeys = {
    request: getForgeDraftOperationKey("auto-request", fingerprint),
    resume: getForgeDraftOperationKey("auto-resume", fingerprint),
  };
  operationRef.current = { fingerprint, idempotencyKeys };
  return idempotencyKeys;
}

function getExistingAutoForgeRequest(
  state: UseForgeWizardSubmitActionsOptions["state"],
) {
  if (!state.autoForgeRequestId || !state.autoForgeRequestRevision) {
    return null;
  }

  const lifecycle = state.autoForgeRequestLifecycle;
  if (
    lifecycle !== "DRAFT" &&
    lifecycle !== "SEARCHING" &&
    lifecycle !== "PAUSED"
  ) {
    return null;
  }

  return {
    id: state.autoForgeRequestId,
    revision: state.autoForgeRequestRevision,
    lifecycle,
  };
}

function handleForgeZodExecutionError(
  error: ZodError,
  {
    dispatch,
    syncStep,
  }: Pick<ForgeExecutionErrorContext, "dispatch" | "syncStep">,
) {
  const message = getZodIssueMessage(error);

  showForgePlanValidationToast(error, message);
  returnToForgePlanStep({ dispatch, syncStep });
}

function showForgePlanValidationToast(error: Error, message: string) {
  showAppErrorToast(error, {
    fallbackMessage: message,
    id: "forge-plan-validation",
    title: FORGE_PLAN_VALIDATION_TOAST_TITLE,
  });
}

function returnToForgePlanStep({
  dispatch,
  syncStep,
}: Pick<UseForgeExecutionActionsOptions, "dispatch" | "syncStep">) {
  dispatch({
    type: "set-step",
    step: 3,
    navDirection: "back",
  });
  syncStep(3, { history: "push" });
}

function getForgeSuccessStep(mode: ForgeExecutionMode) {
  return mode === "MANUAL" ? 6 : 5;
}
