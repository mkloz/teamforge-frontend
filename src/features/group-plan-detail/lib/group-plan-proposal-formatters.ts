import { z } from "zod";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  dateTimeLocalToIsoString,
  toDateTimeLocalValue,
} from "@/shared/lib/date-time-local";
import {
  cleanPlanProposalText,
  formatPlanLocationValue as formatSharedPlanLocationValue,
  isPlanLocationMode,
  normalizePlanLocationValue as normalizeSharedPlanLocationValue,
  PLAN_LOCATION_MODE_LABELS,
  type PlanLocationValue,
  parsePlanLocationValue as parseSharedPlanLocationValue,
  serializePlanLocationValue as serializeSharedPlanLocationValue,
} from "@/shared/lib/plan-proposal-values";
import type {
  CostType,
  LocationMode,
  PlanCategory,
  PlanProposalField,
} from "@/shared/schemas/enums";
import type { PlanProposal } from "@/shared/schemas/plan";

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

const planCostPayloadSchema = z.object({
  cost: z.enum(["FREE", "PAID"]),
  costAmount: z.number().nullable().optional(),
  costDetails: z.string().nullable().optional(),
});

function isPlanCategory(value: string): value is PlanCategory {
  return Object.keys(planCategoryLabels).some((category) => category === value);
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

export function getPlanProposalFieldLabel(field: PlanProposalField) {
  return (
    planProposalFieldOptions.find((option) => option.value === field)?.label ??
    field
  );
}

export function getPlanLocationValue(plan: Plan): PlanLocationValue {
  return {
    location: plan.location,
    locationLat: plan.locationLat,
    locationLng: plan.locationLng,
    locationMode: plan.locationMode,
  };
}

export function normalizePlanLocationValue(
  value: Partial<PlanLocationValue> & { locationMode: LocationMode },
): PlanLocationValue {
  return normalizeSharedPlanLocationValue(value, PLAN_LOCATION_OPTIONS);
}

export function serializePlanLocationValue(value: PlanLocationValue) {
  return serializeSharedPlanLocationValue(value, PLAN_LOCATION_OPTIONS);
}

export function parsePlanLocationValue(value: string | null) {
  return parseSharedPlanLocationValue(value, PLAN_LOCATION_OPTIONS);
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

export function parsePlanCostValue(value: string | null) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed.startsWith("{")) {
    return null;
  }

  try {
    const parsed = planCostPayloadSchema.safeParse(JSON.parse(trimmed));

    if (!parsed.success) {
      return null;
    }

    return {
      cost: parsed.data.cost,
      costAmount:
        parsed.data.cost === "PAID" ? (parsed.data.costAmount ?? null) : null,
      costDetails: cleanText(parsed.data.costDetails),
    } satisfies PlanCostValue;
  } catch {
    return null;
  }
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

export function getCurrentProposalValue(plan: Plan, field: PlanProposalField) {
  switch (field) {
    case "TITLE":
      return plan.title;
    case "DESCRIPTION":
      return plan.description ?? "";
    case "DATE_TIME":
      return toDateTimeLocalValue(plan.dateTime);
    case "LOCATION":
      return formatPlanLocationValue(getPlanLocationValue(plan));
    case "COST":
      return formatPlanCostValue(getPlanCostValue(plan));
    case "CATEGORY":
      return plan.category;
    default:
      return "";
  }
}

export function getCurrentSerializedProposalValue(
  plan: Plan,
  field: PlanProposalField,
) {
  switch (field) {
    case "DATE_TIME":
      return plan.dateTime ?? "";
    case "LOCATION":
      return serializePlanLocationValue(getPlanLocationValue(plan));
    case "COST":
      return serializePlanCostValue(getPlanCostValue(plan));
    case "DESCRIPTION":
      return plan.description ?? "";
    case "CATEGORY":
      return plan.category;
    case "TITLE":
      return plan.title;
    default:
      return "";
  }
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

export function formatProposalDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  });
}

export function formatProposalValue(
  field: PlanProposal["field"],
  value: string | null,
) {
  if (!value) {
    return "Not set";
  }

  if (field === "LOCATION") {
    const parsed = parsePlanLocationValue(value);

    return parsed ? formatPlanLocationValue(parsed) : value;
  }

  if (field === "COST") {
    const parsed = parsePlanCostValue(value);

    return parsed ? formatPlanCostValue(parsed) : value;
  }

  if (field === "CATEGORY") {
    return isPlanCategory(value) ? planCategoryLabels[value] : value;
  }

  const date = new Date(value);

  if (!Number.isNaN(date.getTime()) && value.includes("T")) {
    return date.toLocaleString("en-GB", {
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      month: "short",
      weekday: "short",
    });
  }

  return value;
}
