import { ZodError } from "zod";

import {
  ForgeCommands,
  MissingForgeInterestSignalsError,
} from "@/features/forge/api/forge-commands";
import type { AutoForgeExecutionInput } from "@/features/forge/lib/forge-execution-schema";
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
) {
  if (mode === "AUTO" && state.activityId) {
    return ForgeCommands.executePendingAutoForge(state.activityId);
  }

  if (!input) {
    throw new Error("Forge execution input was not validated.");
  }

  if (mode === "AUTO") {
    return ForgeCommands.executeAutoForge(input);
  }

  return ForgeCommands.executeManualForge(input);
}

interface UseForgeExecutionActionsOptions
  extends Pick<
    UseForgeWizardSubmitActionsOptions,
    "dispatch" | "runForgeAnimation" | "state" | "syncStep" | "syncTargets"
  > {
  markSearchKept: (activityId: string) => void;
}

type ForgeExecutionValidation = ReturnType<typeof getForgeExecutionValidation>;
type ForgeExecutionResult = Parameters<typeof applyForgeExecutionResult>[0];
type ForgeMutationName = ReturnType<typeof getForgeMutationName>;

interface ForgeExecutionErrorContext
  extends Pick<
    UseForgeExecutionActionsOptions,
    "dispatch" | "state" | "syncStep" | "syncTargets"
  > {
  mutationName: ForgeMutationName;
}

interface ForgeAnimationExecutionContext
  extends ForgeExecutionErrorContext,
    Pick<UseForgeExecutionActionsOptions, "markSearchKept"> {
  mode: ForgeExecutionMode;
  validation: ForgeExecutionValidation | null;
}

const FORGE_PLAN_VALIDATION_TOAST_TITLE = "Finish the plan first";

function getZodIssueMessage(error: ZodError) {
  return getForgeExecutionIssueMessage(error.issues[0]);
}

export function useForgeExecutionActions({
  dispatch,
  markSearchKept,
  runForgeAnimation,
  state,
  syncStep,
  syncTargets,
}: UseForgeExecutionActionsOptions) {
  const { guardOfflineAction } = useOfflineActionGuard();

  function executeForge(mode: ForgeExecutionMode) {
    if (
      guardOfflineAction({
        id: "forge-execution-offline",
        description: "Reconnect before forming a TeamForge group.",
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

    runForgeAnimation(async () => {
      await runForgeExecution({
        dispatch,
        markSearchKept,
        mode,
        mutationName,
        state,
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
  mode: ForgeExecutionMode,
  state: UseForgeWizardSubmitActionsOptions["state"],
) {
  return canReusePendingAutoForge(mode, state)
    ? null
    : getForgeExecutionValidation(state);
}

function canReusePendingAutoForge(
  mode: ForgeExecutionMode,
  state: UseForgeWizardSubmitActionsOptions["state"],
) {
  return mode === "AUTO" && Boolean(state.activityId);
}

function handleForgePlanValidationBlock(
  validation: ForgeExecutionValidation,
  {
    dispatch,
    syncStep,
  }: Pick<UseForgeExecutionActionsOptions, "dispatch" | "syncStep">,
) {
  const message =
    validation.message ?? "Finish the plan details before forming the group.";

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
        "Add at least one interest first. It gives TeamForge enough signal to form a group.",
      id: "forge-missing-interest-signals",
      title: "Interests needed",
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

  if (result.activityId && result.searchKept) {
    context.markSearchKept(result.activityId);
  }
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
