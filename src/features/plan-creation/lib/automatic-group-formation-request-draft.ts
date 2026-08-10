import {
  createInitialPlanBuilderState,
  type PlanBuilderData,
} from "@/features/plan-creation/lib/plan-builder";
import type { AutomaticGroupFormationRequest } from "@/features/plan-creation/schemas/automatic-group-formation-request.schema";
import { usePlanBuilderDraftStore } from "@/features/plan-creation/store/use-plan-builder-draft-store";

export function saveAutomaticGroupFormationRequestAsWizardDraft(
  request: AutomaticGroupFormationRequest,
) {
  usePlanBuilderDraftStore
    .getState()
    .saveDraft(buildAutomaticGroupFormationRequestWizardDraft(request));
}

export function clearAutomaticGroupFormationRequestWizardDraft(
  requestId: string,
) {
  const draftStore = usePlanBuilderDraftStore.getState();

  if (draftStore.draft?.automaticGroupFormationRequestId === requestId) {
    draftStore.clearDraft();
  }
}

export function buildAutomaticGroupFormationRequestWizardDraft(
  request: AutomaticGroupFormationRequest,
): PlanBuilderData {
  const initial = createInitialPlanBuilderState();
  const schedule = getLocalSchedule(request.plan.dateTime);
  const isSearching = request.lifecycle === "SEARCHING";

  return {
    ...initial,
    step: isSearching ? 5 : 3,
    selectedActivity: request.activity.title,
    planCategory: request.plan.category,
    planName: request.plan.title,
    planDescription: request.plan.description ?? "",
    planScheduleMode: request.plan.scheduleMode,
    planDate: schedule.date,
    planTime: schedule.time,
    planLocation: request.plan.location ?? "",
    planLocationLat: request.plan.locationLat,
    planLocationLng: request.plan.locationLng,
    groupFormationScope: request.scope,
    locationType: request.plan.locationMode,
    planCost: request.plan.cost,
    planCostAmount: request.plan.costAmount?.toString() ?? "",
    planCostDetails: request.plan.costDetails ?? "",
    groupSizeMode: "RANGE",
    autoMinSize: request.minimumGroupSize,
    autoMaxSize: request.maximumGroupSize,
    maxDistanceKm: request.maxDistanceKm ?? initial.maxDistanceKm,
    coverImage: request.plan.coverImage,
    activityId: request.activity.id,
    automaticGroupFormationRequestId: request.id,
    automaticGroupFormationRequestRevision: request.revision,
    automaticGroupFormationRequestLifecycle: request.lifecycle,
    groupFormationResult: isSearching ? "SEARCHING" : "IDLE",
  };
}

function getLocalSchedule(value: string | null) {
  if (!value) return { date: "", time: "" };

  const date = new Date(value);
  const localDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
  const localTime = [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
  ].join(":");

  return { date: localDate, time: localTime };
}
