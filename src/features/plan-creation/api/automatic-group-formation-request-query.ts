import { queryOptions } from "@tanstack/react-query";
import { PlanCreationApi } from "@/features/plan-creation/api/plan-creation.api";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export const CURRENT_AUTOMATIC_GROUP_FORMATION_REQUEST_QUERY_KEY =
  APP_QUERY_KEYS.groupFormation.currentAutoRequest;

export function currentAutomaticGroupFormationRequestQueryOptions() {
  return queryOptions({
    queryKey: CURRENT_AUTOMATIC_GROUP_FORMATION_REQUEST_QUERY_KEY,
    queryFn: () => PlanCreationApi.getCurrentAutomaticGroupFormationRequest(),
    staleTime: 30_000,
  });
}
