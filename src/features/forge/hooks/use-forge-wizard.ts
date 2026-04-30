import { useCallback, useEffect, useReducer, useRef } from "react";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import { useForgeAnimation } from "./use-forge-animation";
import {
  createInitialForgeWizardState,
  forgeWizardReducer,
  getNextStep,
  getPreviousStep,
} from "../lib/forge-wizard.reducer";
import { ForgeQueries } from "../api/forge.queries";
import type {
  ForgeMode,
  GroupSizeMode,
  LocationType,
  Visibility,
} from "../lib/forge-contract";
import type {
  ForgeWizardData,
  ForgeWizardField,
  Step,
} from "../lib/forge-wizard.reducer";

interface UseForgeWizardOptions {
  onClose: () => void;
  routeStep: Step;
  routeMode: ForgeMode;
  routeActivityId: string | null;
  routeGroupId: string | null;
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
  syncStep,
  syncMode,
  syncTargets,
  enterGroupHub,
}: UseForgeWizardOptions) {
  const [state, dispatch] = useReducer(
    forgeWizardReducer,
    undefined,
    createInitialForgeWizardState,
  );
  const { isForging, forgingProgress, runForgeAnimation } = useForgeAnimation();
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
  }, [routeMode]);

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
  }, [routeStep, syncStep, syncTargets]);

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
  }, [routeActivityId, routeGroupId]);

  const setField = useCallback(
    (field: ForgeWizardField, value: ForgeWizardData[ForgeWizardField]) => {
      dispatch({
        type: "set-field",
        field,
        value,
      });
    },
    [],
  );

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  const close = useCallback(() => {
    onClose();
    setTimeout(reset, 300);
  }, [onClose, reset]);

  const goNext = useCallback(() => {
    const nextStep = getNextStep(stepRef.current);

    dispatch({
      type: "set-step",
      step: nextStep,
      navDirection: "forward",
    });
    syncStep(nextStep, { history: "push" });
  }, [syncStep]);

  const goBack = useCallback(() => {
    const previousStep = getPreviousStep(stepRef.current);

    dispatch({
      type: "set-step",
      step: previousStep,
      navDirection: "back",
    });
    syncStep(previousStep, { history: "push" });
  }, [syncStep]);

  const setSelectedActivity = useCallback(
    (value: string | null) => setField("selectedActivity", value),
    [setField],
  );
  const setPlanName = useCallback(
    (value: string) => setField("planName", value),
    [setField],
  );
  const setGroupName = useCallback(
    (value: string) => setField("groupName", value),
    [setField],
  );
  const setGroupDescription = useCallback(
    (value: string) => setField("groupDescription", value),
    [setField],
  );
  const setPlanDate = useCallback(
    (value: string) => setField("planDate", value),
    [setField],
  );
  const setPlanTime = useCallback(
    (value: string) => setField("planTime", value),
    [setField],
  );
  const setPlanLocation = useCallback(
    (value: string) => setField("planLocation", value),
    [setField],
  );
  const setLocationType = useCallback(
    (value: LocationType) => setField("locationType", value),
    [setField],
  );
  const setForgeMode = useCallback(
    (value: ForgeMode) => {
      setField("forgeMode", value);
      syncMode(value, { history: "replace" });
    },
    [setField, syncMode],
  );
  const setFixedSize = useCallback(
    (value: number) => {
      setField("fixedSize", ForgeQueries.normalizeFixedGroupSize(value));
    },
    [setField],
  );
  const setGroupSizeMode = useCallback(
    (value: GroupSizeMode) => setField("groupSizeMode", value),
    [setField],
  );
  const setAutoMinSize = useCallback(
    (value: number) =>
      setField("autoMinSize", ForgeQueries.normalizeFixedGroupSize(value)),
    [setField],
  );
  const setAutoMaxSize = useCallback(
    (value: number) =>
      setField("autoMaxSize", ForgeQueries.normalizeFixedGroupSize(value)),
    [setField],
  );
  const setCompatibilityWeight = useCallback(
    (value: number) => setField("compatibilityWeight", value),
    [setField],
  );
  const setDiversityWeight = useCallback(
    (value: number) => setField("diversityWeight", value),
    [setField],
  );
  const setVisibility = useCallback(
    (value: Visibility) => setField("visibility", value),
    [setField],
  );
  const setCoverImage = useCallback(
    (value: string | null) => setField("coverImage", value),
    [setField],
  );
  const setAvatarImage = useCallback(
    (value: string | null) => setField("avatarImage", value),
    [setField],
  );
  const setInvitesSent = useCallback(
    (value: boolean) => setField("invitesSent", value),
    [setField],
  );

  const handleManualForge = useCallback(() => {
    runForgeAnimation(async () => {
      try {
        const result = await ForgeQueries.executeManualForge({
          selectedActivity: state.selectedActivity,
          planName: state.planName,
          planDate: state.planDate,
          planTime: state.planTime,
          planLocation: state.planLocation,
          locationType: state.locationType,
          groupSizeMode: state.groupSizeMode,
          fixedSize: state.fixedSize,
          autoMinSize: state.autoMinSize,
          autoMaxSize: state.autoMaxSize,
          visibility: state.visibility,
          groupDescription: state.groupDescription,
        });
        dispatch({
          type: "apply-forge-result",
          result: result.forgeResult,
          participants: result.participants,
          activityId: result.activityId,
          groupId: result.groupId,
          chatId: result.chatId,
          planId: result.planId,
        });
        syncTargets({
          activityId: result.activityId,
          groupId: result.groupId,
        });
        syncStep(4, { history: "push" });
        trackMutationOutcome(
          trackedMutationNames.forgeManual,
          result.forgeResult === "SUCCESS" ? "success" : "error",
          {
            result: result.forgeResult,
            createActivityRequestId: result.requestIds.createActivity,
            forgeActivityRequestId: result.requestIds.forgeActivity,
          },
        );
      } catch (error) {
        captureException(trackedMutationNames.forgeManual, error, {
          selectedActivity: state.selectedActivity ?? "missing",
        });
        trackMutationOutcome(trackedMutationNames.forgeManual, "error", {
          result: "exception",
        });
        dispatch({
          type: "apply-forge-result",
          result: "FAILED",
          participants: [],
          activityId: null,
          groupId: null,
          chatId: null,
          planId: null,
        });
        syncTargets({
          activityId: null,
          groupId: null,
        });
        syncStep(4, { history: "push" });
      }
    });
  }, [
    runForgeAnimation,
    state.autoMaxSize,
    state.autoMinSize,
    state.fixedSize,
    state.groupSizeMode,
    state.groupDescription,
    state.locationType,
    state.planDate,
    state.planLocation,
    state.planName,
    state.planTime,
    state.selectedActivity,
    state.visibility,
    syncStep,
    syncTargets,
  ]);

  const handleAutoForge = useCallback(() => {
    runForgeAnimation(async () => {
      try {
        const result = await ForgeQueries.executeAutoForge({
          selectedActivity: state.selectedActivity,
          planName: state.planName,
          planDate: state.planDate,
          planTime: state.planTime,
          planLocation: state.planLocation,
          locationType: state.locationType,
          groupSizeMode: state.groupSizeMode,
          fixedSize: state.fixedSize,
          autoMinSize: state.autoMinSize,
          autoMaxSize: state.autoMaxSize,
          visibility: state.visibility,
          groupDescription: state.groupDescription,
        });

        dispatch({
          type: "apply-forge-result",
          result: result.forgeResult,
          participants: result.participants,
          activityId: result.activityId,
          groupId: result.groupId,
          chatId: result.chatId,
          planId: result.planId,
        });
        syncTargets({
          activityId: result.activityId,
          groupId: result.groupId,
        });
        syncStep(4, { history: "push" });
        trackMutationOutcome(
          trackedMutationNames.forgeAuto,
          result.forgeResult === "SUCCESS" ? "success" : "error",
          {
            result: result.forgeResult,
            createActivityRequestId: result.requestIds.createActivity,
            forgeActivityRequestId: result.requestIds.forgeActivity,
          },
        );
      } catch (error) {
        captureException(trackedMutationNames.forgeAuto, error, {
          selectedActivity: state.selectedActivity ?? "missing",
        });
        trackMutationOutcome(trackedMutationNames.forgeAuto, "error", {
          result: "exception",
        });
        dispatch({
          type: "apply-forge-result",
          result: "FAILED",
          participants: [],
          activityId: null,
          groupId: null,
          chatId: null,
          planId: null,
        });
        syncTargets({
          activityId: null,
          groupId: null,
        });
        syncStep(4, { history: "push" });
      }
    });
  }, [
    runForgeAnimation,
    state.autoMaxSize,
    state.autoMinSize,
    state.fixedSize,
    state.groupSizeMode,
    state.groupDescription,
    state.locationType,
    state.planDate,
    state.planLocation,
    state.planName,
    state.planTime,
    state.selectedActivity,
    state.visibility,
    syncStep,
    syncTargets,
  ]);

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
    syncStep(3, { history: "push" });
  }, [syncStep, syncTargets]);

  const handleCopyLink = useCallback(() => {
    dispatch({ type: "set-field", field: "inviteCopied", value: true });
    setTimeout(() => {
      dispatch({ type: "set-field", field: "inviteCopied", value: false });
    }, 2000);
  }, []);

  const handleEnterGroupHub = useCallback(async () => {
    if (!state.groupId) {
      close();
      return;
    }

    await enterGroupHub(state.groupId);
  }, [close, enterGroupHub, state.groupId]);

  const activeParticipants = state.participants.filter(
    (participant) => !state.removedIds.has(participant.userId),
  );
  const canAdvanceStep1 = !!state.selectedActivity;
  const canAdvanceStep2 = state.planName.trim().length >= 3;
  const isPreForge = state.step <= 3;
  const canGoBack =
    (state.step > 1 && state.step <= 3) || state.step === 5 || state.step === 6;

  return {
    ...state,
    isForging,
    forgingProgress,
    activeParticipants,
    canAdvanceStep1,
    canAdvanceStep2,
    isPreForge,
    canGoBack,
    setSelectedActivity,
    setPlanName,
    setGroupName,
    setGroupDescription,
    setPlanDate,
    setPlanTime,
    setPlanLocation,
    setLocationType,
    setForgeMode,
    setFixedSize,
    setGroupSizeMode,
    setAutoMinSize,
    setAutoMaxSize,
    setCompatibilityWeight,
    setDiversityWeight,
    setVisibility,
    setCoverImage,
    setAvatarImage,
    setInvitesSent,
    goNext,
    goBack,
    close,
    handleManualForge,
    handleAutoForge,
    handleRemoveParticipant,
    handleRestoreParticipant,
    handleReforge,
    handleCopyLink,
    handleEnterGroupHub,
  };
}

export type { Step } from "../lib/forge-wizard.reducer";
export type ForgeWizardState = ReturnType<typeof useForgeWizard>;
