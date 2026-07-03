import type { Plan } from "@/features/activity/lib/activity-contract";
import { formatPlanLocation } from "@/features/activity/lib/plan-location";
import { formatDate, formatPanelToken, formatTime } from "../lib/constants";
import { stripPanelStatusPrefix } from "../status-prefix";

interface PlanSectionViewState {
  displayTitle: string;
  formattedCost: string;
  formattedDate: string;
  formattedLocation: string;
  formattedTime: string;
  locationHref: string | null;
  sectionLabel: string;
  shouldShowStatusPill: boolean;
}

const READ_ONLY_PLAN_SECTION_LABEL_BY_STATUS: Partial<
  Record<Plan["status"], string>
> = {
  CANCELLED: "Cancelled plan",
  COMPLETED: "Final plan",
};

export function getPlanSectionViewState(
  plan: Plan,
  isReadOnly: boolean,
): PlanSectionViewState {
  return {
    displayTitle: getPlanDisplayTitle(plan),
    formattedCost: formatPlanCost(plan),
    formattedDate: plan.dateTime ? formatDate(plan.dateTime) : "Date TBD",
    formattedLocation: formatPlanLocation(plan),
    formattedTime: plan.dateTime ? formatTime(plan.dateTime) : "Time TBD",
    locationHref: getPlanLocationHref(plan),
    sectionLabel: getPlanSectionLabel(plan.status, isReadOnly),
    shouldShowStatusPill: shouldShowPlanStatusPill(plan.status, isReadOnly),
  };
}

function getPlanDisplayTitle(plan: Plan) {
  return stripPanelStatusPrefix(plan.title, formatPanelToken(plan.status));
}

function getPlanLocationHref(plan: Plan) {
  if (
    plan.locationMode === "IN_PERSON" &&
    plan.locationLat !== null &&
    plan.locationLng !== null
  ) {
    return `https://maps.google.com/?q=${plan.locationLat},${plan.locationLng}`;
  }

  return null;
}

function shouldShowPlanStatusPill(status: Plan["status"], isReadOnly: boolean) {
  return !(isReadOnly && status === "COMPLETED");
}

function getPlanSectionLabel(planStatus: Plan["status"], isReadOnly: boolean) {
  if (!isReadOnly) {
    return "Current plan";
  }

  return READ_ONLY_PLAN_SECTION_LABEL_BY_STATUS[planStatus] ?? "Plan";
}

function formatPlanCost(plan: Plan) {
  if (plan.cost === "FREE") {
    return formatFreePlanCost(plan.costDetails);
  }

  return formatPaidPlanCost(plan);
}

function formatFreePlanCost(costDetails: Plan["costDetails"]) {
  return costDetails ? `Free · ${costDetails}` : "Free";
}

function formatPaidPlanCost({ costAmount, costDetails }: Plan) {
  return typeof costAmount === "number"
    ? `About £${costAmount.toFixed(0)}`
    : (costDetails ?? "Paid");
}
