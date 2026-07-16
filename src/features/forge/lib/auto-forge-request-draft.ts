import { normalizeFixedGroupSize } from "@/features/forge/lib/forge-size";
import {
  createInitialForgeWizardState,
  type ForgeWizardData,
} from "@/features/forge/lib/forge-wizard";
import type { AutoForgeRequest } from "@/features/forge/schemas/auto-forge-request.schema";
import { useForgeWizardDraftStore } from "@/features/forge/store/use-forge-wizard-draft-store";

export function saveAutoForgeRequestAsWizardDraft(request: AutoForgeRequest) {
  useForgeWizardDraftStore
    .getState()
    .saveDraft(buildAutoForgeRequestWizardDraft(request));
}

export function clearAutoForgeRequestWizardDraft(requestId: string) {
  const draftStore = useForgeWizardDraftStore.getState();

  if (draftStore.draft?.autoForgeRequestId === requestId) {
    draftStore.clearDraft();
  }
}

export function buildAutoForgeRequestWizardDraft(
  request: AutoForgeRequest,
): ForgeWizardData {
  const initial = createInitialForgeWizardState();
  const schedule = getLocalSchedule(request.plan.dateTime);

  return {
    ...initial,
    step: 3,
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
    forgeScope: request.scope,
    locationType: request.plan.locationMode,
    planCost: request.plan.cost,
    planCostAmount: request.plan.costAmount?.toString() ?? "",
    planCostDetails: request.plan.costDetails ?? "",
    fixedSize: normalizeFixedGroupSize(request.groupSize),
    groupSizeMode: "FIXED",
    autoMinSize: request.groupSize,
    autoMaxSize: request.groupSize,
    maxDistanceKm: request.maxDistanceKm ?? initial.maxDistanceKm,
    coverImage: request.plan.coverImage,
    activityId: request.activity.id,
    autoForgeRequestId: request.id,
    autoForgeRequestRevision: request.revision,
    autoForgeRequestLifecycle: request.lifecycle,
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
