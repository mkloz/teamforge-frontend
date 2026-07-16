import { normalizeFixedGroupSize } from "@/features/forge/lib/forge-size";
import { createInitialForgeWizardState } from "./initial-state";
import { getNextStep, getPreviousStep, normalizeStep } from "./navigation";
import type { ForgeWizardAction, ForgeWizardData } from "./types";

function clearAppliedTemplateFields(
  state: ForgeWizardData,
  selectedActivity = state.selectedActivity,
): ForgeWizardData {
  const initial = createInitialForgeWizardState();

  return {
    ...state,
    selectedActivity,
    planCategory: null,
    appliedTemplateId: null,
    planName: initial.planName,
    planDescription: initial.planDescription,
    planScheduleMode: initial.planScheduleMode,
    planDate: initial.planDate,
    planTime: initial.planTime,
    planLocation: initial.planLocation,
    planLocationLat: initial.planLocationLat,
    planLocationLng: initial.planLocationLng,
    forgeScope: initial.forgeScope,
    locationType: initial.locationType,
    planCost: initial.planCost,
    planCostAmount: initial.planCostAmount,
    planCostDetails: initial.planCostDetails,
    forgeMode: initial.forgeMode,
    fixedSize: initial.fixedSize,
    groupSizeMode: initial.groupSizeMode,
    autoMinSize: initial.autoMinSize,
    autoMaxSize: initial.autoMaxSize,
    compatibilityWeight: initial.compatibilityWeight,
    diversityWeight: initial.diversityWeight,
    networkReachWeight: initial.networkReachWeight,
    maxDistanceKm: initial.maxDistanceKm,
    visibility: initial.visibility,
    forgeResult: initial.forgeResult,
    participants: initial.participants,
    removedIds: new Set(),
    groupName: initial.groupName,
    groupDescription: initial.groupDescription,
    manualInviteeIds: initial.manualInviteeIds,
    coverImage: initial.coverImage,
    templateCoverImage: initial.templateCoverImage,
    avatarImage: initial.avatarImage,
    activityId: initial.activityId,
    autoForgeRequestId: initial.autoForgeRequestId,
    autoForgeRequestRevision: initial.autoForgeRequestRevision,
    autoForgeRequestLifecycle: initial.autoForgeRequestLifecycle,
    groupId: initial.groupId,
    chatId: initial.chatId,
    planId: initial.planId,
    inviteCopied: initial.inviteCopied,
    invitesSent: initial.invitesSent,
  };
}

export function forgeWizardReducer(
  state: ForgeWizardData,
  action: ForgeWizardAction,
): ForgeWizardData {
  switch (action.type) {
    case "reset":
      return createInitialForgeWizardState();
    case "select-activity":
      return clearAppliedTemplateFields(state, action.activity);
    case "apply-activity-template": {
      const { template, templateId } = action;

      return {
        ...state,
        selectedActivity: template.selectedActivity,
        planCategory: null,
        appliedTemplateId: templateId,
        planName: template.planName,
        planDescription: template.planDescription,
        planScheduleMode:
          template.forgeMode === "AUTO" ? "TO_BE_DECIDED" : "FIXED",
        planDate: "",
        planTime: "",
        planLocation: template.planLocation,
        planLocationLat: template.planLocationLat,
        planLocationLng: template.planLocationLng,
        locationType: template.locationType,
        forgeScope: template.locationType === "ONLINE" ? "ONLINE" : "LOCAL",
        planCost: template.planCost,
        planCostAmount: template.planCostAmount,
        planCostDetails: template.planCostDetails,
        forgeMode: template.forgeMode,
        fixedSize:
          template.fixedSize === null
            ? state.fixedSize
            : normalizeFixedGroupSize(template.fixedSize),
        visibility: template.visibility,
        groupName: template.groupName,
        groupDescription: template.groupDescription,
        coverImage: template.coverImage,
        templateCoverImage: template.coverImage,
        avatarImage: template.avatarImage,
        forgeResult: "IDLE",
        participants: [],
        removedIds: new Set(),
        manualInviteeIds: [],
        activityId: null,
        autoForgeRequestId: null,
        autoForgeRequestRevision: null,
        autoForgeRequestLifecycle: null,
        groupId: null,
        chatId: null,
        planId: null,
        inviteCopied: false,
        invitesSent: false,
      };
    }
    case "clear-activity-template":
      return clearAppliedTemplateFields(state);
    case "set-step":
      return {
        ...state,
        navDirection: action.navDirection,
        step: normalizeStep(action.step),
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
        step: normalizeStep(action.step, 5),
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
        step: 4,
        forgeResult: "IDLE",
        participants: [],
        manualInviteeIds: [],
        activityId: null,
        autoForgeRequestId: null,
        autoForgeRequestRevision: null,
        autoForgeRequestLifecycle: null,
        groupId: null,
        chatId: null,
        planId: null,
        removedIds: new Set(),
      };
    default:
      return state;
  }
}
