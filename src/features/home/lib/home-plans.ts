import type { GroupApi } from "@/shared/schemas";

import type { PlannedGroup } from "@/features/home/lib/home-contract";

function hasPlan(group: GroupApi): group is PlannedGroup {
  return group.plan !== null;
}

function isActivePlan(group: PlannedGroup) {
  return group.plan.status !== "COMPLETED" && group.plan.status !== "CANCELLED";
}

export function getActivePlannedGroups(groups: GroupApi[]): PlannedGroup[] {
  return groups
    .filter(hasPlan)
    .filter(isActivePlan)
    .sort((left, right) => {
      const leftTime = left.plan.dateTime
        ? new Date(left.plan.dateTime).getTime()
        : Number.MAX_SAFE_INTEGER;
      const rightTime = right.plan.dateTime
        ? new Date(right.plan.dateTime).getTime()
        : Number.MAX_SAFE_INTEGER;

      return leftTime - rightTime;
    });
}
