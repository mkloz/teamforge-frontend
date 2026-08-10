import { queryOptions } from "@tanstack/react-query";

import { GroupProposalAvailabilityApi } from "@/features/plan-creation/api/group-proposal-availability.api";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export function groupProposalAvailabilityQueryOptions() {
  return queryOptions({
    queryKey: APP_QUERY_KEYS.groupFormation.groupProposalAvailability,
    queryFn: () => GroupProposalAvailabilityApi.get(),
    staleTime: 30_000,
  });
}
