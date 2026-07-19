import { queryOptions } from "@tanstack/react-query";

import { getFormationOpening } from "@/shared/api/formation-opening-api";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";

export function formationOpeningDetailQueryOptions(openingId: string | null) {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.forge.proposalOpeningById(openingId ?? "none"),
    queryFn: () => getFormationOpening(openingId ?? ""),
    enabled: Boolean(openingId),
    meta: { errorToast: false },
    refetchInterval: (query) => {
      const opening = query.state.data;
      const isActive =
        opening?.state === "OPEN" || opening?.state === "APPLICATION_PENDING";

      return opening?.viewerRole === "ORGANIZER" && isActive ? 15_000 : false;
    },
    retry: (failureCount, error) => {
      const status = getHttpErrorStatus(error);
      return (
        status !== 403 && status !== 404 && status !== 410 && failureCount < 2
      );
    },
    staleTime: 10_000,
  });
}
