import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  dateTimeLocalToIsoString,
  toDateTimeLocalValue,
} from "@/shared/lib/date-time-local";
import {
  cleanPlanProposalText,
  formatPlanLocationValue as formatSharedPlanLocationValue,
  isPlanLocationMode,
  PLAN_LOCATION_MODE_LABELS,
  type PlanLocationValue,
  serializePlanLocationValue as serializeSharedPlanLocationValue,
} from "@/shared/lib/plan-proposal-values";
import type {
  CostType,
  LocationMode,
  PlanCategory,
  PlanProposalField,
} from "@/shared/schemas/enums";

export const planProposalFieldOptions = [
  { value: "TITLE", label: "Title" },
  { value: "DESCRIPTION", label: "Description" },
  { value: "DATE_TIME", label: "Date and time" },
  { value: "LOCATION", label: "Location" },
  { value: "COST", label: "Cost" },
  { value: "CATEGORY", label: "Category" },
] as const satisfies Array<{ value: PlanProposalField; label: string }>;

export const locationModeLabels: Record<LocationMode, string> =
  PLAN_LOCATION_MODE_LABELS;

export const planCategoryLabels: Record<PlanCategory, string> = {
  ARTS: "Arts",
  FOOD: "Food",
  GAMING: "Gaming",
  LEARNING: "Learning",
  MUSIC: "Music",
  OTHER: "Other",
  OUTDOORS: "Outdoors",
  SOCIAL: "Social",
  SPORTS: "Sports",
  TECH: "Tech",
  TRAVEL: "Travel",
  WELLNESS: "Wellness",
};

export const costTypeLabels: Record<CostType, string> = {
  FREE: "Free",
  PAID: "Paid",
};

type Plan = NonNullable<GroupPlanDetail["plan"]>;

export type { PlanLocationValue } from "@/shared/lib/plan-proposal-values";

export interface PlanCostValue {
  cost: CostType;
  costAmount: number | null;
  costDetails: string | null;
}

export function isLocationMode(value: string): value is LocationMode {
  return isPlanLocationMode(value);
}

export function isCostType(value: string): value is CostType {
  return Object.keys(costTypeLabels).some((cost) => cost === value);
}

function cleanText(value: string | null | undefined) {
  return cleanPlanProposalText(value);
}

const PLAN_LOCATION_OPTIONS = {
  keyOrder: "location-first",
  missingLocationMessage: "Add a location before sending a change.",
} as const;

export function isPlanProposalField(value: string): value is PlanProposalField {
  return planProposalFieldOptions.some((option) => option.value === value);
}

export function getPlanLocationValue(plan: Plan): PlanLocationValue {
  return {
    location: plan.location,
    locationLat: plan.locationLat,
    locationLng: plan.locationLng,
    locationMode: plan.locationMode,
  };
}

export function serializePlanLocationValue(value: PlanLocationValue) {
  return serializeSharedPlanLocationValue(value, PLAN_LOCATION_OPTIONS);
}

export function formatPlanLocationValue(value: PlanLocationValue) {
  return formatSharedPlanLocationValue(value);
}

export function getPlanCostValue(plan: Plan): PlanCostValue {
  return {
    cost: plan.cost,
    costAmount: plan.costAmount,
    costDetails: plan.costDetails,
  };
}

export function serializePlanCostValue(value: PlanCostValue) {
  return JSON.stringify({
    cost: value.cost,
    costAmount: value.cost === "PAID" ? value.costAmount : null,
    costDetails: cleanText(value.costDetails),
  });
}

export function formatPlanCostValue(value: PlanCostValue) {
  if (value.cost === "FREE") {
    return value.costDetails ? `Free: ${value.costDetails}` : "Free";
  }

  const amount =
    typeof value.costAmount === "number" ? ` around ${value.costAmount}` : "";
  const details = value.costDetails ? `, ${value.costDetails}` : "";

  return `Paid${amount}${details}`;
}

type ProposalValueGetter = (plan: Plan) => string;

const CURRENT_PROPOSAL_VALUE_GETTERS = {
  CATEGORY: (plan) => plan.category,
  COST: (plan) => formatPlanCostValue(getPlanCostValue(plan)),
  DATE_TIME: (plan) => toDateTimeLocalValue(plan.dateTime),
  DESCRIPTION: (plan) => plan.description ?? "",
  LOCATION: (plan) => formatPlanLocationValue(getPlanLocationValue(plan)),
  TITLE: (plan) => plan.title,
} satisfies Partial<Record<PlanProposalField, ProposalValueGetter>>;

const CURRENT_SERIALIZED_PROPOSAL_VALUE_GETTERS = {
  CATEGORY: (plan) => plan.category,
  COST: (plan) => serializePlanCostValue(getPlanCostValue(plan)),
  DATE_TIME: (plan) => plan.dateTime ?? "",
  DESCRIPTION: (plan) => plan.description ?? "",
  LOCATION: (plan) => serializePlanLocationValue(getPlanLocationValue(plan)),
  TITLE: (plan) => plan.title,
} satisfies Partial<Record<PlanProposalField, ProposalValueGetter>>;

export function getCurrentProposalValue(plan: Plan, field: PlanProposalField) {
  return CURRENT_PROPOSAL_VALUE_GETTERS[field]?.(plan) ?? "";
}

export function getCurrentSerializedProposalValue(
  plan: Plan,
  field: PlanProposalField,
) {
  return CURRENT_SERIALIZED_PROPOSAL_VALUE_GETTERS[field]?.(plan) ?? "";
}

export function normalizeProposalValue(
  field: PlanProposalField,
  value: string,
) {
  if (field === "DATE_TIME") {
    return dateTimeLocalToIsoString(value);
  }

  return value.trim();
}
