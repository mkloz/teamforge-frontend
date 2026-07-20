import { queryOptions } from "@tanstack/react-query";

import { ADMIN_QUERY_KEY } from "@/features/admin/api/admin-cache";
import {
  adminPilotOperationsCoverageCommandResultSchema,
  adminPilotOperationsReadinessSchema,
  type DeclareAdminPilotOperationsCoverage,
  declareAdminPilotOperationsCoverageSchema,
  type RevokeAdminPilotOperationsCoverage,
  revokeAdminPilotOperationsCoverageSchema,
} from "@/features/admin/schemas/admin-pilot-operations.schema";
import { apiClient } from "@/shared/api/api";

const PILOT_OPERATIONS_PATH = "operator/pilot/operations";

export const ADMIN_PILOT_OPERATIONS_QUERY_KEY = [
  ...ADMIN_QUERY_KEY,
  "pilot",
  "operations",
  "readiness",
] as const;

export const AdminPilotOperationsApi = {
  async getReadiness() {
    const response = await apiClient.get(`${PILOT_OPERATIONS_PATH}/readiness`, {
      cache: "no-store",
    });

    return adminPilotOperationsReadinessSchema.parse(
      await response.json<unknown>(),
    );
  },
  async declareCoverage(input: DeclareAdminPilotOperationsCoverage) {
    const body = declareAdminPilotOperationsCoverageSchema.parse(input);
    const response = await apiClient.post(
      `${PILOT_OPERATIONS_PATH}/coverage-declarations`,
      { json: body },
    );

    return adminPilotOperationsCoverageCommandResultSchema.parse(
      await response.json<unknown>(),
    );
  },
  async revokeCoverage(
    declarationId: string,
    input: RevokeAdminPilotOperationsCoverage,
  ) {
    const body = revokeAdminPilotOperationsCoverageSchema.parse(input);
    const response = await apiClient.post(
      `${PILOT_OPERATIONS_PATH}/coverage-declarations/${encodeURIComponent(declarationId)}/revocation`,
      { json: body },
    );

    return adminPilotOperationsCoverageCommandResultSchema.parse(
      await response.json<unknown>(),
    );
  },
};

export function adminPilotOperationsReadinessQueryOptions() {
  return queryOptions({
    queryKey: ADMIN_PILOT_OPERATIONS_QUERY_KEY,
    queryFn: () => AdminPilotOperationsApi.getReadiness(),
    gcTime: 0,
    retry: false,
    staleTime: 0,
  });
}
