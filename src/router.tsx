import { createRouter } from "@tanstack/react-router";

import { appRoutes, appShellRoute } from "@/app/router/app-routes";
import { internalRoutes } from "@/app/router/internal-routes";
import { onboardingRoutes } from "@/app/router/onboarding-routes";
import { publicRoutes } from "@/app/router/public-routes";
import { rootRoute } from "@/app/router/root-route";

const routeTree = rootRoute.addChildren([
  ...publicRoutes,
  ...onboardingRoutes,
  ...internalRoutes,
  appShellRoute.addChildren(appRoutes),
]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
