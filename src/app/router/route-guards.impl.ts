import { redirect } from "@tanstack/react-router";

import { parseOnboardingFlowSearch } from "@/features/onboarding/lib/onboarding-flow-state";
import { refreshAuthSession } from "@/shared/api/api";
import { authSession } from "@/shared/api/auth-session";
import { ensureCurrentUser } from "@/shared/api/current-user-query";
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

async function restoreAuthSessionIfNeeded() {
  if (!authSession.hasTokens()) {
    await refreshAuthSession().catch(() => null);
  }

  return authSession.hasTokens();
}

function redirectToLogin(returnHref: string | null): never {
  throw redirect(buildAuthRouteNavigation("/auth/login", returnHref));
}

export async function redirectAuthenticatedUser({
  location,
}: PublicAuthRouteLoadContext) {
  const hasSession = await restoreAuthSessionIfNeeded();

  if (!hasSession) return;

  const currentUser = await ensureCurrentUser().catch(() => null);

  if (!currentUser) {
    return;
  }

  const { returnTo } = parseAuthReturnSearch(location.searchStr);

  throw redirect(buildPostAuthRedirectNavigation(currentUser, returnTo));
}

export async function requireAuthenticatedUser(location?: RouteLocationLike) {
  const returnHref = buildRouteLocationHref(location);
  const hasSession = await restoreAuthSessionIfNeeded();

  if (!hasSession) {
    return redirectToLogin(returnHref);
  }

  try {
    const currentUser = await ensureCurrentUser();

    if (!currentUser) {
      return redirectToLogin(returnHref);
    }

    return currentUser;
  } catch {
    return redirectToLogin(returnHref);
  }
}

export async function requireCanonicalAppRoute(location: RouteLocationLike) {
  const currentUser = await requireAuthenticatedUser(location);
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
  const { isEditMode } = parseOnboardingFlowSearch(location.searchStr);
  const canonicalDestination = getPostAuthRedirectPath(currentUser);

  if (isEditMode) {
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
