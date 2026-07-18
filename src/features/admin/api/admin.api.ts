import { queryOptions } from "@tanstack/react-query";
import { HTTPError } from "ky";
import {
  ADMIN_QUERY_KEY,
  clearAdminCache,
} from "@/features/admin/api/admin-cache";
import { adminPilotMetricsSchema } from "@/features/admin/schemas/admin-pilot-metrics.schema";
import { adminPilotStatusSchema } from "@/features/admin/schemas/admin-pilot-status.schema";
import { adminSessionSchema } from "@/features/admin/schemas/admin-session.schema";
import { apiClient } from "@/shared/api/api";

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
