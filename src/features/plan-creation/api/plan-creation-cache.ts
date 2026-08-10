import type { AutomaticGroupFormationRequest } from "@/features/plan-creation/schemas/automatic-group-formation-request.schema";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export function setCurrentAutomaticGroupFormationRequest(
  request: AutomaticGroupFormationRequest | null,
) {
  appQueryClient.setQueryData(
    APP_QUERY_KEYS.groupFormation.currentAutoRequest,
    request,
  );
}

export function invalidateCurrentAutomaticGroupFormationRequest() {
  return appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.groupFormation.currentAutoRequest,
  });
}

export function invalidateRecentPlanCreationActivities() {
  return appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.groupFormation.recentActivities,
  });
}

export function invalidateGroupFormationSearchState() {
  return Promise.all([
    invalidateCurrentAutomaticGroupFormationRequest(),
    invalidateRecentPlanCreationActivities(),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.auth.currentUser,
    }),
  ]);
}
