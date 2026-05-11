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
      if (shouldIgnoreUnauthorizedRedirect()) {
        return;
      }

      const currentHref = buildRouteLocationHref(router.state.location);

      void router.navigate(
        buildAuthRouteNavigation("/auth/login", currentHref),
      );
    });
  }, []);

  return null;
}

function shouldIgnoreUnauthorizedRedirect() {
  const pathname = router.state.location.pathname;
  const isBoneyardBuild =
    (globalThis as typeof globalThis & { __BONEYARD_BUILD?: boolean })
      .__BONEYARD_BUILD === true;

  return pathname.startsWith("/design-system/boneyard") || isBoneyardBuild;
}
