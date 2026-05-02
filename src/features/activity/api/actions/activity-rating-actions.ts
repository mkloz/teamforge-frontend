import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { CreateRatingPayload } from "@/shared/schemas";

import { ActivityApi } from "@/features/activity/api/activity.api";

export const ActivityRatingActions = {
  async createGroupRating(groupId: string, payload: CreateRatingPayload) {
    const result = await ActivityApi.createRating(payload);

    await Promise.all([
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.activity.groupRatings(groupId),
      }),
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.activity.groupSelectionById(groupId),
      }),
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.activity.groups,
      }),
    ]);

    return result;
  },
};
