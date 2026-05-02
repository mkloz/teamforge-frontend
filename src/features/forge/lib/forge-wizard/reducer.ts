import { createInitialForgeWizardState } from "./initial-state";
import { getNextStep, getPreviousStep } from "./navigation";
import type { ForgeWizardAction, ForgeWizardData } from "./types";

export function forgeWizardReducer(
  state: ForgeWizardData,
  action: ForgeWizardAction,
): ForgeWizardData {
  switch (action.type) {
    case "reset":
      return createInitialForgeWizardState();
    case "set-step":
      return {
        ...state,
        navDirection: action.navDirection,
        step: action.step,
      };
    case "go-next":
      return {
        ...state,
        navDirection: "forward",
        step: getNextStep(state.step),
      };
    case "go-back":
      return {
        ...state,
        navDirection: "back",
        step: getPreviousStep(state.step),
      };
    case "set-field":
      return {
        ...state,
        [action.field]: action.value,
      };
    case "apply-forge-result":
      return {
        ...state,
        navDirection: "forward",
        step: 4,
        forgeResult: action.result,
        participants: action.participants,
        activityId: action.activityId,
        groupId: action.groupId,
        chatId: action.chatId,
        planId: action.planId,
        removedIds: new Set(),
      };
    case "remove-participant":
      return {
        ...state,
        removedIds: new Set([...state.removedIds, action.userId]),
      };
    case "restore-participant": {
      const nextRemovedIds = new Set(state.removedIds);
      nextRemovedIds.delete(action.userId);

      return {
        ...state,
        removedIds: nextRemovedIds,
      };
    }
    case "reforge":
      return {
        ...state,
        navDirection: "back",
        step: 3,
        forgeResult: "IDLE",
        participants: [],
        manualInviteeIds: [],
        activityId: null,
        groupId: null,
        chatId: null,
        planId: null,
        removedIds: new Set(),
      };
    default:
      return state;
  }
}
