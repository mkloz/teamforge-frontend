import { ActivityApi } from "@/features/activity/api/activity.api";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type {
  CreateRatingPayload,
  DeferGroupReviewPayload,
} from "@/shared/schemas";

export const ActivityRatingActions = {
  async createGroupRating(groupId: string, payload: CreateRatingPayload) {
    const result = await ActivityApi.createRating(payload);

    await Promise.all([
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.activity.groupRatings(groupId),
      }),
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.activity.groupReviewState(groupId),
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

  async deferGroupReview(groupId: string, payload: DeferGroupReviewPayload) {
    const result = await ActivityApi.deferGroupReview(groupId, payload);

    await appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.groupReviewState(groupId),
    });

    return result;
  },
};
