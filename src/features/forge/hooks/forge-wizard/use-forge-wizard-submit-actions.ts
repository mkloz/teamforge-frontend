import { useCallback, useState } from "react";

import { captureException } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

import { ForgeCommands } from "@/features/forge/api/forge-commands";
import type {
  ForgeWizardData,
  ForgeWizardField,
  Step,
} from "@/features/forge/lib/forge-wizard";

import { buildForgeExecutionInput } from "./forge-execution-input";
import {
  applyForgeExecutionFailure,
  applyForgeExecutionResult,
} from "./forge-submit-results";
import type { ForgeWizardDispatch } from "./forge-wizard-hook.types";

interface UseForgeWizardSubmitActionsOptions {
  close: () => void;
  dispatch: ForgeWizardDispatch;
  enterGroupHub: (groupId: string) => Promise<void>;
  goNext: () => void;
  runForgeAnimation: (onComplete: () => void | Promise<void>) => void;
  setField: (
    field: ForgeWizardField,
    value: ForgeWizardData[ForgeWizardField],
  ) => void;
  state: ForgeWizardData;
  syncStep: (step: Step, options?: { history?: "push" | "replace" }) => void;
  syncTargets: (targets: {
    activityId?: string | null;
    groupId?: string | null;
  }) => void;
}

export function useForgeWizardSubmitActions({
  close,
  dispatch,
  enterGroupHub,
  goNext,
  runForgeAnimation,
  setField,
  state,
  syncStep,
  syncTargets,
}: UseForgeWizardSubmitActionsOptions) {
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const [isSendingInvites, setIsSendingInvites] = useState(false);

  const executeForge = useCallback(
    (mode: "AUTO" | "MANUAL") => {
      const mutationName =
        mode === "AUTO"
          ? trackedMutationNames.forgeAuto
          : trackedMutationNames.forgeManual;

      runForgeAnimation(async () => {
        try {
          const input = buildForgeExecutionInput(state);
          const result =
            mode === "AUTO"
              ? await ForgeCommands.executeAutoForge(input)
              : await ForgeCommands.executeManualForge(input);

          applyForgeExecutionResult(result, {
            dispatch,
            mutationName,
            syncStep,
            syncTargets,
          });
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
    [dispatch, runForgeAnimation, state, syncStep, syncTargets],
  );

  const handleManualForge = useCallback(() => {
    executeForge("MANUAL");
  }, [executeForge]);

  const handleAutoForge = useCallback(() => {
    executeForge("AUTO");
  }, [executeForge]);

  const handleSaveIdentityAndContinue = useCallback(async () => {
    setIsSavingIdentity(true);

    try {
      await ForgeCommands.saveForgedIdentity({
        groupId: state.groupId,
        planId: state.planId,
        groupName: state.groupName,
        groupDescription: state.groupDescription,
        avatarImage: state.avatarImage,
        coverImage: state.coverImage,
      });
      goNext();
    } catch (error) {
      captureException("forge.saveIdentity", error, {
        groupId: state.groupId ?? "missing",
      });
      goNext();
    } finally {
      setIsSavingIdentity(false);
    }
  }, [
    goNext,
    state.avatarImage,
    state.coverImage,
    state.groupDescription,
    state.groupId,
    state.groupName,
    state.planId,
  ]);

  const handleSendInvites = useCallback(async () => {
    setIsSendingInvites(true);

    try {
      if (state.forgeMode === "MANUAL") {
        await ForgeCommands.sendManualInvites({
          groupId: state.groupId,
          inviteeIds: state.manualInviteeIds,
          planName: state.planName,
        });
      }
      setField("invitesSent", true);
    } catch (error) {
      captureException("forge.sendInvites", error, {
        groupId: state.groupId ?? "missing",
      });
    } finally {
      setIsSendingInvites(false);
    }
  }, [
    setField,
    state.forgeMode,
    state.groupId,
    state.manualInviteeIds,
    state.planName,
  ]);

  const handleEnterGroupHub = useCallback(async () => {
    if (!state.groupId) {
      close();
      return;
    }

    await enterGroupHub(state.groupId);
  }, [close, enterGroupHub, state.groupId]);

  return {
    handleAutoForge,
    handleEnterGroupHub,
    handleManualForge,
    handleSaveIdentityAndContinue,
    handleSendInvites,
    isSavingIdentity,
    isSendingInvites,
  };
}
