import {
  buildAuthRouteNavigation,
  buildPostAuthRedirectNavigation,
} from "@/shared/lib/auth-route";
import { buildHomeNavigation } from "@/shared/navigation/home-navigation";
import type { User } from "@/shared/schemas";

function buildGuestLandingAction(
  route: "/auth/login" | "/auth/register",
  label: string,
  returnTo?: string | null,
) {
  return {
    navigation: buildAuthRouteNavigation(route, returnTo),
    label,
  } as const;
}

export function getPublicSitePrimaryAction(
  isAuthenticated: boolean,
  user: User | null | undefined,
  guestLabel: string,
  returnTo?: string | null,
) {
  if (!isAuthenticated) {
    return buildGuestLandingAction("/auth/register", guestLabel, returnTo);
  }

  if (user == null) {
    return {
      navigation: buildHomeNavigation(),
      label: "Open Findafew",
    };
  }

  const destination = buildPostAuthRedirectNavigation(user, null);
  const label =
    destination.to === "/home" ? "Open Findafew" : "Continue onboarding";

  return {
    navigation: destination,
    label,
  };
}

export function getPublicSiteSecondaryAction(
  isAuthenticated: boolean,
  guestLabel: string,
  returnTo?: string | null,
) {
  if (!isAuthenticated) {
    return buildGuestLandingAction("/auth/login", guestLabel, returnTo);
  }

  return {
    navigation: buildHomeNavigation(),
    label: "Go to app",
  };
}
