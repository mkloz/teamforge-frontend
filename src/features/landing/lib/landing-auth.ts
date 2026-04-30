import {
  buildAuthRouteNavigation,
  buildPostAuthRedirectNavigation,
} from "@/features/auth/lib/auth-return";
import { buildHomeNavigation } from "@/shared/lib/app-route";
import type { User } from "@/shared/schemas";

function buildGuestLandingAction(
  route: "/auth/login" | "/auth/register",
  label: string,
) {
  return {
    navigation: buildAuthRouteNavigation(route, null),
    label,
  } as const;
}

export function getLandingPrimaryAction(
  isAuthenticated: boolean,
  user: User | null | undefined,
  guestLabel: string,
) {
  if (!isAuthenticated) {
    return buildGuestLandingAction("/auth/register", guestLabel);
  }

  const destination = buildPostAuthRedirectNavigation(user, null);
  const label =
    destination.to === "/home" ? "Open TeamForge" : "Continue onboarding";

  return {
    navigation: destination,
    label,
  };
}

export function getLandingSecondaryAction(
  isAuthenticated: boolean,
  guestLabel: string,
) {
  if (!isAuthenticated) {
    return buildGuestLandingAction("/auth/login", guestLabel);
  }

  return {
    navigation: buildHomeNavigation(),
    label: "Go to app",
  };
}
