import type { ForgeWizardState } from "@/features/forge/hooks/use-forge-wizard";

export type PlanSectionTarget =
  | "plan-basics"
  | "plan-place"
  | "plan-time"
  | "previous-step";

export interface MissingPlanDetail {
  id: string;
  label: string;
  supportingText: string;
  target: PlanSectionTarget;
}

export interface MobilePlanReviewState {
  missingDetails: MissingPlanDetail[];
  readyCount: number;
  readySections: boolean[];
}

export function getMobilePlanReviewState(
  fw: ForgeWizardState,
): MobilePlanReviewState {
  const missingDetails = getMissingPlanDetails(fw);
  const basicsReady =
    Boolean(fw.selectedActivity) && fw.planName.trim().length >= 3;
  const placeReady = isPlaceReady(fw);
  const timeReady = isTimeReady(fw);

  const readySections = [basicsReady, true, placeReady, timeReady];

  return {
    missingDetails,
    readyCount: readySections.filter(Boolean).length,
    readySections,
  };
}

function getMissingPlanDetails(fw: ForgeWizardState) {
  const details: MissingPlanDetail[] = [];

  if (!fw.selectedActivity) {
    details.push({
      id: "activity",
      label: "Choose an activity",
      supportingText: "Return to the starting point and choose what to do.",
      target: "previous-step",
    });
  }

  const planName = fw.planName.trim();
  if (planName.length < 3) {
    details.push({
      id: "plan-name",
      label: planName.length === 0 ? "Add a plan name" : "Finish the plan name",
      supportingText:
        planName.length === 0
          ? "Give people a clear name for the plan."
          : "Use at least 3 characters.",
      target: "plan-basics",
    });
  }

  const locationDetail = getLocationDetail(fw);
  if (locationDetail) {
    details.push(locationDetail);
  }

  const scheduleDetail = getScheduleDetail(fw);
  if (scheduleDetail) {
    details.push(scheduleDetail);
  }

  if (!fw.canAdvanceStep2 && details.length === 0) {
    details.push({
      id: "plan-validation",
      label: fw.forgeValidationMessage ?? "Review the plan details",
      supportingText: "Open the relevant section and check the information.",
      target: "plan-basics",
    });
  }

  return details;
}

function getLocationDetail(fw: ForgeWizardState): MissingPlanDetail | null {
  const location = fw.planLocation.trim();

  if (
    (fw.locationType === "IN_PERSON" || fw.locationType === "ONLINE") &&
    location.length < 2
  ) {
    return {
      id: "plan-location",
      label:
        fw.locationType === "ONLINE"
          ? "Add an online meeting point"
          : "Add a meeting place",
      supportingText:
        fw.locationType === "ONLINE"
          ? "Add the platform or meeting link."
          : "Add where the group should meet.",
      target: "plan-place",
    };
  }

  if (fw.locationType === "TBD" && location.length > 0) {
    return {
      id: "plan-location-mode",
      label: "Confirm how the group will meet",
      supportingText: "Choose in person, online, or clear the saved location.",
      target: "plan-place",
    };
  }

  return null;
}

function getScheduleDetail(fw: ForgeWizardState): MissingPlanDetail | null {
  if (fw.planScheduleMode === "TO_BE_DECIDED") {
    return fw.planDate || fw.planTime
      ? {
          id: "plan-schedule-mode",
          label: "Confirm when the plan will happen",
          supportingText: "Choose a fixed time or clear the saved schedule.",
          target: "plan-time",
        }
      : null;
  }

  if (!fw.planDate && !fw.planTime) {
    return {
      id: "plan-date-time",
      label: "Choose a date and time",
      supportingText: "Set when the plan should happen.",
      target: "plan-time",
    };
  }

  if (!fw.planDate) {
    return {
      id: "plan-date",
      label: "Choose a date",
      supportingText: "Add the day for this plan.",
      target: "plan-time",
    };
  }

  if (!fw.planTime) {
    return {
      id: "plan-time",
      label: "Choose a time",
      supportingText: "Add the start time for this plan.",
      target: "plan-time",
    };
  }

  if (!isFutureDateTime(fw.planDate, fw.planTime)) {
    return {
      id: "plan-future-time",
      label: "Choose a future date and time",
      supportingText: "The current schedule has already passed.",
      target: "plan-time",
    };
  }

  return null;
}

function isPlaceReady(fw: ForgeWizardState) {
  if (fw.locationType === "TBD") {
    return fw.planLocation.trim().length === 0;
  }

  return fw.planLocation.trim().length >= 2;
}

function isTimeReady(fw: ForgeWizardState) {
  if (fw.planScheduleMode === "TO_BE_DECIDED") {
    return !fw.planDate && !fw.planTime;
  }

  return (
    Boolean(fw.planDate) &&
    Boolean(fw.planTime) &&
    isFutureDateTime(fw.planDate, fw.planTime)
  );
}

function isFutureDateTime(date: string, time: string) {
  const value = new Date(`${date}T${time}`).getTime();
  return Number.isFinite(value) && value > Date.now();
}
