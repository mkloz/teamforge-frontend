import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";
import { useEffect } from "react";

import { AuthQueries } from "@/features/auth/api/auth.queries";
import { router } from "@/router";
import { authSession } from "@/shared/api/auth-session";
import { appQueryClient } from "@/shared/api/query-client";
import { useInitializeTheme } from "@/shared/store/theme.store";

export function AppProviders() {
  useInitializeTheme();

  useEffect(() => {
    return authSession.setUnauthorizedHandler(() => {
      AuthQueries.clearCurrentUserCache();
      void router.navigate({ to: "/auth/login" });
    });
  }, []);

  return (
    <QueryClientProvider client={appQueryClient}>
      <RouterProvider router={router} />
      <Analytics />
    </QueryClientProvider>
  );
}
