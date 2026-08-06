import { queryOptions } from "@tanstack/react-query";
import { operatorQueueHealthSchema } from "@/features/operator/schemas/operator-queue-health.schemas";
import { apiClient } from "@/shared/api/api";

export const OPERATOR_QUEUE_HEALTH_QUERY_KEY = [
  "admin",
  "operator",
  "moderation",
  "queue-health",
] as const;

export async function getOperatorQueueHealth() {
  const response = await apiClient.get("operator/moderation/queue-health", {
    cache: "no-store",
  });
  return operatorQueueHealthSchema.parse(await response.json());
}

export function operatorQueueHealthQueryOptions(enabled = true) {
  return queryOptions({
    queryKey: OPERATOR_QUEUE_HEALTH_QUERY_KEY,
    queryFn: getOperatorQueueHealth,
    enabled,
    retry: false,
    staleTime: 0,
  });
}
