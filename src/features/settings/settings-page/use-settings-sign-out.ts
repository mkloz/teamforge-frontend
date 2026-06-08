import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { logoutCurrentSession } from "@/shared/api/auth-session-commands";
import {
  buildAuthRouteNavigation,
  buildRouteLocationHref,
} from "@/shared/lib/auth-route";

interface UseSettingsSignOutOptions {
  currentLocation: Parameters<typeof buildRouteLocationHref>[0];
}

export function useSettingsSignOut({
  currentLocation,
}: UseSettingsSignOutOptions) {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    const returnHref = buildRouteLocationHref(currentLocation);

    try {
      await logoutCurrentSession();
      await navigate(buildAuthRouteNavigation("/auth/login", returnHref));
      setIsSigningOut(false);
    } catch (error) {
      setIsSigningOut(false);
      throw error;
    }
  }

  return {
    isSigningOut,
    signOut,
  };
}
