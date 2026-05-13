import { queryOptions } from "@tanstack/react-query";

import { apiClient } from "@/shared/api/api";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { publicUserResponseSchema } from "@/shared/schemas";

export function activityParticipantProfileQueryOptions(userId: string) {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.profile.byId(userId),
    queryFn: async () => {
      const response = await apiClient.get(`users/${userId}`).json<unknown>();

      return publicUserResponseSchema.parse(response);
    },
    staleTime: 60_000,
  });
}
