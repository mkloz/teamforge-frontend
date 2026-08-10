import type { GroupProposalAvailability } from "@/features/plan-creation/schemas/group-proposal-availability.schema";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export function setGroupProposalAvailability(
  availability: GroupProposalAvailability,
) {
  appQueryClient.setQueryData(
    APP_QUERY_KEYS.groupFormation.groupProposalAvailability,
    availability,
  );
}

export function invalidateGroupProposalAvailability() {
  return appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.groupFormation.groupProposalAvailability,
  });
}
