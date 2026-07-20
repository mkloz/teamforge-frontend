import { queryOptions } from "@tanstack/react-query";
import { HTTPError } from "ky";
import {
  ADMIN_QUERY_KEY,
  clearAdminCache,
} from "@/features/admin/api/admin-cache";
import {
  type AdminAdultEligibilityCorrectionDecision,
  adminAdultEligibilityCorrectionDecisionSchema,
  adminAdultEligibilityCorrectionSchema,
  adminAdultEligibilityCorrectionsSchema,
} from "@/features/admin/schemas/admin-adult-eligibility-correction.schema";
import { apiClient } from "@/shared/api/api";

const CORRECTIONS_PATH = "admin/account-rights/adult-eligibility-corrections";

export const ADMIN_ADULT_ELIGIBILITY_CORRECTIONS_QUERY_KEY = [
  ...ADMIN_QUERY_KEY,
  "account-rights",
  "adult-eligibility-corrections",
] as const;

export const AdminAdultEligibilityCorrectionsApi = {
  async listOpen() {
    try {
      const response = await apiClient.get(CORRECTIONS_PATH, {
        cache: "no-store",
      });

      return adminAdultEligibilityCorrectionsSchema.parse(
        await response.json<unknown>(),
      );
    } catch (error) {
      clearAdminCacheAfterDeniedRequest(error);
      throw error;
    }
  },
  async decide(
    correctionId: string,
    input: AdminAdultEligibilityCorrectionDecision,
    idempotencyKey: string,
  ) {
    try {
      const response = await apiClient.post(
        `${CORRECTIONS_PATH}/${encodeURIComponent(correctionId)}/decision`,
        {
          cache: "no-store",
          headers: { "Idempotency-Key": idempotencyKey },
          json: adminAdultEligibilityCorrectionDecisionSchema.parse(input),
        },
      );

      return adminAdultEligibilityCorrectionSchema.parse(
        await response.json<unknown>(),
      );
    } catch (error) {
      clearAdminCacheAfterDeniedRequest(error);
      throw error;
    }
  },
};

function clearAdminCacheAfterDeniedRequest(error: unknown) {
  if (
    error instanceof HTTPError &&
    (error.response.status === 401 || error.response.status === 403)
  ) {
    clearAdminCache();
  }
}

export function adminAdultEligibilityCorrectionsQueryOptions() {
  return queryOptions({
    queryKey: ADMIN_ADULT_ELIGIBILITY_CORRECTIONS_QUERY_KEY,
    queryFn: () => AdminAdultEligibilityCorrectionsApi.listOpen(),
    gcTime: 0,
    retry: false,
    staleTime: 0,
  });
}
