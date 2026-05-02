import { useEffect, useRef } from "react";

import type {
  ForgeWizardRouteSyncOptions,
  ForgeWizardRouteSyncResult,
} from "@/features/forge/hooks/forge-wizard/forge-wizard-hook.types";

export function useForgeWizardRouteSync({
  dispatch,
  routeActivityId,
  routeGroupId,
  routeMode,
  routeStep,
  state,
  syncStep,
  syncTargets,
}: ForgeWizardRouteSyncOptions): ForgeWizardRouteSyncResult {
  const stepRef = useRef(state.step);
  const modeRef = useRef(state.forgeMode);
  const activityIdRef = useRef(state.activityId);
  const groupIdRef = useRef(state.groupId);
  const forgeReadyRef = useRef({
    forgeResult: state.forgeResult,
    participantsLength: state.participants.length,
  });

  useEffect(() => {
    stepRef.current = state.step;
  }, [state.step]);

  useEffect(() => {
    modeRef.current = state.forgeMode;
  }, [state.forgeMode]);

  useEffect(() => {
    activityIdRef.current = state.activityId;
  }, [state.activityId]);

  useEffect(() => {
    groupIdRef.current = state.groupId;
  }, [state.groupId]);

  useEffect(() => {
    forgeReadyRef.current = {
      forgeResult: state.forgeResult,
      participantsLength: state.participants.length,
    };
  }, [state.forgeResult, state.participants.length]);

  useEffect(() => {
    if (modeRef.current !== routeMode) {
      dispatch({
        type: "set-field",
        field: "forgeMode",
        value: routeMode,
      });
    }
  }, [dispatch, routeMode]);

  useEffect(() => {
    const hasLiveForgeState =
      forgeReadyRef.current.forgeResult !== "IDLE" ||
      forgeReadyRef.current.participantsLength > 0;
    const nextStep = routeStep > 3 && !hasLiveForgeState ? 3 : routeStep;

    if (routeStep > 3 && !hasLiveForgeState) {
      syncStep(3, { history: "replace" });
      syncTargets({
        activityId: null,
        groupId: null,
      });
    }

    if (stepRef.current !== nextStep) {
      dispatch({
        type: "set-step",
        step: nextStep,
        navDirection: nextStep > stepRef.current ? "forward" : "back",
      });
    }
  }, [dispatch, routeStep, syncStep, syncTargets]);

  useEffect(() => {
    if (routeActivityId !== activityIdRef.current) {
      dispatch({
        type: "set-field",
        field: "activityId",
        value: routeActivityId,
      });
    }

    if (routeGroupId !== groupIdRef.current) {
      dispatch({
        type: "set-field",
        field: "groupId",
        value: routeGroupId,
      });
    }
  }, [dispatch, routeActivityId, routeGroupId]);

  return { stepRef };
}
