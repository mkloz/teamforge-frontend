import { useEffect, useRef } from "react";

import type {
  PlanBuilderRouteSyncOptions,
  PlanBuilderRouteSyncResult,
} from "@/features/plan-creation/hooks/plan-builder/plan-builder-hook.types";
import { selectPlanIdeaTemplate } from "@/features/plan-creation/lib/plan-idea-template";

type PlanBuilderState = PlanBuilderRouteSyncOptions["state"];
type PlanReadySnapshot = {
  groupFormationResult: PlanBuilderState["groupFormationResult"];
  participantsLength: number;
};

function getPlanReadySnapshot(
  groupFormationResult: PlanReadySnapshot["groupFormationResult"],
  participantsLength: number,
): PlanReadySnapshot {
  return {
    groupFormationResult,
    participantsLength,
  };
}

function hasLivePlanCreationState(snapshot: PlanReadySnapshot) {
  return (
    snapshot.groupFormationResult !== "IDLE" || snapshot.participantsLength > 0
  );
}

function getRouteStepSyncState(
  routeStep: PlanBuilderRouteSyncOptions["routeStep"],
  snapshot: PlanReadySnapshot,
) {
  const shouldResetTargets =
    routeStep > 4 && !hasLivePlanCreationState(snapshot);

  return {
    nextStep: shouldResetTargets ? 4 : routeStep,
    shouldResetTargets,
  };
}

export function usePlanBuilderRouteSync({
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
}: PlanBuilderRouteSyncOptions): PlanBuilderRouteSyncResult {
  const stepRef = useRef(state.step);
  const modeRef = useRef(state.groupFormationMode);
  const activityIdRef = useRef(state.activityId);
  const groupIdRef = useRef(state.groupId);
  const consumedLaunchTemplateIdRef = useRef(state.appliedTemplateId);
  const ignoredLaunchRouteStepRef = useRef(false);
  const recoveredGroupIdRef = useRef<string | null>(null);
  const planReadyRef = useRef(
    getPlanReadySnapshot(state.groupFormationResult, state.participants.length),
  );

  useEffect(() => {
    stepRef.current = state.step;
  }, [state.step]);

  useEffect(() => {
    modeRef.current = state.groupFormationMode;
  }, [state.groupFormationMode]);

  useEffect(() => {
    activityIdRef.current = state.activityId;
  }, [state.activityId]);

  useEffect(() => {
    groupIdRef.current = state.groupId;
  }, [state.groupId]);

  useEffect(() => {
    planReadyRef.current = getPlanReadySnapshot(
      state.groupFormationResult,
      state.participants.length,
    );
  }, [state.groupFormationResult, state.participants.length]);

  useEffect(() => {
    if (modeRef.current !== routeMode) {
      dispatch({
        type: "set-field",
        field: "groupFormationMode",
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

    const selection = selectPlanIdeaTemplate(routeIdea);

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
      planReadyRef.current,
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
