import { redirect } from "@tanstack/react-router";
import { adminSessionQueryOptions } from "@/features/admin/api/admin.api";
import { clearAdminCache } from "@/features/admin/api/admin-cache";
import { apiClient } from "@/shared/api/api";
import { CURRENT_USER_QUERY_KEY } from "@/shared/api/current-user-cache";
import { appQueryClient } from "@/shared/api/query-client";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";
import {
  buildAuthRouteNavigation,
  buildRouteLocationHref,
  type RouteLocationLike,
} from "@/shared/lib/auth-route";
import { fullUserResponseSchema } from "@/shared/schemas/user-response";
import { restoreAuthSessionIfNeeded } from "./route-guards/session-resolution";

export async function requireAdminRoute(location: RouteLocationLike) {
  const returnTo = buildRouteLocationHref(location);
  const sessionState = await restoreAuthSessionIfNeeded();

  if (sessionState === "missing") {
    redirectToLogin(returnTo);
  }

  if (sessionState === "offline") {
    throw new Error("Admin access could not be verified while offline.");
  }

  const currentUser = await getFreshCurrentUser(returnTo);
  appQueryClient.setQueryData(CURRENT_USER_QUERY_KEY, currentUser);

  if (currentUser.role !== "ADMIN") {
    clearAdminCache();
    throw redirect({ to: "/home" });
  }

  try {
    const adminSession = await appQueryClient.fetchQuery(
      adminSessionQueryOptions(),
    );

    if (adminSession.userId !== currentUser.id) {
      clearAdminCache();
      throw redirect({ to: "/home" });
    }

    return { adminSession };
  } catch (error) {
    handleAdminAccessError(error, returnTo);
    throw error;
  }
}

async function getFreshCurrentUser(returnTo: string | null) {
  try {
    const response = await apiClient.get("users/me", { cache: "no-store" });
    return fullUserResponseSchema.parse(await response.json<unknown>());
  } catch (error) {
    const status = getHttpErrorStatus(error);

    if (status === 401 || status === 403) {
      clearAdminCache();
    }

    if (status === 401) {
      redirectToLogin(returnTo);
    }

    if (status === 403) {
      throw redirect({ to: "/home" });
    }

    throw error;
  }
}

function handleAdminAccessError(error: unknown, returnTo: string | null) {
  const status = getHttpErrorStatus(error);

  if (status === 401) {
    redirectToLogin(returnTo);
  }

  if (status === 403) {
    throw redirect({ to: "/home" });
  }
}

function redirectToLogin(returnTo: string | null): never {
  throw redirect(buildAuthRouteNavigation("/auth/login", returnTo));
}
