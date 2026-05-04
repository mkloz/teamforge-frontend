import { useCallback } from "react";

import type { UseForgeWizardSubmitActionsOptions } from "./types";

type UseEnterForgeGroupHubActionOptions = Pick<
  UseForgeWizardSubmitActionsOptions,
  "close" | "enterGroupHub" | "state"
>;

export function useEnterForgeGroupHubAction({
  close,
  enterGroupHub,
  state,
}: UseEnterForgeGroupHubActionOptions) {
  return useCallback(async () => {
    if (!state.groupId) {
      close();
      return;
    }

    await enterGroupHub(state.groupId);
  }, [close, enterGroupHub, state.groupId]);
}
