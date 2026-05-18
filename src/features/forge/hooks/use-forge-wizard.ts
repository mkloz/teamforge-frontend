import { useCallback, useEffect, useReducer, useRef } from "react";
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
import type { ForgeIdeaLaunch } from "@/features/forge/lib/forge-route";
import type { Step } from "@/features/forge/lib/forge-wizard";
import {
  createInitialForgeWizardState,
  forgeWizardReducer,
  getNextStep,
  getPreviousStep,
} from "@/features/forge/lib/forge-wizard";

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
  const [state, dispatch] = useReducer(
    forgeWizardReducer,
    {
      routeIdea,
      routeMode,
      routeStep,
    },
    createInitialForgeWizardStateForRoute,
  );
  const { forgeStrikeCount, isForging, forgingProgress, runForgeAnimation } =
    useForgeAnimation();
  const closeResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
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
      if (closeResetTimeoutRef.current) {
        clearTimeout(closeResetTimeoutRef.current);
      }

      if (inviteCopiedTimeoutRef.current) {
        clearTimeout(inviteCopiedTimeoutRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  const close = useCallback(() => {
    onClose();
    if (closeResetTimeoutRef.current) {
      clearTimeout(closeResetTimeoutRef.current);
    }

    closeResetTimeoutRef.current = setTimeout(() => {
      reset();
      closeResetTimeoutRef.current = null;
    }, 300);
  }, [onClose, reset]);

  const goNext = useCallback(() => {
    const nextStep = getNextStep(stepRef.current);

    dispatch({
      type: "set-step",
      step: nextStep,
      navDirection: "forward",
    });
    syncStep(nextStep, { history: "push" });
  }, [stepRef, syncStep]);

  const goBack = useCallback(() => {
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
  }, [state.forgeMode, state.forgeResult, stepRef, syncStep]);

  const goToStep = useCallback(
    (step: Step) => {
      dispatch({
        type: "set-step",
        step,
        navDirection: step > stepRef.current ? "forward" : "back",
      });
      syncStep(step, { history: "push" });
    },
    [stepRef, syncStep],
  );

  const handleRemoveParticipant = useCallback((id: string) => {
    dispatch({ type: "remove-participant", userId: id });
  }, []);

  const handleRestoreParticipant = useCallback((id: string) => {
    dispatch({ type: "restore-participant", userId: id });
  }, []);

  const handleReforge = useCallback(() => {
    dispatch({ type: "reforge" });
    syncTargets({
      activityId: null,
      groupId: null,
    });
    syncStep(4, { history: "push" });
  }, [syncStep, syncTargets]);

  const handleCopyLink = useCallback(() => {
    setField("inviteCopied", true);
    if (inviteCopiedTimeoutRef.current) {
      clearTimeout(inviteCopiedTimeoutRef.current);
    }

    inviteCopiedTimeoutRef.current = setTimeout(() => {
      setField("inviteCopied", false);
      inviteCopiedTimeoutRef.current = null;
    }, 2000);
  }, [setField]);

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
  routeIdea: ForgeIdeaLaunch | null;
  routeMode: ForgeMode;
  routeStep: Step;
}) {
  const baseState = {
    ...createInitialForgeWizardState(),
    forgeMode: input.routeMode,
    step: input.routeStep > 4 ? 4 : input.routeStep,
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
