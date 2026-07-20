import { redirect } from "@tanstack/react-router";
import type { RequireAuthenticatedUserOptions } from "@/app/router/route-guards/types";
import { refreshAuthSession } from "@/shared/api/api";
import { isApiNetworkError } from "@/shared/api/api-network-error";
import { authSession } from "@/shared/api/auth-session";
import { getCachedCurrentUser } from "@/shared/api/current-user-cache";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";
import { buildAuthRouteNavigation } from "@/shared/lib/auth-route";

type AuthSessionRestoreState = "authenticated" | "missing" | "offline";

export async function restoreAuthSessionIfNeeded(): Promise<AuthSessionRestoreState> {
  if (!authSession.hasTokens()) {
    try {
      await refreshAuthSession();
    } catch (error) {
      return isApiNetworkError(error) ? "offline" : "missing";
    }
  }

  return authSession.hasTokens() ? "authenticated" : "missing";
}

export async function resolveCurrentUser() {
  const cachedCurrentUser = getCachedCurrentUser();

  if (cachedCurrentUser) {
    return cachedCurrentUser;
  }

  const { ensureCurrentUser } = await import("@/shared/api/current-user-query");

  try {
    return await ensureCurrentUser();
  } catch (error) {
    if (getHttpErrorStatus(error) === 401) {
      return null;
    }

    throw error;
  }
}

export function notifySessionRestored(
  options?: RequireAuthenticatedUserOptions,
) {
  if (!options?.onSessionRestored) {
    return;
  }

  void Promise.resolve(options.onSessionRestored()).catch(() => null);
}

export function resolveSessionFallback(
  sessionState: AuthSessionRestoreState,
  returnHref: string | null,
) {
  if (sessionState === "missing") {
    return redirectToLogin(returnHref);
  }

  if (sessionState === "offline") {
    return getOfflineCurrentUserFallback(returnHref);
  }

  return null;
}

export async function resolveAuthenticatedCurrentUser(
  returnHref: string | null,
) {
  try {
    const currentUser = await resolveCurrentUser();

    if (!currentUser) {
      return redirectToLogin(returnHref);
    }

    return currentUser;
  } catch (error) {
    if (isApiNetworkError(error)) {
      return getOfflineCurrentUserFallback(returnHref);
    }

    throw error;
  }
}

function redirectToLogin(returnHref: string | null): never {
  throw redirect(buildAuthRouteNavigation("/auth/login", returnHref));
}

function getOfflineCurrentUserFallback(returnHref: string | null) {
  const cachedCurrentUser = getCachedCurrentUser();

  if (!cachedCurrentUser) {
    return redirectToLogin(returnHref);
  }

  return cachedCurrentUser;
}
