import type {
  PublicAuthRouteLoadContext,
  RequireAuthenticatedUserOptions,
  RouteGuardLocationLike,
} from "@/app/router/route-guards/types";

export async function redirectAuthenticatedUser({
  location,
}: PublicAuthRouteLoadContext) {
  const { routeGuardImplementations } = await import(
    "@/app/router/route-guards.impl"
  );

  return routeGuardImplementations.redirectAuthenticatedUser({ location });
}

export async function requireCanonicalAppRoute(
  location: RouteGuardLocationLike,
  options?: RequireAuthenticatedUserOptions,
) {
  const { routeGuardImplementations } = await import(
    "@/app/router/route-guards.impl"
  );

  return routeGuardImplementations.requireCanonicalAppRoute(location, options);
}

export async function requireCanonicalOnboardingRoute(
  location: RouteGuardLocationLike,
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
  location: RouteGuardLocationLike,
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
