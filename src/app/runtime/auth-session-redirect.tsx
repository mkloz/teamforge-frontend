import { useEffect } from "react";

import { router } from "@/router";
import { clearAccountSessionCache } from "@/shared/api/account-session-cache";
import { installAccountSessionStoragePurgeListener } from "@/shared/api/account-session-storage";
import { authSession } from "@/shared/api/auth-session";
import {
  buildAuthRouteNavigation,
  buildRouteLocationHref,
} from "@/shared/lib/auth-route";

export function AuthSessionRedirect() {
  useEffect(() => {
    const removePurgeListener = installAccountSessionStoragePurgeListener();
    const removeUnauthorizedHandler = authSession.setUnauthorizedHandler(() => {
      clearAccountSessionCache();
      const currentHref = buildRouteLocationHref(router.state.location);

      void router.navigate(
        buildAuthRouteNavigation("/auth/login", currentHref),
      );
    });

    return () => {
      removePurgeListener();
      removeUnauthorizedHandler();
    };
  }, []);

  return null;
}
