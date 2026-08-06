import type { OperatorAuditListInput } from "@/features/operator/lib/operator-audit-route";
import {
  operatorAuditEventDetailSchema,
  operatorAuditEventPageSchema,
} from "@/features/operator/schemas/operator-audit.schemas";
import { apiClient } from "@/shared/api/api";
import { compactOperatorSearchParams } from "./operator-search-params";

const AUDIT_PATH = "operator/audit-events";

export const OperatorAuditApi = {
  async list(input: OperatorAuditListInput) {
    const response = await apiClient.get(AUDIT_PATH, {
      cache: "no-store",
      searchParams: compactOperatorSearchParams(input),
    });
    return operatorAuditEventPageSchema.parse(await response.json());
  },

  async detail(eventId: string) {
    const response = await apiClient.get(`${AUDIT_PATH}/${eventId}`, {
      cache: "no-store",
    });
    return operatorAuditEventDetailSchema.parse(await response.json());
  },
};
