import type { UsePlanBuilderSubmitActionsOptions } from "./types";
import { useApplyParticipantSelectionAction } from "./use-apply-participant-selection-action";
import { useEnterPlanCreationGroupHubAction } from "./use-enter-plan-creation-group-hub-action";
import { useGroupFormationExecutionActions } from "./use-group-formation-execution-actions";
import { useSavePlanCreationIdentityAction } from "./use-save-plan-creation-identity-action";
import { useSendPlanCreationInvitesAction } from "./use-send-plan-creation-invites-action";

export function usePlanBuilderSubmitActions({
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
}: UsePlanBuilderSubmitActionsOptions) {
  const groupFormationExecutionActions = useGroupFormationExecutionActions({
    dispatch,
    locationContext,
    runPlanCreationAnimation,
    setField,
    state,
    syncStep,
    syncTargets,
  });
  const participantSelectionAction = useApplyParticipantSelectionAction({
    goNext,
    state,
  });
  const identityAction = useSavePlanCreationIdentityAction({ goNext, state });
  const inviteAction = useSendPlanCreationInvitesAction({ setField, state });
  const handleEnterGroupHub = useEnterPlanCreationGroupHubAction({
    close,
    enterGroupHub,
    state,
  });

  return {
    ...groupFormationExecutionActions,
    ...participantSelectionAction,
    handleEnterGroupHub,
    ...identityAction,
    ...inviteAction,
  };
}
