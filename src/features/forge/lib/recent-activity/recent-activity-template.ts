import type { RecentForgeActivity } from "@/features/forge/api/forge.api";
import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";
import {
  getRecentActivityCategoryId,
  getRecentActivityCategoryLabel,
  normalizeRecentActivityTitle,
} from "@/features/forge/lib/recent-activity/activity-category";
import {
  isManagedAssetReference,
  isManagedUploadUrl,
} from "@/shared/validators/url.validator";

type RecentActivityGroup = NonNullable<RecentForgeActivity["group"]>;
type RecentActivityPlan = NonNullable<RecentActivityGroup["plan"]>;
type RecentActivityTemplatePlanFields = Pick<
  ForgePlanTemplate,
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
  ForgePlanTemplate,
  "avatarImage" | "fixedSize" | "groupDescription" | "groupName"
>;

function getPlanCostAmount(plan: RecentActivityPlan | null | undefined) {
  const costAmount = plan?.costAmount;

  return typeof costAmount === "number" ? String(costAmount) : "";
}

function getReusableCoverImage(value?: string | null) {
  return typeof value === "string" && isManagedAssetReference(value)
    ? value
    : null;
}

function getReusableAvatarImage(value?: string | null) {
  return typeof value === "string" && isManagedUploadUrl(value) ? value : null;
}

function getTemplateCategoryLabel(activity: RecentForgeActivity) {
  const categoryId = getRecentActivityCategoryId(activity);

  return getRecentActivityCategoryLabel(categoryId, activity.title);
}

function getTemplatePlanFields(
  plan: RecentActivityPlan | null | undefined,
  activityTitle: string,
): RecentActivityTemplatePlanFields {
  return {
    planName: plan?.title ?? normalizeRecentActivityTitle(activityTitle),
    planDescription: plan?.description ?? "",
    planLocation: plan?.location ?? "",
    planLocationLat: plan?.locationLat ?? null,
    planLocationLng: plan?.locationLng ?? null,
    locationType: plan?.locationMode ?? "TBD",
    planCost: plan?.cost ?? "FREE",
    planCostAmount: getPlanCostAmount(plan),
    planCostDetails: plan?.costDetails ?? "",
    coverImage: getReusableCoverImage(plan?.coverImage),
  };
}

function getTemplateGroupFields(
  group: RecentActivityGroup | null | undefined,
): RecentActivityTemplateGroupFields {
  return {
    fixedSize: group?.maxMembers ?? null,
    groupName: group?.name ?? "",
    groupDescription: group?.description ?? "",
    avatarImage: getReusableAvatarImage(group?.avatar),
  };
}

export function buildRecentActivityTemplate(
  activity: RecentForgeActivity,
): ForgePlanTemplate {
  const plan = activity.group?.plan;
  const group = activity.group;
  const categoryLabel = getTemplateCategoryLabel(activity);
  const planFields = getTemplatePlanFields(plan, activity.title);
  const groupFields = getTemplateGroupFields(group);

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
    forgeMode: activity.forgeMode,
    fixedSize: groupFields.fixedSize,
    visibility: activity.visibility,
    groupName: groupFields.groupName,
    groupDescription: groupFields.groupDescription,
    coverImage: planFields.coverImage,
    avatarImage: groupFields.avatarImage,
  };
}
