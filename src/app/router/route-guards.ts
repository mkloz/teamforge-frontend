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
  const { routeGuardImplementations } = await import(
    "@/app/router/route-guards.impl"
  );

  return routeGuardImplementations.redirectAuthenticatedUser({ location });
}

export async function requireCanonicalAppRoute(
  location: RouteLocationLike,
  options?: RequireAuthenticatedUserOptions,
) {
  const { routeGuardImplementations } = await import(
    "@/app/router/route-guards.impl"
  );

  return routeGuardImplementations.requireCanonicalAppRoute(location, options);
}

export async function requireCanonicalOnboardingRoute(
  location: RouteLocationLike,
  expectedDestination:
    | "/onboarding/profile"
    | "/onboarding/personality"
    | "/onboarding/interests",
) {
  const { routeGuardImplementations } = await import(
    "@/app/router/route-guards.impl"
  );

  return routeGuardImplementations.requireCanonicalOnboardingRoute(
    location,
    expectedDestination,
  );
}

export async function requireEditableOnboardingRoute(
  location: RouteLocationLike,
  expectedDestination: "/onboarding/personality" | "/onboarding/interests",
) {
  const { routeGuardImplementations } = await import(
    "@/app/router/route-guards.impl"
  );

  return routeGuardImplementations.requireEditableOnboardingRoute(
    location,
    expectedDestination,
  );
}
