import { useKeptForgeSearch } from "../use-kept-forge-search";
import type { UseForgeWizardSubmitActionsOptions } from "./types";
import { useEnterForgeGroupHubAction } from "./use-enter-forge-group-hub-action";
import { useForgeExecutionActions } from "./use-forge-execution-actions";
import { useSaveForgeIdentityAction } from "./use-save-forge-identity-action";
import { useSendForgeInvitesAction } from "./use-send-forge-invites-action";

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
  const {
    handleKeepSearchingChange,
    isKeepingSearch,
    isSearchKept,
    markSearchKept,
  } = useKeptForgeSearch(state);

  const forgeExecutionActions = useForgeExecutionActions({
    dispatch,
    markSearchKept,
    runForgeAnimation,
    state,
    syncStep,
    syncTargets,
  });
  const identityAction = useSaveForgeIdentityAction({ goNext, state });
  const inviteAction = useSendForgeInvitesAction({ setField, state });
  const handleEnterGroupHub = useEnterForgeGroupHubAction({
    close,
    enterGroupHub,
    state,
  });

  return {
    ...forgeExecutionActions,
    handleEnterGroupHub,
    handleKeepSearchingChange,
    ...identityAction,
    ...inviteAction,
    isKeepingSearch,
    isSearchKept,
  };
}
