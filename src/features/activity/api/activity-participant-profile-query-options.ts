import { queryOptions } from "@tanstack/react-query";

import { getViewerProfileById } from "@/shared/api/public-user-api";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export function activityParticipantProfileQueryOptions(userId: string) {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.profile.byId(userId),
    queryFn: () => getViewerProfileById(userId),
    gcTime: 0,
    staleTime: 0,
    meta: { errorToast: false },
  });
}
