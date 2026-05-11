import { useQuery } from "@tanstack/react-query";

import { GroupPlanDetailQueryFactory } from "../api/group-plan-detail-query-factory";

export function useGroupPlanDetail(groupId: string) {
  return useQuery(GroupPlanDetailQueryFactory.detail(groupId));
}
