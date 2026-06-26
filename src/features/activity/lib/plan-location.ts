import {
  cleanPlanProposalText,
  formatPlanLocationValue,
  PLAN_LOCATION_MODE_LABELS,
  type PlanLocationValue,
  parsePlanLocationValue as parseSharedPlanLocationValue,
  serializePlanLocationValue as serializeSharedPlanLocationValue,
} from "@/shared/lib/plan-proposal-values";
import type { LocationMode } from "@/shared/schemas/enums";

export type { PlanLocationValue } from "@/shared/lib/plan-proposal-values";

export const LOCATION_MODE_LABELS: Record<LocationMode, string> =
  PLAN_LOCATION_MODE_LABELS;

const PLAN_LOCATION_OPTIONS = {
  coordinatePairMessage: "Coordinates must be provided together.",
  keyOrder: "mode-first",
  missingLocationMessage: "Add a location before sending a proposal.",
  requireCoordinatePair: true,
} as const;

export function serializePlanLocationValue(value: PlanLocationValue) {
  return serializeSharedPlanLocationValue(value, PLAN_LOCATION_OPTIONS);
}

function parsePlanLocationValue(value: string | null) {
  return parseSharedPlanLocationValue(value, PLAN_LOCATION_OPTIONS);
}

export function formatPlanLocation(value: PlanLocationValue) {
  return formatPlanLocationValue(value);
}

export function formatPlanLocationProposalValue(value: string | null) {
  const parsed = parsePlanLocationValue(value);

  if (parsed) {
    return formatPlanLocation(parsed);
  }

  return cleanPlanProposalText(value) ?? "Not set";
}
