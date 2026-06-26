import {
  getExploreGroupDisplayName,
  getExploreGroupDisplayTitle,
  getExploreGroupDistanceLabel,
  getExploreGroupFitReason,
  isExploreGroupFull,
} from "@/shared/lib/explore-group-presenters";
import type { ExploreGroup } from "@/shared/schemas";

const PLAN_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};
const DEFAULT_PLAN_COST = "FREE";
const DEFAULT_PLAN_DATE = "";
const DEFAULT_PLAN_LOCATION_MODE = "TBD";

export function getGroupPlanCardModel(group: ExploreGroup) {
  const title = getExploreGroupDisplayTitle(group);

  return {
    access: group.access,
    distance: getExploreGroupDistanceLabel(group),
    fitReason: getExploreGroupFitReason(group),
    groupName: getExploreGroupDisplayName(group),
    imageAlt: title,
    imageMedia: group.avatarMedia ?? null,
    imageSrc: group.avatar ?? undefined,
    isFull: isExploreGroupFull(group),
    title,
  };
}

export function getGroupPlanCapacityModel(group: ExploreGroup) {
  const currentSize = group.activeMembersCount;
  const capacity = group.maxMembers;
  const spotsLeft = capacity > 0 ? Math.max(0, capacity - currentSize) : null;

  return {
    capacity,
    currentSize,
    spotsLeft,
  };
}

export function getGroupPlanMetaModel(group: ExploreGroup, distance?: string) {
  const { cost, dateStr, locationMode } = getGroupPlanMetaSource(group);
  const isOnline = isOnlineLocationMode(locationMode);

  return {
    formattedDate: formatPlanDate(dateStr),
    isFree: isFreePlanCost(cost),
    isOnline,
    locationLabel: getGroupPlanLocationLabel({ distance, isOnline }),
  };
}

function getGroupPlanMetaSource(group: ExploreGroup) {
  const plan = group.plan;

  return {
    cost: getPlanCost(plan),
    dateStr: getPlanDateString(plan),
    locationMode: getPlanLocationMode(plan),
  };
}

function getPlanCost(plan: ExploreGroup["plan"]) {
  return plan?.cost || DEFAULT_PLAN_COST;
}

function getPlanDateString(plan: ExploreGroup["plan"]) {
  return plan?.dateTime || DEFAULT_PLAN_DATE;
}

function getPlanLocationMode(plan: ExploreGroup["plan"]) {
  return plan?.locationMode || DEFAULT_PLAN_LOCATION_MODE;
}

function isOnlineLocationMode(locationMode: string) {
  return locationMode === "ONLINE";
}

function isFreePlanCost(cost: string) {
  return cost === "FREE";
}

function getGroupPlanLocationLabel({
  distance,
  isOnline,
}: {
  distance?: string;
  isOnline: boolean;
}) {
  return isOnline ? "Online" : distance || "Location pending";
}

function formatPlanDate(dateStr: string) {
  const date = new Date(dateStr);

  if (!dateStr || Number.isNaN(date.getTime())) {
    return "Date TBD";
  }

  return date
    .toLocaleString("en-US", PLAN_DATE_FORMAT_OPTIONS)
    .replace(/,/g, " •");
}
