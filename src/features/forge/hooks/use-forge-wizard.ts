import { useCallback, useReducer } from "react";
import { useForgeAnimation } from "./use-forge-animation";
import {
  createInitialForgeWizardState,
  forgeWizardReducer,
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
} from "../lib/forge-wizard.reducer";

export function useForgeWizard(onClose: () => void) {
  const [state, dispatch] = useReducer(
    forgeWizardReducer,
    undefined,
    createInitialForgeWizardState,
  );
  const { isForging, forgingProgress, runForgeAnimation } = useForgeAnimation();

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
    dispatch({ type: "go-next" });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: "go-back" });
  }, []);

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
    (value: ForgeMode) => setField("forgeMode", value),
    [setField],
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
      const result = await ForgeQueries.executeManualForge();
      dispatch({
        type: "apply-forge-result",
        result: result.forgeResult,
        participants: result.participants,
        activityId: result.activityId,
        groupId: result.groupId,
        chatId: result.chatId,
        planId: result.planId,
      });
    });
  }, [runForgeAnimation]);

  const handleAutoForge = useCallback(() => {
    runForgeAnimation(async () => {
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
  ]);

  const handleRemoveParticipant = useCallback((id: string) => {
    dispatch({ type: "remove-participant", userId: id });
  }, []);

  const handleRestoreParticipant = useCallback((id: string) => {
    dispatch({ type: "restore-participant", userId: id });
  }, []);

  const handleReforge = useCallback(() => {
    dispatch({ type: "reforge" });
  }, []);

  const handleCopyLink = useCallback(() => {
    dispatch({ type: "set-field", field: "inviteCopied", value: true });
    setTimeout(() => {
      dispatch({ type: "set-field", field: "inviteCopied", value: false });
    }, 2000);
  }, []);

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
  };
}

export type { Step } from "../lib/forge-wizard.reducer";
export type ForgeWizardState = ReturnType<typeof useForgeWizard>;
