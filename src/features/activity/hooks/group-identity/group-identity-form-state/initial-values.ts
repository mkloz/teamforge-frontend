import { DEFAULT_PLAN_VALUES } from "@/features/activity/hooks/group-identity/group-identity-form-state/defaults";
import type {
  ExistingGroupPlan,
  GroupIdentityDetailsInitialValues,
  GroupIdentityFormValues,
  GroupPlan,
  GroupPlanCostInitialValues,
  GroupPlanInitialValues,
  GroupPlanLocationInitialValues,
  GroupPlanScheduleInitialValues,
} from "@/features/activity/hooks/group-identity/group-identity-form-state/types";
import type { Group } from "@/features/activity/lib/activity-contract";
import { toDateTimeLocalValue } from "@/shared/lib/date-time-local";
import {
  getBrowserTimeZone,
  toPlanLocalDateTimeValue,
} from "@/shared/lib/plan-schedule";

export function getInitialGroupIdentityValues(
  group: Group,
): GroupIdentityFormValues {
  const groupValues = getInitialGroupDetailsValues(group);
  const planValues = getInitialPlanValues(group.plan);

  return {
    avatar: groupValues.avatar,
    coverImage: planValues.coverImage,
    description: groupValues.description,
    name: groupValues.name,
    planCategory: planValues.planCategory,
    planCost: planValues.planCost,
    planCostAmount: planValues.planCostAmount,
    planCostDetails: planValues.planCostDetails,
    planDateTime: planValues.planDateTime,
    planDurationMinutes: planValues.planDurationMinutes,
    planDescription: planValues.planDescription,
    planLocation: planValues.planLocation,
    planLocationLat: planValues.planLocationLat,
    planLocationLng: planValues.planLocationLng,
    planLocationMode: planValues.planLocationMode,
    planScheduleFold: planValues.planScheduleFold,
    planScheduleTouched: planValues.planScheduleTouched,
    planTimeZoneId: planValues.planTimeZoneId,
    planTitle: planValues.planTitle,
  };
}

function getInitialGroupDetailsValues(
  group: Group,
): GroupIdentityDetailsInitialValues {
  return {
    avatar: group.avatar ?? "",
    description: group.description ?? "",
    name: group.name,
  };
}

function getInitialPlanValues(plan: GroupPlan): GroupPlanInitialValues {
  if (!plan) {
    return DEFAULT_PLAN_VALUES;
  }

  return {
    coverImage: getInitialPlanCoverImage(plan),
    planCategory: getInitialPlanCategory(plan),
    ...getInitialPlanCostValues(plan),
    ...getInitialPlanScheduleValues(plan),
    planDescription: getInitialPlanDescription(plan),
    ...getInitialPlanLocationValues(plan),
    planTitle: getInitialPlanTitle(plan),
  };
}

function getInitialPlanCoverImage(plan: ExistingGroupPlan) {
  return plan.coverImage ?? DEFAULT_PLAN_VALUES.coverImage;
}

function getInitialPlanCategory(plan: ExistingGroupPlan) {
  return plan.category ?? DEFAULT_PLAN_VALUES.planCategory;
}

function getInitialPlanCostValues(
  plan: ExistingGroupPlan,
): GroupPlanCostInitialValues {
  return {
    planCost: plan.cost ?? DEFAULT_PLAN_VALUES.planCost,
    planCostAmount: formatInitialCostAmount(plan.costAmount),
    planCostDetails: plan.costDetails ?? DEFAULT_PLAN_VALUES.planCostDetails,
  };
}

function formatInitialCostAmount(costAmount: number | null | undefined) {
  return typeof costAmount === "number" ? String(costAmount) : "";
}

function getInitialPlanScheduleValues(
  plan: ExistingGroupPlan,
): GroupPlanScheduleInitialValues {
  return {
    planDateTime:
      toPlanLocalDateTimeValue(plan.dateTime, plan.timeZoneId) ??
      toDateTimeLocalValue(plan.dateTime ?? null),
    planDurationMinutes:
      typeof plan.durationMinutes === "number"
        ? String(plan.durationMinutes)
        : "",
    planScheduleFold: plan.scheduleFold ?? 0,
    planScheduleTouched: false,
    planTimeZoneId: plan.timeZoneId ?? getBrowserTimeZone(),
  };
}

function getInitialPlanDescription(plan: ExistingGroupPlan) {
  return plan.description ?? DEFAULT_PLAN_VALUES.planDescription;
}

function getInitialPlanLocationValues({
  location,
  locationLat,
  locationLng,
  locationMode,
}: ExistingGroupPlan): GroupPlanLocationInitialValues {
  return {
    planLocation: getInitialPlanLocation(location),
    planLocationLat: getInitialPlanLocationCoordinate(locationLat),
    planLocationLng: getInitialPlanLocationCoordinate(locationLng),
    planLocationMode: getInitialPlanLocationMode(locationMode),
  };
}

function getInitialPlanLocation(location: string | null | undefined) {
  return location ?? DEFAULT_PLAN_VALUES.planLocation;
}

function getInitialPlanLocationCoordinate(
  coordinate: number | null | undefined,
) {
  return coordinate ?? null;
}

function getInitialPlanLocationMode(
  locationMode: ExistingGroupPlan["locationMode"],
) {
  return locationMode ?? DEFAULT_PLAN_VALUES.planLocationMode;
}

function getInitialPlanTitle(plan: ExistingGroupPlan) {
  return plan.title ?? DEFAULT_PLAN_VALUES.planTitle;
}
