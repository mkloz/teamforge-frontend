import { queryOptions } from "@tanstack/react-query";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

import { GroupPlanDetailApi } from "./group-plan-detail.api";

export const groupPlanDetailQueries = {
  detail(groupId: string) {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.groupPlanDetail.byId(groupId),
      queryFn: () => GroupPlanDetailApi.getDetail(groupId),
      enabled: groupId.length > 0,
      staleTime: 30_000,
    });
  },

  inviteSuggestions(groupId: string, planId: string, enabled: boolean) {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.groupPlanDetail.inviteSuggestions(
        groupId,
        planId,
      ),
      queryFn: () => GroupPlanDetailApi.getInviteSuggestions(groupId),
      enabled: enabled && groupId.length > 0 && planId.length > 0,
      staleTime: 30_000,
    });
  },
};
