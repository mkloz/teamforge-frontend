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

  async function signOut() {
    setIsSigningOut(true);
    const returnHref = buildRouteLocationHref(
      currentLocation ?? routerLocation,
    );

    try {
      await logoutCurrentSession();
      await navigate(buildAuthRouteNavigation("/auth/login", returnHref));
    } finally {
      setIsSigningOut(false);
    }
  }

  return {
    isSigningOut,
    signOut,
  };
}
