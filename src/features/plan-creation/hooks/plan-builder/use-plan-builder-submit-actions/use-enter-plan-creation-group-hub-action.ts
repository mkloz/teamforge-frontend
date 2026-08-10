import type { UsePlanBuilderSubmitActionsOptions } from "./types";

type UseEnterPlanCreationGroupHubActionOptions = Pick<
  UsePlanBuilderSubmitActionsOptions,
  "close" | "enterGroupHub" | "state"
>;

export function useEnterPlanCreationGroupHubAction({
  close,
  enterGroupHub,
  state,
}: UseEnterPlanCreationGroupHubActionOptions) {
  return async () => {
    if (!state.groupId) {
      close();
      return;
    }

    await enterGroupHub(state.groupId);
  };
}
