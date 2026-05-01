import { queryOptions } from "@tanstack/react-query";

import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

import { ProfileApi } from "@/features/profile/api/profile.api";

export function publicProfileQueryOptions(userId: string) {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.profile.byId(userId),
    queryFn: () => ProfileApi.getUserProfile(userId),
    staleTime: 60_000,
  });
}
