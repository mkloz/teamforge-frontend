import { redirect } from "@tanstack/react-router";

import { refreshAuthSession } from "@/shared/api/api";
import { isApiNetworkError } from "@/shared/api/api-network-error";
import { authSession } from "@/shared/api/auth-session";
import { getCachedCurrentUser } from "@/shared/api/current-user-cache";
import {
  buildAuthRouteNavigation,
  buildPostAuthRedirectNavigation,
  buildRouteLocationHref,
  parseAuthReturnSearch,
} from "@/shared/lib/auth-route";
import { getPostAuthRedirectPath } from "@/shared/lib/post-auth-route";

interface RouteLocationLike {
  pathname: string;
  searchStr: string;
}

interface PublicAuthRouteLoadContext {
  location: {
    searchStr: string;
  };
}

interface RequireAuthenticatedUserOptions {
  onSessionRestored?: () => void | Promise<void>;
}

type AuthSessionRestoreState = "authenticated" | "missing" | "offline";

async function restoreAuthSessionIfNeeded(): Promise<AuthSessionRestoreState> {
  if (!authSession.hasTokens()) {
    try {
      await refreshAuthSession();
    } catch (error) {
      return isApiNetworkError(error) ? "offline" : "missing";
    }
  }

  return authSession.hasTokens() ? "authenticated" : "missing";
}

async function resolveCurrentUser() {
  const cachedCurrentUser = getCachedCurrentUser();

  if (cachedCurrentUser) {
    return cachedCurrentUser;
  }

  const { ensureCurrentUser } = await import("@/shared/api/current-user-query");

  return ensureCurrentUser();
}

function redirectToLogin(returnHref: string | null): never {
  throw redirect(buildAuthRouteNavigation("/auth/login", returnHref));
}

function getOfflineCurrentUserFallback() {
  return getCachedCurrentUser();
}

function isOnboardingEditMode(searchStr: string) {
  return new URLSearchParams(searchStr).get("mode") === "edit";
}

export async function redirectAuthenticatedUser({
  location,
}: PublicAuthRouteLoadContext) {
  if (!authSession.hasTokens()) {
    return;
  }

  const hasSession = await restoreAuthSessionIfNeeded();

  if (hasSession !== "authenticated") {
    return;
  }

  const currentUser = await resolveCurrentUser().catch(() => null);

  if (!currentUser) {
    return;
  }

  const { returnTo } = parseAuthReturnSearch(location.searchStr);

  throw redirect(buildPostAuthRedirectNavigation(currentUser, returnTo));
}

export async function requireAuthenticatedUser(
  location?: RouteLocationLike,
  options?: RequireAuthenticatedUserOptions,
) {
  const returnHref = buildRouteLocationHref(location);
  const sessionState = await restoreAuthSessionIfNeeded();

  if (sessionState === "missing") {
    return redirectToLogin(returnHref);
  }

  if (sessionState === "offline") {
    return getOfflineCurrentUserFallback();
  }

  if (options?.onSessionRestored) {
    void Promise.resolve(options.onSessionRestored()).catch(() => null);
  }

  try {
    const currentUser = await resolveCurrentUser();

    if (!currentUser) {
      return redirectToLogin(returnHref);
    }

    return currentUser;
  } catch (error) {
    if (isApiNetworkError(error)) {
      return getOfflineCurrentUserFallback();
    }

    return redirectToLogin(returnHref);
  }
}

export async function requireCanonicalAppRoute(
  location: RouteLocationLike,
  options?: RequireAuthenticatedUserOptions,
) {
  const currentUser = await requireAuthenticatedUser(location, options);

  if (!currentUser) {
    return;
  }

  const canonicalDestination = getPostAuthRedirectPath(currentUser);

  if (canonicalDestination !== "/home") {
    throw redirect({ to: canonicalDestination });
  }
}

export async function requireCanonicalOnboardingRoute(
  location: RouteLocationLike,
  expectedDestination:
    | "/onboarding/profile"
    | "/onboarding/personality"
    | "/onboarding/interests",
) {
  const currentUser = await requireAuthenticatedUser(location);

  if (!currentUser) {
    return;
  }

  const canonicalDestination = getPostAuthRedirectPath(currentUser);

  if (canonicalDestination !== expectedDestination) {
    throw redirect({ to: canonicalDestination });
  }
}

export async function requireEditableOnboardingRoute(
  location: RouteLocationLike,
  expectedDestination: "/onboarding/personality" | "/onboarding/interests",
) {
  const currentUser = await requireAuthenticatedUser(location);

  if (!currentUser) {
    return;
  }

  const canonicalDestination = getPostAuthRedirectPath(currentUser);

  if (isOnboardingEditMode(location.searchStr)) {
    if (canonicalDestination !== "/home") {
      throw redirect({ to: canonicalDestination });
    }

    return;
  }

  if (canonicalDestination !== expectedDestination) {
    const isReturningFromInterestsToPersonality =
      expectedDestination === "/onboarding/personality" &&
      canonicalDestination === "/onboarding/interests";

    if (isReturningFromInterestsToPersonality) {
      return;
    }

    throw redirect({ to: canonicalDestination });
  }
}
