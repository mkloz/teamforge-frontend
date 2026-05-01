import type { ExploreGroup } from "@/shared/schemas";

export function getExploreGroupMatchScore(group: ExploreGroup) {
  const score = group.compatibility.total;

  if (score > 0 && score <= 1) {
    return Math.round(score * 100);
  }

  return Math.round(score);
}

export function getExploreGroupDistanceLabel(group: ExploreGroup) {
  if (group.plan?.locationMode === "ONLINE") {
    return "Online";
  }

  return group.activity.city || "Location pending";
}

export function isExploreGroupFull(group: ExploreGroup) {
  return group.maxMembers > 0 && group.activeMembersCount >= group.maxMembers;
}
