import { redirect } from "@tanstack/react-router";
import { adminSessionQueryOptions } from "@/features/admin/api/admin.api";
import { clearAdminCache } from "@/features/admin/api/admin-cache";
import { apiClient } from "@/shared/api/api";
import { CURRENT_USER_QUERY_KEY } from "@/shared/api/current-user-cache";
import { appQueryClient } from "@/shared/api/query-client";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";
import { buildAuthRouteNavigation } from "@/shared/lib/auth-route";
import { fullUserResponseSchema } from "@/shared/schemas/user-response";
import { restoreAuthSessionIfNeeded } from "./route-guards/session-resolution";

export async function requireAdminRoute() {
  const sessionState = await restoreAuthSessionIfNeeded();

  if (sessionState === "missing") {
    redirectToLogin();
  }

  if (sessionState === "offline") {
    throw new Error("Admin access could not be verified while offline.");
  }

  const currentUser = await getFreshCurrentUser();
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
    handleAdminAccessError(error);
    throw error;
  }
}

async function getFreshCurrentUser() {
  try {
    const response = await apiClient.get("users/me", { cache: "no-store" });
    return fullUserResponseSchema.parse(await response.json<unknown>());
  } catch (error) {
    const status = getHttpErrorStatus(error);

    if (status === 401 || status === 403) {
      clearAdminCache();
    }

    if (status === 401) {
      redirectToLogin();
    }

    if (status === 403) {
      throw redirect({ to: "/home" });
    }

    throw error;
  }
}

function handleAdminAccessError(error: unknown) {
  const status = getHttpErrorStatus(error);

  if (status === 401) {
    redirectToLogin();
  }

  if (status === 403) {
    throw redirect({ to: "/home" });
  }
}

function redirectToLogin(): never {
  throw redirect(buildAuthRouteNavigation("/auth/login", null));
}
