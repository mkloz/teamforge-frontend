import { queryOptions } from "@tanstack/react-query";
import { HTTPError } from "ky";
import {
  ADMIN_QUERY_KEY,
  clearAdminCache,
} from "@/features/admin/api/admin-cache";
import {
  type AdminLifecycleReconciliationAction,
  adminLifecycleQueueSchema,
  adminLifecycleReconciliationResultSchema,
} from "@/features/admin/schemas/admin-lifecycle-operations.schema";
import { adminPilotMetricsSchema } from "@/features/admin/schemas/admin-pilot-metrics.schema";
import { adminPilotStatusSchema } from "@/features/admin/schemas/admin-pilot-status.schema";
import { adminSessionSchema } from "@/features/admin/schemas/admin-session.schema";
import { apiClient } from "@/shared/api/api";

export const ADMIN_LIFECYCLE_QUEUE_QUERY_KEY = [
  ...ADMIN_QUERY_KEY,
  "lifecycle-queue",
] as const;

export const AdminApi = {
  async getSession() {
    try {
      const response = await apiClient.get("admin/moderation/session", {
        cache: "no-store",
      });

      return adminSessionSchema.parse(await response.json<unknown>());
    } catch (error) {
      if (
        error instanceof HTTPError &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        clearAdminCache();
      }

      throw error;
    }
  },
  async getLifecycleQueue() {
    const response = await apiClient.get("admin/moderation/lifecycle-queue", {
      cache: "no-store",
    });
    return adminLifecycleQueueSchema.parse(await response.json<unknown>());
  },
  async reconcileLifecycleIssue(input: {
    action: AdminLifecycleReconciliationAction;
    resourceId: string;
  }) {
    const response = await apiClient.post(
      "admin/moderation/lifecycle-queue/reconcile",
      {
        cache: "no-store",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        json: input,
      },
    );
    return adminLifecycleReconciliationResultSchema.parse(
      await response.json<unknown>(),
    );
  },
  async getPilotStatus() {
    try {
      const response = await apiClient.get("admin/pilot/status", {
        cache: "no-store",
      });

      return adminPilotStatusSchema.parse(await response.json<unknown>());
    } catch (error) {
      if (
        error instanceof HTTPError &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        clearAdminCache();
      }

      throw error;
    }
  },
  async getPilotMetrics() {
    try {
      const response = await apiClient.get("admin/pilot/metrics", {
        cache: "no-store",
      });

      return adminPilotMetricsSchema.parse(await response.json<unknown>());
    } catch (error) {
      if (
        error instanceof HTTPError &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        clearAdminCache();
      }

      throw error;
    }
  },
};

export function adminSessionQueryOptions() {
  return queryOptions({
    queryKey: [...ADMIN_QUERY_KEY, "session"],
    queryFn: () => AdminApi.getSession(),
    gcTime: 0,
    retry: false,
    staleTime: 0,
  });
}

export function adminLifecycleQueueQueryOptions() {
  return queryOptions({
    queryKey: ADMIN_LIFECYCLE_QUEUE_QUERY_KEY,
    queryFn: () => AdminApi.getLifecycleQueue(),
    gcTime: 0,
    retry: false,
    staleTime: 0,
  });
}

export function adminPilotStatusQueryOptions() {
  return queryOptions({
    queryKey: [...ADMIN_QUERY_KEY, "pilot", "status"],
    queryFn: () => AdminApi.getPilotStatus(),
    gcTime: 0,
    retry: false,
    staleTime: 0,
  });
}

export function adminPilotMetricsQueryOptions() {
  return queryOptions({
    queryKey: [...ADMIN_QUERY_KEY, "pilot", "metrics"],
    queryFn: () => AdminApi.getPilotMetrics(),
    gcTime: 0,
    retry: false,
    staleTime: 0,
  });
}
