import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";
import { useForgeWizardFieldActions } from "@/features/forge/hooks/forge-wizard/field-actions";
import { useForgeWizardDerivedState } from "@/features/forge/hooks/forge-wizard/use-forge-wizard-derived-state";
import { useForgeWizardRouteSync } from "@/features/forge/hooks/forge-wizard/use-forge-wizard-route-sync";
import { useForgeWizardSubmitActions } from "@/features/forge/hooks/forge-wizard/use-forge-wizard-submit-actions";
import { useForgeAnimation } from "@/features/forge/hooks/use-forge-animation";
import type { ForgeMode } from "@/features/forge/lib/forge-contract";
import { selectForgeIdeaTemplate } from "@/features/forge/lib/forge-idea-template";
import type { ForgeWizardData, Step } from "@/features/forge/lib/forge-wizard";
import {
  createInitialForgeWizardState,
  forgeWizardReducer,
  getNextStep,
  getPreviousStep,
} from "@/features/forge/lib/forge-wizard";
import { isRecentActivityTemplateId } from "@/features/forge/lib/recent-activity/recent-activity-template-id";
import { readForgeWizardDraft } from "@/features/forge/store/forge-wizard-session-storage";
import {
  cloneForgeWizardDraft,
  useForgeWizardDraftStore,
} from "@/features/forge/store/use-forge-wizard-draft-store";
import type { ForgeIdeaLaunch } from "@/shared/navigation/forge-navigation";

interface UseForgeWizardOptions {
  initialDraft?: ForgeWizardData | null;
  onClose: () => void;
  routeStep: Step;
  routeMode: ForgeMode;
  routeActivityId: string | null;
  routeGroupId: string | null;
  routeIdea: ForgeIdeaLaunch | null;
  consumeLaunch: (options?: { resetStep?: boolean }) => void;
  syncStep: (step: Step, options?: { history?: "push" | "replace" }) => void;
  syncMode: (
    mode: ForgeMode,
    options?: { history?: "push" | "replace" },
  ) => void;
  syncTargets: (targets: {
    activityId?: string | null;
    groupId?: string | null;
    requestId?: string | null;
  }) => void;
  enterGroupHub: (groupId: string) => Promise<void>;
}

export function useForgeWizard({
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
}: UseForgeWizardOptions) {
  const initialDraftRef = useRef(
    initialDraft ??
      useForgeWizardDraftStore.getState().draft ??
      readForgeWizardDraft(),
  );
  const saveDraft = useForgeWizardDraftStore((store) => store.saveDraft);
  const clearDraft = useForgeWizardDraftStore((store) => store.clearDraft);
  const shouldPersistInitialLaunchRef = useRef<boolean | null>(null);
  const hasPersistedStateRef = useRef(false);
  const skipNextDraftPersistRef = useRef(false);
  const [state, dispatch] = useReducer(
    forgeWizardReducer,
    {
      draft: initialDraftRef.current,
      routeIdea,
      routeMode,
      routeStep,
    },
    createInitialForgeWizardStateForRoute,
  );
  const { forgeStrikeCount, isForging, forgingProgress, runForgeAnimation } =
    useForgeAnimation();
  const inviteCopiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  if (shouldPersistInitialLaunchRef.current === null) {
    shouldPersistInitialLaunchRef.current = Boolean(
      routeIdea && selectForgeIdeaTemplate(routeIdea),
    );
  }

  const resetInvalidLaunch = useCallback(() => {
    dispatch({ type: "set-step", step: 1, navDirection: "back" });
  }, []);

  const { stepRef } = useForgeWizardRouteSync({
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

  const { setField, ...fieldActions } = useForgeWizardFieldActions({
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
        : state.forgeMode === "MANUAL" &&
            stepRef.current === 6 &&
            state.forgeResult === "SUCCESS"
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
      state.forgeMode === "AUTO" ? state.autoMaxSize : state.fixedSize;
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
      state.forgeMode === "AUTO" ? state.autoMaxSize : state.fixedSize;
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

  function handleReforge() {
    dispatch({ type: "reforge" });
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

  const submitActions = useForgeWizardSubmitActions({
    close,
    dispatch,
    enterGroupHub,
    goNext,
    runForgeAnimation,
    setField,
    state,
    syncStep,
    syncTargets,
  });
  const derivedState = useForgeWizardDerivedState(state);

  return {
    ...state,
    ...derivedState,
    ...fieldActions,
    ...submitActions,
    forgeStrikeCount,
    isForging,
    forgingProgress,
    goNext,
    goBack,
    goToStep,
    close,
    handleRemoveParticipant,
    handleRestoreParticipant,
    handleResultInviteeToggle,
    handleReforge,
    handleCopyLink,
  };
}

export type { Step } from "@/features/forge/lib/forge-wizard";
export type ForgeWizardState = ReturnType<typeof useForgeWizard>;

function createInitialForgeWizardStateForRoute(input: {
  draft: ForgeWizardData | null;
  routeIdea: ForgeIdeaLaunch | null;
  routeMode: ForgeMode;
  routeStep: Step;
}): ForgeWizardData {
  const initialState = getInitialForgeWizardState(input.draft);
  const hasLiveState = hasLiveForgeState(initialState);
  const routeChangedMode = initialState.forgeMode !== input.routeMode;
  const baseState = {
    ...initialState,
    forgeMode: input.routeMode,
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

  const selection = selectForgeIdeaTemplate(input.routeIdea);

  if (!selection) {
    return { ...baseState, step: 1 };
  }

  return forgeWizardReducer(baseState, {
    type: "apply-activity-template",
    template: selection.template,
    templateId: selection.id,
  });
}

function getDefaultScheduleMode(mode: ForgeMode) {
  return mode === "AUTO" ? "TO_BE_DECIDED" : "FIXED";
}

function getInitialForgeWizardState(draft: ForgeWizardData | null) {
  return draft ? cloneForgeWizardDraft(draft) : createInitialForgeWizardState();
}

function hasLiveForgeState(state: ForgeWizardData) {
  return state.forgeResult !== "IDLE" || state.participants.length > 0;
}

function getInitialRouteStep(routeStep: Step, hasLiveState: boolean): Step {
  return routeStep > 4 && !hasLiveState ? 4 : routeStep;
}
