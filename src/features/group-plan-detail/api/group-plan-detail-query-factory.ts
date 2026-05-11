import { GroupPlanDetailQueryOptions } from "./group-plan-detail-query-options";

export const GroupPlanDetailQueryFactory = {
  detail(groupId: string) {
    return GroupPlanDetailQueryOptions.detail(groupId);
  },
};
