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

function getPlanCostAmount(activity: RecentForgeActivity) {
  const costAmount = activity.group?.plan?.costAmount;

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

export function buildRecentActivityTemplate(
  activity: RecentForgeActivity,
): ForgePlanTemplate {
  const plan = activity.group?.plan;
  const group = activity.group;
  const categoryId = getRecentActivityCategoryId(activity);
  const categoryLabel = getRecentActivityCategoryLabel(
    categoryId,
    activity.title,
  );

  return {
    selectedActivity: categoryLabel,
    planName: plan?.title ?? normalizeRecentActivityTitle(activity.title),
    planDescription: plan?.description ?? "",
    planLocation: plan?.location ?? "",
    planLocationLat: plan?.locationLat ?? null,
    planLocationLng: plan?.locationLng ?? null,
    locationType: plan?.locationMode ?? "TBD",
    planCost: plan?.cost ?? "FREE",
    planCostAmount: getPlanCostAmount(activity),
    planCostDetails: plan?.costDetails ?? "",
    forgeMode: activity.forgeMode,
    fixedSize: group?.maxMembers ?? null,
    visibility: activity.visibility,
    groupName: group?.name ?? "",
    groupDescription: group?.description ?? "",
    coverImage: getReusableCoverImage(plan?.coverImage),
    avatarImage: getReusableAvatarImage(group?.avatar),
  };
}
