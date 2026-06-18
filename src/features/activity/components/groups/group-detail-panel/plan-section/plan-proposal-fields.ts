import type { Plan } from "@/features/activity/lib/activity-contract";
import {
  formatPlanLocation,
  type PlanLocationValue,
  serializePlanLocationValue,
} from "@/features/activity/lib/plan-location";
import {
  dateTimeLocalToIsoString,
  toDateTimeLocalValue as toSharedDateTimeLocalValue,
} from "@/shared/lib/date-time-local";
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
  return toSharedDateTimeLocalValue(value);
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

  return "";
}

export function normalizeProposedValue(field: ProposalField, value: string) {
  if (field === "DATE_TIME") {
    return dateTimeLocalToIsoString(value);
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
    locationLat: current.locationLat,
    locationLng: current.locationLng,
  };
}

export function buildLocationProposalValue(input: {
  location: string;
  locationLat: number | null;
  locationLng: number | null;
  locationMode: LocationMode;
}) {
  return serializePlanLocationValue({
    locationMode: input.locationMode,
    location: input.location,
    locationLat: input.locationLat,
    locationLng: input.locationLng,
  });
}

export function getCurrentSerializedLocationProposalValue(plan: Plan) {
  return serializePlanLocationValue(getCurrentLocationProposalValue(plan));
}
