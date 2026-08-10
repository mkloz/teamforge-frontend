import {
  normalizeFixedGroupSize,
  normalizeGroupSizeRange,
} from "@/features/plan-creation/lib/plan-creation-size";
import { createInitialPlanBuilderState } from "./initial-state";
import { getNextStep, getPreviousStep, normalizeStep } from "./navigation";
import type { PlanBuilderAction, PlanBuilderData } from "./types";

function clearAppliedTemplateFields(
  state: PlanBuilderData,
  selectedActivity = state.selectedActivity,
): PlanBuilderData {
  const initial = createInitialPlanBuilderState();

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
    groupFormationScope: initial.groupFormationScope,
    locationType: initial.locationType,
    planCost: initial.planCost,
    planCostAmount: initial.planCostAmount,
    planCostDetails: initial.planCostDetails,
    groupFormationMode: initial.groupFormationMode,
    fixedSize: initial.fixedSize,
    groupSizeMode: initial.groupSizeMode,
    autoMinSize: initial.autoMinSize,
    autoMaxSize: initial.autoMaxSize,
    compatibilityWeight: initial.compatibilityWeight,
    diversityWeight: initial.diversityWeight,
    networkReachWeight: initial.networkReachWeight,
    maxDistanceKm: initial.maxDistanceKm,
    visibility: initial.visibility,
    groupFormationResult: initial.groupFormationResult,
    participants: initial.participants,
    removedIds: new Set(),
    groupName: initial.groupName,
    groupDescription: initial.groupDescription,
    manualInviteeIds: initial.manualInviteeIds,
    coverImage: initial.coverImage,
    templateCoverImage: initial.templateCoverImage,
    avatarImage: initial.avatarImage,
    activityId: initial.activityId,
    automaticGroupFormationRequestId: initial.automaticGroupFormationRequestId,
    automaticGroupFormationRequestRevision:
      initial.automaticGroupFormationRequestRevision,
    automaticGroupFormationRequestLifecycle:
      initial.automaticGroupFormationRequestLifecycle,
    groupId: initial.groupId,
    chatId: initial.chatId,
    planId: initial.planId,
    inviteCopied: initial.inviteCopied,
    invitesSent: initial.invitesSent,
  };
}

export function planBuilderReducer(
  state: PlanBuilderData,
  action: PlanBuilderAction,
): PlanBuilderData {
  switch (action.type) {
    case "reset":
      return createInitialPlanBuilderState();
    case "select-activity":
      return clearAppliedTemplateFields(state, action.activity);
    case "apply-activity-template": {
      const { template, templateId } = action;
      const recommendedRange = normalizeGroupSizeRange(
        template.recommendedMinimumGroupSize ?? state.autoMinSize,
        template.recommendedMaximumGroupSize ?? state.autoMaxSize,
      );

      return {
        ...state,
        selectedActivity: template.selectedActivity,
        planCategory: null,
        appliedTemplateId: templateId,
        planName: template.planName,
        planDescription: template.planDescription,
        planScheduleMode:
          template.groupFormationMode === "AUTO" ? "TO_BE_DECIDED" : "FIXED",
        planDate: "",
        planTime: "",
        planLocation: template.planLocation,
        planLocationLat: template.planLocationLat,
        planLocationLng: template.planLocationLng,
        locationType: template.locationType,
        groupFormationScope:
          template.locationType === "ONLINE" ? "ONLINE" : "LOCAL",
        planCost: template.planCost,
        planCostAmount: template.planCostAmount,
        planCostDetails: template.planCostDetails,
        groupFormationMode: template.groupFormationMode,
        fixedSize:
          template.fixedSize === null
            ? state.fixedSize
            : normalizeFixedGroupSize(template.fixedSize),
        autoMinSize:
          template.groupFormationMode === "AUTO"
            ? recommendedRange.min
            : state.autoMinSize,
        autoMaxSize:
          template.groupFormationMode === "AUTO"
            ? recommendedRange.max
            : state.autoMaxSize,
        visibility: template.visibility,
        groupName: template.groupName,
        groupDescription: template.groupDescription,
        coverImage: template.coverImage,
        templateCoverImage: template.coverImage,
        avatarImage: template.avatarImage,
        groupFormationResult: "IDLE",
        participants: [],
        removedIds: new Set(),
        manualInviteeIds: [],
        activityId: null,
        automaticGroupFormationRequestId: null,
        automaticGroupFormationRequestRevision: null,
        automaticGroupFormationRequestLifecycle: null,
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
    case "apply-plan-creation-result":
      return {
        ...state,
        navDirection: "forward",
        step: normalizeStep(action.step, 5),
        groupFormationResult: action.result,
        participants: action.participants,
        activityId: action.activityId,
        automaticGroupFormationRequestId:
          action.automaticGroupFormationRequest?.id ?? null,
        automaticGroupFormationRequestRevision:
          action.automaticGroupFormationRequest?.revision ?? null,
        automaticGroupFormationRequestLifecycle:
          action.automaticGroupFormationRequest?.lifecycle ?? null,
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
    case "revisePlan":
      return {
        ...state,
        navDirection: "back",
        step: 4,
        groupFormationResult: "IDLE",
        participants: [],
        manualInviteeIds: [],
        activityId: null,
        automaticGroupFormationRequestId: null,
        automaticGroupFormationRequestRevision: null,
        automaticGroupFormationRequestLifecycle: null,
        groupId: null,
        chatId: null,
        planId: null,
        removedIds: new Set(),
      };
    default:
      return state;
  }
}
