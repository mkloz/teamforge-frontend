import { redirect } from "@tanstack/react-router";
import {
  buildGuardReturnHref,
  redirectToCanonicalRouteHref,
} from "@/app/router/route-guards/canonical-search";
import {
  getEditableOnboardingRedirectTarget,
  isOnboardingEditMode,
} from "@/app/router/route-guards/onboarding-redirects";
import {
  notifySessionRestored,
  resolveAuthenticatedCurrentUser,
  resolveCurrentUser,
  resolveSessionFallback,
  restoreAuthSessionIfNeeded,
} from "@/app/router/route-guards/session-resolution";
import type {
  PublicAuthRouteLoadContext,
  RequireAuthenticatedUserOptions,
  RouteGuardLocationLike,
} from "@/app/router/route-guards/types";
import { isApiNetworkError } from "@/shared/api/api-network-error";
import { authSession } from "@/shared/api/auth-session";
import {
  buildPostAuthRedirectNavigation,
  parseAuthReturnSearch,
} from "@/shared/lib/auth-route";
import { getPostAuthRedirectPath } from "@/shared/lib/post-auth-route";

async function redirectAuthenticatedUser({
  location,
}: PublicAuthRouteLoadContext) {
  if (!authSession.hasTokens()) {
    return;
  }

  const hasSession = await restoreAuthSessionIfNeeded();

  if (hasSession !== "authenticated") {
    return;
  }

  const currentUser = await resolveCurrentUser().catch((error: unknown) => {
    if (isApiNetworkError(error)) {
      return null;
    }

    throw error;
  });

  if (!currentUser) {
    return;
  }

  const { returnTo } = parseAuthReturnSearch(location.searchStr);

  throw redirect(buildPostAuthRedirectNavigation(currentUser, returnTo));
}

async function requireAuthenticatedUser(
  location?: RouteGuardLocationLike,
  options?: RequireAuthenticatedUserOptions,
) {
  const returnHref = buildGuardReturnHref(location);
  const sessionState = await restoreAuthSessionIfNeeded();
  const sessionFallback = resolveSessionFallback(sessionState, returnHref);

  if (sessionFallback) {
    return sessionFallback;
  }

  notifySessionRestored(options);

  return resolveAuthenticatedCurrentUser(returnHref);
}

async function requireCanonicalAppRoute(
  location: RouteGuardLocationLike,
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

  redirectToCanonicalRouteHref(location);
}

async function requireCanonicalOnboardingRoute(
  location: RouteGuardLocationLike,
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

async function requireEditableOnboardingRoute(
  location: RouteGuardLocationLike,
  expectedDestination: "/onboarding/personality" | "/onboarding/interests",
) {
  const currentUser = await requireAuthenticatedUser(location);

  if (!currentUser) {
    return;
  }

  const canonicalDestination = getPostAuthRedirectPath(currentUser);
  const redirectTarget = getEditableOnboardingRedirectTarget({
    canonicalDestination,
    expectedDestination,
    isEditMode: isOnboardingEditMode(location.searchStr),
  });

  if (redirectTarget) {
    throw redirect({ to: redirectTarget });
  }
}

export const routeGuardImplementations = {
  redirectAuthenticatedUser,
  requireCanonicalAppRoute,
  requireCanonicalOnboardingRoute,
  requireEditableOnboardingRoute,
} as const;
