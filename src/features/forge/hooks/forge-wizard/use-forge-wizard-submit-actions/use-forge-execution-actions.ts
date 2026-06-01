import { useCallback } from "react";

import {
  ForgeCommands,
  MissingForgeInterestSignalsError,
} from "@/features/forge/api/forge-commands";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

import { buildForgeExecutionInput } from "../forge-execution-input";
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
) {
  const input = buildForgeExecutionInput(state);

  if (mode === "AUTO" && state.activityId) {
    return ForgeCommands.executePendingAutoForge(state.activityId);
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

      runForgeAnimation(async () => {
        const successStep = mode === "MANUAL" ? 6 : 5;
        const result = await executeForgeCommand(mode, state).catch((error) => {
          if (error instanceof MissingForgeInterestSignalsError) {
            showAppErrorToast(error, {
              fallbackMessage:
                "Add at least one interest first. It gives TeamForge enough signal to form a group.",
              id: "forge-missing-interest-signals",
              title: "Interests needed",
            });
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
