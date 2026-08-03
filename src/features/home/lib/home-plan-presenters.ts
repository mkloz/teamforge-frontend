import type { PlannedGroup } from "@/features/home/lib/home-contract";
import {
  type PlanReadinessSummary,
  presentPlanReadinessSummary,
} from "@/shared/lib/lifecycle-presenters";

const PLAN_CATEGORY_LABELS: Record<PlannedGroup["plan"]["category"], string> = {
  TECH: "Tech",
  SPORTS: "Sports",
  ARTS: "Arts",
  SOCIAL: "Social",
  OUTDOORS: "Outdoors",
  LEARNING: "Learning",
  MUSIC: "Music",
  FOOD: "Food",
  GAMING: "Gaming",
  WELLNESS: "Wellness",
  TRAVEL: "Travel",
  OTHER: "Other",
};

function cleanPlanText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : null;
}

export function getHomePlanLocationLabel(plan: PlannedGroup["plan"]) {
  const location = cleanPlanText(plan.location);

  if (plan.locationMode === "ONLINE") {
    return location ? `Online: ${location}` : "Online";
  }

  if (plan.locationMode === "TBD") {
    return "Location TBD";
  }

  return location ?? "Location TBD";
}

export function getHomePlanCategoryLabel(plan: PlannedGroup["plan"]) {
  return PLAN_CATEGORY_LABELS[plan.category];
}

export function getHomePlanCostLabel(plan: PlannedGroup["plan"]) {
  return plan.cost === "FREE" ? "Free" : "Paid";
}

export function getHomePlanReadiness(
  plan: PlannedGroup["plan"],
): PlanReadinessSummary | null {
  if (!plan.operationalState) return null;
  return presentPlanReadinessSummary({
    overall: plan.operationalState.overall,
    requiredAction: plan.operationalState.requiredAction,
  });
}
