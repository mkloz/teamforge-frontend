import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { OperatorAuditApi } from "@/features/operator/api/operator-audit.api";
import type { OperatorAuditListInput } from "@/features/operator/lib/operator-audit-route";

export const OPERATOR_AUDIT_QUERY_KEY = [
  "admin",
  "operator",
  "audit-events",
] as const;

export function operatorAuditEventsQueryOptions(input: OperatorAuditListInput) {
  return queryOptions({
    queryKey: [...OPERATOR_AUDIT_QUERY_KEY, "list", input],
    queryFn: () => OperatorAuditApi.list(input),
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 0,
  });
}

export function operatorAuditEventQueryOptions(eventId: string) {
  return queryOptions({
    queryKey: [...OPERATOR_AUDIT_QUERY_KEY, "detail", eventId],
    queryFn: () => OperatorAuditApi.detail(eventId),
    retry: false,
    staleTime: 0,
  });
}
