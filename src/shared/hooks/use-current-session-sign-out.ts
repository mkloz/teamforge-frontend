import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { logoutCurrentSession } from "@/shared/api/auth-session-commands";
import {
  buildAuthRouteNavigation,
  buildRouteLocationHref,
  type RouteLocationLike,
} from "@/shared/lib/auth-route";

interface UseCurrentSessionSignOutOptions {
  currentLocation?: RouteLocationLike | null;
}

export function useCurrentSessionSignOut({
  currentLocation,
}: UseCurrentSessionSignOutOptions = {}) {
  const routerLocation = useRouterState({
    select: (state) => state.location,
  });
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    setSignOutError(false);
    const returnHref = buildRouteLocationHref(
      currentLocation ?? routerLocation,
    );

    try {
      await logoutCurrentSession();
    } catch {
      setSignOutError(true);
    }

    try {
      await navigate(buildAuthRouteNavigation("/auth/login", returnHref));
    } catch {
      setSignOutError(true);
    } finally {
      setIsSigningOut(false);
    }
  }

  return {
    isSigningOut,
    signOutError,
    signOut,
  };
}
