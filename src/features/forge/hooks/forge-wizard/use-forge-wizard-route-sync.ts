import { useEffect, useRef } from "react";

import type {
  ForgeWizardRouteSyncOptions,
  ForgeWizardRouteSyncResult,
} from "@/features/forge/hooks/forge-wizard/forge-wizard-hook.types";
import { selectForgeIdeaTemplate } from "@/features/forge/lib/forge-idea-template";

type ForgeWizardState = ForgeWizardRouteSyncOptions["state"];
type ForgeReadySnapshot = {
  forgeResult: ForgeWizardState["forgeResult"];
  participantsLength: number;
};

function getForgeReadySnapshot(
  forgeResult: ForgeReadySnapshot["forgeResult"],
  participantsLength: number,
): ForgeReadySnapshot {
  return {
    forgeResult,
    participantsLength,
  };
}

function hasLiveForgeState(snapshot: ForgeReadySnapshot) {
  return snapshot.forgeResult !== "IDLE" || snapshot.participantsLength > 0;
}

function getRouteStepSyncState(
  routeStep: ForgeWizardRouteSyncOptions["routeStep"],
  snapshot: ForgeReadySnapshot,
) {
  const shouldResetTargets = routeStep > 4 && !hasLiveForgeState(snapshot);

  return {
    nextStep: shouldResetTargets ? 4 : routeStep,
    shouldResetTargets,
  };
}

export function useForgeWizardRouteSync({
  consumeLaunch,
  dispatch,
  enterGroupHub,
  resetInvalidLaunch,
  routeActivityId,
  routeGroupId,
  routeIdea,
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
  const consumedLaunchTemplateIdRef = useRef(state.appliedTemplateId);
  const ignoredLaunchRouteStepRef = useRef(false);
  const recoveredGroupIdRef = useRef<string | null>(null);
  const forgeReadyRef = useRef(
    getForgeReadySnapshot(state.forgeResult, state.participants.length),
  );

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
    forgeReadyRef.current = getForgeReadySnapshot(
      state.forgeResult,
      state.participants.length,
    );
  }, [state.forgeResult, state.participants.length]);

  useEffect(() => {
    if (modeRef.current !== routeMode) {
      dispatch({
        type: "set-field",
        field: "forgeMode",
        value: routeMode,
      });
      dispatch({
        type: "set-field",
        field: "planScheduleMode",
        value: routeMode === "AUTO" ? "TO_BE_DECIDED" : "FIXED",
      });
      if (routeMode === "AUTO") {
        dispatch({ type: "set-field", field: "planDate", value: "" });
        dispatch({ type: "set-field", field: "planTime", value: "" });
      }
    }
  }, [dispatch, routeMode]);

  useEffect(() => {
    if (!routeIdea) {
      consumedLaunchTemplateIdRef.current = null;
      ignoredLaunchRouteStepRef.current = false;
      return;
    }

    const selection = selectForgeIdeaTemplate(routeIdea);

    if (!selection) {
      consumedLaunchTemplateIdRef.current = null;
      ignoredLaunchRouteStepRef.current = true;

      stepRef.current = 1;
      resetInvalidLaunch();

      consumeLaunch({ resetStep: true });
      return;
    }

    ignoredLaunchRouteStepRef.current = false;

    if (consumedLaunchTemplateIdRef.current !== selection.id) {
      consumedLaunchTemplateIdRef.current = selection.id;
      dispatch({
        type: "apply-activity-template",
        template: selection.template,
        templateId: selection.id,
      });
    }

    consumeLaunch();
  }, [consumeLaunch, dispatch, resetInvalidLaunch, routeIdea]);

  useEffect(() => {
    if (ignoredLaunchRouteStepRef.current) {
      return;
    }

    const { nextStep, shouldResetTargets } = getRouteStepSyncState(
      routeStep,
      forgeReadyRef.current,
    );

    if (shouldResetTargets && routeGroupId) {
      if (recoveredGroupIdRef.current !== routeGroupId) {
        recoveredGroupIdRef.current = routeGroupId;
        void enterGroupHub(routeGroupId);
      }
      return;
    }

    if (shouldResetTargets) {
      syncStep(4, { history: "replace" });
      syncTargets({
        activityId: null,
        groupId: null,
        requestId: null,
      });
    }

    if (stepRef.current !== nextStep) {
      dispatch({
        type: "set-step",
        step: nextStep,
        navDirection: nextStep > stepRef.current ? "forward" : "back",
      });
    }
  }, [dispatch, enterGroupHub, routeGroupId, routeStep, syncStep, syncTargets]);

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
