import { useQuery } from "@tanstack/react-query";

import { groupPlanDetailQueries } from "../api/group-plan-detail-queries";

export function useGroupPlanDetail(groupId: string) {
  return useQuery(groupPlanDetailQueries.detail(groupId));
}
