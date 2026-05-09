import { useCallback } from "react";

import { ForgeCommands } from "@/features/forge/api/forge-commands";
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
  const executeForge = useCallback(
    (mode: ForgeExecutionMode) => {
      const mutationName = getForgeMutationName(mode);

      runForgeAnimation(async () => {
        const successStep = mode === "MANUAL" ? 6 : 5;
        const result = await executeForgeCommand(mode, state).catch((error) => {
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
    [dispatch, markSearchKept, runForgeAnimation, state, syncStep, syncTargets],
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
