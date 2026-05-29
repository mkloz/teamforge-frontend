interface RouteLocationLike {
  pathname: string;
  searchStr: string;
}

interface RequireAuthenticatedUserOptions {
  onSessionRestored?: () => void | Promise<void>;
}

interface PublicAuthRouteLoadContext {
  location: {
    searchStr: string;
  };
}

export async function redirectAuthenticatedUser({
  location,
}: PublicAuthRouteLoadContext) {
  const routeGuards = await import("@/app/router/route-guards.impl");

  return routeGuards.redirectAuthenticatedUser({ location });
}

export async function requireCanonicalAppRoute(
  location: RouteLocationLike,
  options?: RequireAuthenticatedUserOptions,
) {
  const routeGuards = await import("@/app/router/route-guards.impl");

  return routeGuards.requireCanonicalAppRoute(location, options);
}

export async function requireCanonicalOnboardingRoute(
  location: RouteLocationLike,
  expectedDestination:
    | "/onboarding/profile"
    | "/onboarding/personality"
    | "/onboarding/interests",
) {
  const routeGuards = await import("@/app/router/route-guards.impl");

  return routeGuards.requireCanonicalOnboardingRoute(
    location,
    expectedDestination,
  );
}

export async function requireEditableOnboardingRoute(
  location: RouteLocationLike,
  expectedDestination: "/onboarding/personality" | "/onboarding/interests",
) {
  const routeGuards = await import("@/app/router/route-guards.impl");

  return routeGuards.requireEditableOnboardingRoute(
    location,
    expectedDestination,
  );
}
