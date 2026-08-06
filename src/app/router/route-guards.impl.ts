import { redirect } from "@tanstack/react-router";
import {
  buildGuardReturnHref,
  redirectToCanonicalRouteHref,
} from "@/app/router/route-guards/canonical-search";
import {
  getCapabilityDenialHref,
  writeCapabilityDenialNotice,
} from "@/app/router/route-guards/capability-denial";
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
import {
  isApiNetworkError,
  isProductStateApiUnsupported,
} from "@/shared/api/api-network-error";
import { authSession } from "@/shared/api/auth-session";
import { ensureOnboardingProductState } from "@/shared/api/onboarding-product-state-query";
import {
  buildPostAuthRedirectNavigationForDestination,
  parseAuthReturnSearch,
} from "@/shared/lib/auth-route";
import {
  getPostAuthRedirectPath,
  getProductStateRedirectPath,
} from "@/shared/lib/post-auth-route";
import type { ProductCapability } from "@/shared/schemas/onboarding-product-state";

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
  const canonicalDestination = await resolveCanonicalDestination(currentUser);

  throw redirect(
    buildPostAuthRedirectNavigationForDestination(
      canonicalDestination,
      returnTo,
    ),
  );
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

async function requireAuthenticatedAppRoute(
  location: RouteGuardLocationLike,
  options?: RequireAuthenticatedUserOptions,
) {
  return requireAuthenticatedUser(location, options);
}

async function requireCanonicalAppRoute(
  location: RouteGuardLocationLike,
  options?: RequireAuthenticatedUserOptions,
) {
  const currentUser = await requireAuthenticatedUser(location, options);

  if (!currentUser) {
    return;
  }

  const canonicalDestination = await resolveCanonicalDestination(currentUser);

  if (canonicalDestination !== "/home" && canonicalDestination !== "/explore") {
    throw redirect({ to: canonicalDestination });
  }

  redirectToCanonicalRouteHref(location);
}

async function requireProductCapabilityRoute(
  location: RouteGuardLocationLike,
  capability: ProductCapability | readonly ProductCapability[],
  options?: { preserveEstablishedObligations?: boolean },
) {
  const currentUser = await requireAuthenticatedUser(location);

  if (!currentUser) {
    return;
  }

  const productState = await ensureOnboardingProductState();
  const capabilities: readonly ProductCapability[] =
    typeof capability === "string" ? [capability] : capability;
  const allowed = capabilities.some(
    (candidate) => productState.capabilities[candidate].allowed,
  );
  const decision = productState.capabilities[capabilities[0]];

  if (
    allowed ||
    (options?.preserveEstablishedObligations === true &&
      productState.stage === "MATCHING_PAUSED")
  ) {
    return;
  }
  const reasonCode =
    "reasonCode" in decision ? decision.reasonCode : "FULL_ASSESSMENT_REQUIRED";

  writeCapabilityDenialNotice({
    capability: capabilities[0],
    reasonCode,
  });
  throw redirect({
    href: getCapabilityDenialHref({
      location,
      reasonCode,
      safeDestination: getProductStateRedirectPath({
        safeDefaultDestination: productState.recommendedAction.routeCode,
      }),
    }),
  });
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

  const canonicalDestination = await resolveCanonicalDestination(currentUser);

  if (
    expectedDestination === "/onboarding/profile" &&
    canonicalDestination === "/onboarding/intent"
  ) {
    return;
  }

  if (canonicalDestination !== expectedDestination) {
    throw redirect({ to: canonicalDestination });
  }
}

async function requireIntentOnboardingRoute(location: RouteGuardLocationLike) {
  const currentUser = await requireAuthenticatedUser(location);

  if (!currentUser) {
    return;
  }

  const canonicalDestination = await resolveCanonicalDestination(currentUser);

  if (canonicalDestination === "/onboarding/profile") {
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

  const canonicalDestination = await resolveCanonicalDestination(currentUser);
  const redirectTarget = getEditableOnboardingRedirectTarget({
    canonicalDestination,
    expectedDestination,
    isEditMode: isOnboardingEditMode(location.searchStr),
  });

  if (redirectTarget) {
    throw redirect({ to: redirectTarget });
  }
}

async function resolveCanonicalDestination(
  currentUser: Awaited<ReturnType<typeof requireAuthenticatedUser>>,
) {
  try {
    const productState = await ensureOnboardingProductState();
    return getProductStateRedirectPath(productState);
  } catch (error) {
    if (isApiNetworkError(error) || isProductStateApiUnsupported(error)) {
      return getPostAuthRedirectPath(currentUser);
    }

    throw error;
  }
}

export const routeGuardImplementations = {
  redirectAuthenticatedUser,
  requireAuthenticatedAppRoute,
  requireCanonicalAppRoute,
  requireCanonicalOnboardingRoute,
  requireIntentOnboardingRoute,
  requireEditableOnboardingRoute,
  requireProductCapabilityRoute,
} as const;
