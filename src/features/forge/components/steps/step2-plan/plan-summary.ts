import type { ForgeScope, LocationType, PlanScheduleMode } from "./types";

export function getGroupSummary(forgeMode: "AUTO" | "MANUAL") {
  return forgeMode === "AUTO"
    ? "TeamForge finds people"
    : "Invite people I know";
}

export function getPlaceSummary({
  forgeScope,
  locationType,
  planLocation,
}: {
  forgeScope: ForgeScope;
  locationType: LocationType;
  planLocation: string;
}) {
  const location = planLocation.trim();

  if (locationType === "IN_PERSON") {
    return location || "Choose a meeting place";
  }

  if (locationType === "ONLINE") {
    return location || "Add an online meeting point";
  }

  return forgeScope === "ONLINE"
    ? "Online · decide together"
    : "Decide together";
}

export function isPlaceComplete(
  locationType: LocationType,
  planLocation: string,
) {
  return locationType === "TBD" || planLocation.trim().length >= 2;
}

export function getTimeSummary({
  planDate,
  planScheduleMode,
  planTime,
}: {
  planDate: string;
  planScheduleMode: PlanScheduleMode;
  planTime: string;
}) {
  if (planScheduleMode === "TO_BE_DECIDED") {
    return "Decide together";
  }

  const date = formatPlanDate(planDate);
  const time = formatPlanTime(planTime);

  if (date && time) {
    return `${date} · ${time}`;
  }

  return date || time || "Choose a date and time";
}

export function isTimeComplete({
  planDate,
  planScheduleMode,
  planTime,
}: {
  planDate: string;
  planScheduleMode: PlanScheduleMode;
  planTime: string;
}) {
  return (
    planScheduleMode === "TO_BE_DECIDED" ||
    (planDate.length > 0 && planTime.length > 0)
  );
}

function formatPlanDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "";
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    weekday: "short",
  }).format(date);
}

function formatPlanTime(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return "";
  }

  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);

  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
