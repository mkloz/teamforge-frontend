import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";
import { usePlanBuilderFieldActions } from "@/features/plan-creation/hooks/plan-builder/field-actions";
import { usePlanBuilderDerivedState } from "@/features/plan-creation/hooks/plan-builder/use-plan-builder-derived-state";
import { usePlanBuilderRouteSync } from "@/features/plan-creation/hooks/plan-builder/use-plan-builder-route-sync";
import { usePlanBuilderSubmitActions } from "@/features/plan-creation/hooks/plan-builder/use-plan-builder-submit-actions";
import { usePlanCreationAnimation } from "@/features/plan-creation/hooks/use-plan-creation-animation";
import type {
  PlanBuilderData,
  Step,
} from "@/features/plan-creation/lib/plan-builder";
import {
  createInitialPlanBuilderState,
  getNextStep,
  getPreviousStep,
  planBuilderReducer,
} from "@/features/plan-creation/lib/plan-builder";
import type { GroupFormationMode } from "@/features/plan-creation/lib/plan-creation-contract";
import { selectPlanIdeaTemplate } from "@/features/plan-creation/lib/plan-idea-template";
import { isRecentActivityTemplateId } from "@/features/plan-creation/lib/recent-activity/recent-activity-template-id";
import { readPlanBuilderDraft } from "@/features/plan-creation/store/plan-builder-session-storage";
import {
  clonePlanBuilderDraft,
  usePlanBuilderDraftStore,
} from "@/features/plan-creation/store/use-plan-builder-draft-store";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import type { PlanIdeaLaunch } from "@/shared/navigation/plan-creation-navigation";

interface UsePlanBuilderOptions {
  initialDraft?: PlanBuilderData | null;
  onClose: () => void;
  routeStep: Step;
  routeMode: GroupFormationMode;
  routeActivityId: string | null;
  routeGroupId: string | null;
  routeIdea: PlanIdeaLaunch | null;
  consumeLaunch: (options?: { resetStep?: boolean }) => void;
  syncStep: (step: Step, options?: { history?: "push" | "replace" }) => void;
  syncMode: (
    mode: GroupFormationMode,
    options?: { history?: "push" | "replace" },
  ) => void;
  syncTargets: (targets: {
    activityId?: string | null;
    groupId?: string | null;
    requestId?: string | null;
  }) => void;
  enterGroupHub: (groupId: string) => Promise<void>;
}

export function usePlanBuilder({
  initialDraft,
  onClose,
  routeStep,
  routeMode,
  routeActivityId,
  routeGroupId,
  routeIdea,
  consumeLaunch,
  syncStep,
  syncMode,
  syncTargets,
  enterGroupHub,
}: UsePlanBuilderOptions) {
  const initialDraftRef = useRef(
    initialDraft ??
      usePlanBuilderDraftStore.getState().draft ??
      readPlanBuilderDraft(),
  );
  const saveDraft = usePlanBuilderDraftStore((store) => store.saveDraft);
  const clearDraft = usePlanBuilderDraftStore((store) => store.clearDraft);
  const shouldPersistInitialLaunchRef = useRef<boolean | null>(null);
  const hasPersistedStateRef = useRef(false);
  const skipNextDraftPersistRef = useRef(false);
  const currentUserQuery = useCurrentUserQuery();
  const locationContext = {
    isLoading: currentUserQuery.isLoading,
    locationLat: currentUserQuery.data?.locationLat ?? null,
    locationLng: currentUserQuery.data?.locationLng ?? null,
  };
  const [state, dispatch] = useReducer(
    planBuilderReducer,
    {
      draft: initialDraftRef.current,
      routeIdea,
      routeMode,
      routeStep,
    },
    createInitialPlanBuilderStateForRoute,
  );
  const {
    planCreationStrikeCount,
    isCreatingPlan,
    creationProgress,
    runPlanCreationAnimation,
  } = usePlanCreationAnimation();
  const inviteCopiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  if (shouldPersistInitialLaunchRef.current === null) {
    shouldPersistInitialLaunchRef.current = Boolean(
      routeIdea && selectPlanIdeaTemplate(routeIdea),
    );
  }

  const resetInvalidLaunch = useCallback(() => {
    dispatch({ type: "set-step", step: 1, navDirection: "back" });
  }, []);

  const { stepRef } = usePlanBuilderRouteSync({
    dispatch,
    consumeLaunch,
    enterGroupHub,
    routeActivityId,
    routeGroupId,
    routeIdea,
    routeMode,
    routeStep,
    resetInvalidLaunch,
    state,
    syncStep,
    syncTargets,
  });

  const { setField, ...fieldActions } = usePlanBuilderFieldActions({
    dispatch,
    state,
    syncMode,
  });

  useEffect(() => {
    return () => {
      if (inviteCopiedTimeoutRef.current) {
        clearTimeout(inviteCopiedTimeoutRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (!hasPersistedStateRef.current) {
      hasPersistedStateRef.current = true;

      if (shouldPersistInitialLaunchRef.current) {
        saveDraft(state);
      }

      return;
    }

    if (skipNextDraftPersistRef.current) {
      skipNextDraftPersistRef.current = false;
      return;
    }

    saveDraft(state);
  }, [saveDraft, state]);

  function reset() {
    skipNextDraftPersistRef.current = true;
    clearDraft();
    dispatch({ type: "reset" });
  }

  function close() {
    reset();
    onClose();
  }

  function goNext() {
    const nextStep = getNextStep(stepRef.current);

    dispatch({
      type: "set-step",
      step: nextStep,
      navDirection: "forward",
    });
    syncStep(nextStep, { history: "push" });
  }

  function goBack() {
    const previousStep =
      stepRef.current === 3 &&
      isRecentActivityTemplateId(state.appliedTemplateId)
        ? 1
        : state.groupFormationMode === "MANUAL" &&
            stepRef.current === 6 &&
            state.groupFormationResult === "SUCCESS"
          ? 4
          : getPreviousStep(stepRef.current);

    dispatch({
      type: "set-step",
      step: previousStep,
      navDirection: "back",
    });
    syncStep(previousStep, { history: "push" });
  }

  function goToStep(step: Step) {
    dispatch({
      type: "set-step",
      step,
      navDirection: step > stepRef.current ? "forward" : "back",
    });
    syncStep(step, { history: "push" });
  }

  function handleRemoveParticipant(id: string) {
    dispatch({ type: "remove-participant", userId: id });
  }

  function handleRestoreParticipant(id: string) {
    dispatch({ type: "restore-participant", userId: id });

    const targetSize =
      state.groupFormationMode === "AUTO" ? state.autoMaxSize : state.fixedSize;
    const activeParticipantCountAfterRestore = state.participants.filter(
      (participant) =>
        participant.userId === id || !state.removedIds.has(participant.userId),
    ).length;
    const availableInviteSlots = Math.max(
      0,
      targetSize - 1 - activeParticipantCountAfterRestore,
    );

    if (state.manualInviteeIds.length > availableInviteSlots) {
      setField(
        "manualInviteeIds",
        state.manualInviteeIds.slice(0, availableInviteSlots),
      );
    }
  }

  function handleResultInviteeToggle(inviteeId: string) {
    const alreadySelected = state.manualInviteeIds.includes(inviteeId);
    if (alreadySelected) {
      setField(
        "manualInviteeIds",
        state.manualInviteeIds.filter((id) => id !== inviteeId),
      );
      return;
    }

    const targetSize =
      state.groupFormationMode === "AUTO" ? state.autoMaxSize : state.fixedSize;
    const activeParticipantCount = state.participants.filter(
      (participant) => !state.removedIds.has(participant.userId),
    ).length;
    const availableInviteSlots = Math.max(
      0,
      targetSize - 1 - activeParticipantCount,
    );

    if (state.manualInviteeIds.length < availableInviteSlots) {
      setField("manualInviteeIds", [...state.manualInviteeIds, inviteeId]);
    }
  }

  function handleRevisePlan() {
    dispatch({ type: "revisePlan" });
    syncTargets({
      activityId: null,
      groupId: null,
      requestId: null,
    });
    syncStep(4, { history: "push" });
  }

  function handleCopyLink() {
    setField("inviteCopied", true);
    if (inviteCopiedTimeoutRef.current) {
      clearTimeout(inviteCopiedTimeoutRef.current);
    }

    inviteCopiedTimeoutRef.current = setTimeout(() => {
      setField("inviteCopied", false);
      inviteCopiedTimeoutRef.current = null;
    }, 2000);
  }

  const submitActions = usePlanBuilderSubmitActions({
    close,
    dispatch,
    enterGroupHub,
    goNext,
    locationContext,
    runPlanCreationAnimation,
    setField,
    state,
    syncStep,
    syncTargets,
  });
  const derivedState = usePlanBuilderDerivedState(state, locationContext);

  return {
    ...state,
    ...derivedState,
    ...fieldActions,
    ...submitActions,
    planCreationStrikeCount,
    isCreatingPlan,
    creationProgress,
    goNext,
    goBack,
    goToStep,
    close,
    handleRemoveParticipant,
    handleRestoreParticipant,
    handleResultInviteeToggle,
    handleRevisePlan,
    handleCopyLink,
  };
}

export type { Step } from "@/features/plan-creation/lib/plan-builder";
export type PlanBuilderState = ReturnType<typeof usePlanBuilder>;

function createInitialPlanBuilderStateForRoute(input: {
  draft: PlanBuilderData | null;
  routeIdea: PlanIdeaLaunch | null;
  routeMode: GroupFormationMode;
  routeStep: Step;
}): PlanBuilderData {
  const initialState = getInitialPlanBuilderState(input.draft);
  const hasLiveState = hasLivePlanCreationState(initialState);
  const routeChangedMode = initialState.groupFormationMode !== input.routeMode;
  const baseState = {
    ...initialState,
    groupFormationMode: input.routeMode,
    planScheduleMode: routeChangedMode
      ? getDefaultScheduleMode(input.routeMode)
      : initialState.planScheduleMode,
    planDate:
      routeChangedMode && input.routeMode === "AUTO"
        ? ""
        : initialState.planDate,
    planTime:
      routeChangedMode && input.routeMode === "AUTO"
        ? ""
        : initialState.planTime,
    step: getInitialRouteStep(input.routeStep, hasLiveState),
  };

  if (!input.routeIdea) {
    return baseState;
  }

  const selection = selectPlanIdeaTemplate(input.routeIdea);

  if (!selection) {
    return { ...baseState, step: 1 };
  }

  return planBuilderReducer(baseState, {
    type: "apply-activity-template",
    template: selection.template,
    templateId: selection.id,
  });
}

function getDefaultScheduleMode(mode: GroupFormationMode) {
  return mode === "AUTO" ? "TO_BE_DECIDED" : "FIXED";
}

function getInitialPlanBuilderState(draft: PlanBuilderData | null) {
  return draft ? clonePlanBuilderDraft(draft) : createInitialPlanBuilderState();
}

function hasLivePlanCreationState(state: PlanBuilderData) {
  return state.groupFormationResult !== "IDLE" || state.participants.length > 0;
}

function getInitialRouteStep(routeStep: Step, hasLiveState: boolean): Step {
  return routeStep > 4 && !hasLiveState ? 4 : routeStep;
}
