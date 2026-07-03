import { queryOptions } from "@tanstack/react-query";

import { getPublicUserById as sharedGetPublicUserById } from "@/shared/api/public-user-api";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export function activityParticipantProfileQueryOptions(userId: string) {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.profile.byId(userId),
    queryFn: () => sharedGetPublicUserById(userId),
    staleTime: 60_000,
  });
}
