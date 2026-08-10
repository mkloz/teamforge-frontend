import type { RecentPlanCreationActivity } from "@/features/plan-creation/api/plan-creation.api";
import type { PlanTemplate } from "@/features/plan-creation/lib/plan-template";
import {
  getRecentActivityCategoryId,
  getRecentActivityCategoryLabel,
  normalizeRecentActivityTitle,
} from "@/features/plan-creation/lib/recent-activity/activity-category";
import {
  isManagedAssetReference,
  isManagedUploadUrl,
} from "@/shared/validators/url.validator";

type RecentActivityGroup = NonNullable<RecentPlanCreationActivity["group"]>;
type RecentActivityPlan = NonNullable<RecentActivityGroup["plan"]>;
type RecentActivityTemplatePlanFields = Pick<
  PlanTemplate,
  | "coverImage"
  | "locationType"
  | "planCost"
  | "planCostAmount"
  | "planCostDetails"
  | "planDescription"
  | "planLocation"
  | "planLocationLat"
  | "planLocationLng"
  | "planName"
>;
type RecentActivityTemplateGroupFields = Pick<
  PlanTemplate,
  "avatarImage" | "fixedSize" | "groupDescription" | "groupName"
>;
type RecentActivityPlanCopyFields = Pick<
  RecentActivityTemplatePlanFields,
  "planDescription" | "planName"
>;
type RecentActivityPlanLocationFields = Pick<
  RecentActivityTemplatePlanFields,
  "locationType" | "planLocation" | "planLocationLat" | "planLocationLng"
>;
type RecentActivityPlanCostFields = Pick<
  RecentActivityTemplatePlanFields,
  "planCost" | "planCostAmount" | "planCostDetails"
>;
type RecentActivityGroupCopyFields = Pick<
  RecentActivityTemplateGroupFields,
  "groupDescription" | "groupName"
>;

interface RecentActivityTemplateSections {
  categoryLabel: string;
  groupFields: RecentActivityTemplateGroupFields;
  planFields: RecentActivityTemplatePlanFields;
}

const DEFAULT_TEMPLATE_TEXT = "";
const DEFAULT_TEMPLATE_LOCATION_TYPE = "TBD";
const DEFAULT_TEMPLATE_COST = "FREE";
const EMPTY_RECENT_ACTIVITY_PLAN: Partial<RecentActivityPlan> = {};

function getTemplateText(value: string | null | undefined) {
  return value ?? DEFAULT_TEMPLATE_TEXT;
}

function getTemplateNumber(value: number | null | undefined) {
  return value ?? null;
}

function getTemplateCostAmount(value: number | null | undefined) {
  return typeof value === "number" ? String(value) : "";
}

function getTemplateLocationType(
  value: RecentActivityPlan["locationMode"] | null | undefined,
): RecentActivityPlanLocationFields["locationType"] {
  return value ?? DEFAULT_TEMPLATE_LOCATION_TYPE;
}

function getTemplateCost(
  value: RecentActivityPlan["cost"] | null | undefined,
): RecentActivityPlanCostFields["planCost"] {
  return value ?? DEFAULT_TEMPLATE_COST;
}

function getReusableTemplateCoverImage(value?: string | null) {
  return typeof value === "string" && isManagedAssetReference(value)
    ? value
    : null;
}

function getReusableTemplateAvatarImage(value?: string | null) {
  return typeof value === "string" && isManagedUploadUrl(value) ? value : null;
}

function getRecentActivityTemplateCategoryLabel(
  activity: RecentPlanCreationActivity,
) {
  const categoryId = getRecentActivityCategoryId(activity);

  return getRecentActivityCategoryLabel(categoryId, activity.title);
}

function getRecentActivityPlanCopyFields(
  plan: RecentActivityPlan | null | undefined,
  activityTitle: string,
): RecentActivityPlanCopyFields {
  return {
    planName: plan?.title ?? normalizeRecentActivityTitle(activityTitle),
    planDescription: getTemplateText(plan?.description),
  };
}

function getRecentActivityPlanLocationFields(
  plan: RecentActivityPlan | null | undefined,
): RecentActivityPlanLocationFields {
  const source = plan ?? EMPTY_RECENT_ACTIVITY_PLAN;

  return {
    planLocation: getTemplateText(source.location),
    planLocationLat: getTemplateNumber(source.locationLat),
    planLocationLng: getTemplateNumber(source.locationLng),
    locationType: getTemplateLocationType(source.locationMode),
  };
}

function getRecentActivityPlanCostFields(
  plan: RecentActivityPlan | null | undefined,
): RecentActivityPlanCostFields {
  const source = plan ?? EMPTY_RECENT_ACTIVITY_PLAN;

  return {
    planCost: getTemplateCost(source.cost),
    planCostAmount: getTemplateCostAmount(source.costAmount),
    planCostDetails: getTemplateText(source.costDetails),
  };
}

function getRecentActivityTemplatePlanFields(
  plan: RecentActivityPlan | null | undefined,
  activityTitle: string,
): RecentActivityTemplatePlanFields {
  return {
    ...getRecentActivityPlanCopyFields(plan, activityTitle),
    ...getRecentActivityPlanLocationFields(plan),
    ...getRecentActivityPlanCostFields(plan),
    coverImage: getReusableTemplateCoverImage(plan?.coverImage),
  };
}

function getRecentActivityGroupCopyFields(
  group: RecentActivityGroup | null | undefined,
): RecentActivityGroupCopyFields {
  return {
    groupName: getTemplateText(group?.name),
    groupDescription: getTemplateText(group?.description),
  };
}

function getRecentActivityTemplateGroupFields(
  group: RecentActivityGroup | null | undefined,
): RecentActivityTemplateGroupFields {
  return {
    ...getRecentActivityGroupCopyFields(group),
    fixedSize: getTemplateNumber(group?.maxMembers),
    avatarImage: getReusableTemplateAvatarImage(group?.avatar),
  };
}

function getRecentActivityTemplateSections(
  activity: RecentPlanCreationActivity,
): RecentActivityTemplateSections {
  const plan = activity.group?.plan;
  const group = activity.group;

  return {
    categoryLabel: getRecentActivityTemplateCategoryLabel(activity),
    groupFields: getRecentActivityTemplateGroupFields(group),
    planFields: getRecentActivityTemplatePlanFields(plan, activity.title),
  };
}

export function buildRecentActivityTemplate(
  activity: RecentPlanCreationActivity,
): PlanTemplate {
  const { categoryLabel, groupFields, planFields } =
    getRecentActivityTemplateSections(activity);

  return {
    selectedActivity: categoryLabel,
    planName: planFields.planName,
    planDescription: planFields.planDescription,
    planLocation: planFields.planLocation,
    planLocationLat: planFields.planLocationLat,
    planLocationLng: planFields.planLocationLng,
    locationType: planFields.locationType,
    planCost: planFields.planCost,
    planCostAmount: planFields.planCostAmount,
    planCostDetails: planFields.planCostDetails,
    groupFormationMode: activity.groupFormationMode,
    fixedSize: groupFields.fixedSize,
    recommendedMinimumGroupSize: null,
    recommendedMaximumGroupSize: null,
    visibility: activity.visibility,
    groupName: groupFields.groupName,
    groupDescription: groupFields.groupDescription,
    coverImage: planFields.coverImage,
    avatarImage: groupFields.avatarImage,
  };
}
