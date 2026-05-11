import { queryOptions } from "@tanstack/react-query";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

import { GroupPlanDetailApi } from "./group-plan-detail.api";

export const GroupPlanDetailQueryOptions = {
  detail(groupId: string) {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.groupPlanDetail.byId(groupId),
      queryFn: () => GroupPlanDetailApi.getDetail(groupId),
      enabled: groupId.length > 0,
      staleTime: 30_000,
    });
  },
};
