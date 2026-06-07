import { useCallback } from "react";
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

  const executeForge = useCallback(
    (mode: ForgeExecutionMode) => {
      if (
        guardOfflineAction({
          id: "forge-execution-offline",
          description: "Reconnect before forming a TeamForge group.",
        })
      ) {
        return;
      }

      const mutationName = getForgeMutationName(mode);
      const canReusePendingActivity =
        mode === "AUTO" && Boolean(state.activityId);
      const validation = canReusePendingActivity
        ? null
        : getForgeExecutionValidation(state);

      if (validation && !validation.canSubmit) {
        const message =
          validation.message ??
          "Finish the plan details before forming the group.";

        showAppErrorToast(new Error(message), {
          fallbackMessage: message,
          id: "forge-plan-validation",
          title: FORGE_PLAN_VALIDATION_TOAST_TITLE,
        });
        dispatch({
          type: "set-step",
          step: 3,
          navDirection: "back",
        });
        syncStep(3, { history: "push" });
        return;
      }

      runForgeAnimation(async () => {
        const successStep = mode === "MANUAL" ? 6 : 5;
        const result = await executeForgeCommand(
          mode,
          state,
          validation?.input ?? null,
        ).catch((error) => {
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
            const message = getZodIssueMessage(error);

            showAppErrorToast(error, {
              fallbackMessage: message,
              id: "forge-plan-validation",
              title: FORGE_PLAN_VALIDATION_TOAST_TITLE,
            });
            dispatch({
              type: "set-step",
              step: 3,
              navDirection: "back",
            });
            syncStep(3, { history: "push" });
            return null;
          }

          applyForgeExecutionFailure(error, state, {
            dispatch,
            mutationName,
            syncStep,
            syncTargets,
          });
          return null;
        });

        if (!result) {
          return;
        }

        applyForgeExecutionResult(result, {
          dispatch,
          mutationName,
          successStep,
          syncStep,
          syncTargets,
        });

        if (result.activityId && result.searchKept) {
          markSearchKept(result.activityId);
        }
      });
    },
    [
      dispatch,
      guardOfflineAction,
      markSearchKept,
      runForgeAnimation,
      state,
      syncStep,
      syncTargets,
    ],
  );

  const handleManualForge = useCallback(() => {
    executeForge("MANUAL");
  }, [executeForge]);

  const handleAutoForge = useCallback(() => {
    executeForge("AUTO");
  }, [executeForge]);

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
