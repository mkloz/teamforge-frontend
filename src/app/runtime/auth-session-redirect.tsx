import { useEffect } from "react";

import { router } from "@/router";
import { authSession } from "@/shared/api/auth-session";
import { clearCurrentUserCache } from "@/shared/api/current-user-query";
import {
  buildAuthRouteNavigation,
  buildRouteLocationHref,
} from "@/shared/lib/auth-route";

export function AuthSessionRedirect() {
  useEffect(() => {
    return authSession.setUnauthorizedHandler(() => {
      clearCurrentUserCache();
      const currentHref = buildRouteLocationHref(router.state.location);

      void router.navigate(
        buildAuthRouteNavigation("/auth/login", currentHref),
      );
    });
  }, []);

  return null;
}
