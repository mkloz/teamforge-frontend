import type { Plan } from "@/features/activity/lib/activity-contract";
import {
  formatPlanLocation,
  serializePlanLocationValue,
  type PlanLocationValue,
} from "@/features/activity/lib/plan-location";
import type { LocationMode } from "@/shared/schemas/enums";

export const PLAN_PROPOSAL_FIELD_OPTIONS = [
  { value: "TITLE", label: "Title" },
  { value: "DESCRIPTION", label: "Description" },
  { value: "DATE_TIME", label: "Date & Time" },
  { value: "LOCATION", label: "Location" },
] as const;

export type ProposalField =
  (typeof PLAN_PROPOSAL_FIELD_OPTIONS)[number]["value"];

export function isProposalField(value: string): value is ProposalField {
  return PLAN_PROPOSAL_FIELD_OPTIONS.some((option) => option.value === value);
}

export function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getCurrentProposalValue(plan: Plan, field: ProposalField) {
  switch (field) {
    case "TITLE":
      return plan.title;
    case "DESCRIPTION":
      return plan.description ?? "";
    case "DATE_TIME":
      return toDateTimeLocalValue(plan.dateTime);
    case "LOCATION":
      return formatPlanLocation(plan);
  }
}

export function normalizeProposedValue(field: ProposalField, value: string) {
  if (field === "DATE_TIME") {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  return value.trim();
}

export function getCurrentLocationProposalValue(plan: Plan): PlanLocationValue {
  return {
    locationMode: plan.locationMode,
    location: plan.location,
    locationLat: plan.locationLat,
    locationLng: plan.locationLng,
  };
}

export function getLocationProposalInput(plan: Plan) {
  const current = getCurrentLocationProposalValue(plan);

  return {
    locationMode: current.locationMode,
    location: current.location ?? "",
  };
}

export function buildLocationProposalValue(input: {
  location: string;
  locationMode: LocationMode;
}) {
  return serializePlanLocationValue({
    locationMode: input.locationMode,
    location: input.location,
    locationLat: null,
    locationLng: null,
  });
}

export function getCurrentSerializedLocationProposalValue(plan: Plan) {
  return serializePlanLocationValue(getCurrentLocationProposalValue(plan));
}
