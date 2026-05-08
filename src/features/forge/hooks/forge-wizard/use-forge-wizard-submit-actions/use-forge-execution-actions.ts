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
        try {
          const input = buildForgeExecutionInput(state);
          const result =
            mode === "AUTO" && state.activityId
              ? await ForgeCommands.executePendingAutoForge(state.activityId)
              : mode === "AUTO"
                ? await ForgeCommands.executeAutoForge(input)
                : await ForgeCommands.executeManualForge(input);

          applyForgeExecutionResult(result, {
            dispatch,
            mutationName,
            successStep: mode === "MANUAL" ? 6 : 5,
            syncStep,
            syncTargets,
          });

          if (result.activityId && result.searchKept) {
            markSearchKept(result.activityId);
          }
        } catch (error) {
          applyForgeExecutionFailure(error, state, {
            dispatch,
            mutationName,
            syncStep,
            syncTargets,
          });
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
