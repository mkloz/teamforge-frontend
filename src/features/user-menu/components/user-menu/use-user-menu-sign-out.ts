import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";

import { logoutCurrentSession } from "@/shared/api/auth-session-commands";
import {
  buildAuthRouteNavigation,
  buildRouteLocationHref,
} from "@/shared/lib/auth-route";

export function useUserMenuSignOut() {
  const currentLocation = useRouterState({
    select: (state) => state.location,
  });
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = async () => {
    setIsSigningOut(true);
    const returnHref = buildRouteLocationHref(currentLocation);

    try {
      await logoutCurrentSession();
      await navigate(buildAuthRouteNavigation("/auth/login", returnHref));
    } finally {
      setIsSigningOut(false);
    }
  };

  return {
    isSigningOut,
    signOut,
  };
}
