import { useEffect, useLayoutEffect, useReducer, useRef } from "react";
import { useForgeWizardFieldActions } from "@/features/forge/hooks/forge-wizard/field-actions";
import { useForgeWizardDerivedState } from "@/features/forge/hooks/forge-wizard/use-forge-wizard-derived-state";
import { useForgeWizardRouteSync } from "@/features/forge/hooks/forge-wizard/use-forge-wizard-route-sync";
import { useForgeWizardSubmitActions } from "@/features/forge/hooks/forge-wizard/use-forge-wizard-submit-actions";
import { useForgeAnimation } from "@/features/forge/hooks/use-forge-animation";
import type { ForgeMode } from "@/features/forge/lib/forge-contract";
import {
  buildForgeIdeaTemplate,
  buildForgeIdeaTemplateId,
} from "@/features/forge/lib/forge-idea-template";
import type { ForgeWizardData, Step } from "@/features/forge/lib/forge-wizard";
import {
  createInitialForgeWizardState,
  forgeWizardReducer,
  getNextStep,
  getPreviousStep,
} from "@/features/forge/lib/forge-wizard";
import {
  cloneForgeWizardDraft,
  useForgeWizardDraftStore,
} from "@/features/forge/store/use-forge-wizard-draft-store";
import type { ForgeIdeaLaunch } from "@/shared/navigation/forge-navigation";

interface UseForgeWizardOptions {
  onClose: () => void;
  routeStep: Step;
  routeMode: ForgeMode;
  routeActivityId: string | null;
  routeGroupId: string | null;
  routeIdea: ForgeIdeaLaunch | null;
  syncStep: (step: Step, options?: { history?: "push" | "replace" }) => void;
  syncMode: (
    mode: ForgeMode,
    options?: { history?: "push" | "replace" },
  ) => void;
  syncTargets: (targets: {
    activityId?: string | null;
    groupId?: string | null;
  }) => void;
  enterGroupHub: (groupId: string) => Promise<void>;
}

export function useForgeWizard({
  onClose,
  routeStep,
  routeMode,
  routeActivityId,
  routeGroupId,
  routeIdea,
  syncStep,
  syncMode,
  syncTargets,
  enterGroupHub,
}: UseForgeWizardOptions) {
  const initialDraftRef = useRef(useForgeWizardDraftStore.getState().draft);
  const saveDraft = useForgeWizardDraftStore((store) => store.saveDraft);
  const clearDraft = useForgeWizardDraftStore((store) => store.clearDraft);
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

  const { stepRef } = useForgeWizardRouteSync({
    dispatch,
    routeActivityId,
    routeGroupId,
    routeIdea,
    routeMode,
    routeStep,
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
      state.forgeMode === "MANUAL" &&
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
  }

  function handleReforge() {
    dispatch({ type: "reforge" });
    syncTargets({
      activityId: null,
      groupId: null,
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
}) {
  const initialState = getInitialForgeWizardState(input.draft);
  const hasLiveState = hasLiveForgeState(initialState);
  const baseState = {
    ...initialState,
    forgeMode: input.routeMode,
    step: getInitialRouteStep(input.routeStep, hasLiveState),
  };

  if (!input.routeIdea) {
    return baseState;
  }

  return forgeWizardReducer(baseState, {
    type: "apply-activity-template",
    template: buildForgeIdeaTemplate(input.routeIdea),
    templateId: buildForgeIdeaTemplateId(input.routeIdea),
  });
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
