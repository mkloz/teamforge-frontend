import {
  getExploreGroupDisplayTitle,
  getExploreGroupDistanceLabel,
  getExploreGroupFitReason,
  isExploreGroupFull,
} from "@/shared/lib/explore-group-presenters";
import type { ExploreGroup } from "@/shared/schemas";

export function getGroupPlanCardModel(group: ExploreGroup) {
  return {
    distance: getExploreGroupDistanceLabel(group),
    fitReason: getExploreGroupFitReason(group),
    isFull: isExploreGroupFull(group),
    title: getExploreGroupDisplayTitle(group),
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
  const plan = group.plan;
  const dateStr = plan?.dateTime || "";
  const locationMode = plan?.locationMode || "TBD";
  const cost = plan?.cost || "FREE";
  const isOnline = locationMode === "ONLINE";
  const isFree = cost === "FREE";

  return {
    formattedDate: formatPlanDate(dateStr),
    isFree,
    isOnline,
    locationLabel: isOnline ? "Online" : distance || "Location pending",
  };
}

function formatPlanDate(dateStr: string) {
  return dateStr
    ? new Date(dateStr)
        .toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/,/g, " •")
    : "Date TBD";
}
