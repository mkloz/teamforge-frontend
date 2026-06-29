import { createRouter } from "@tanstack/react-router";

import { appShellRoute } from "@/app/router/app-routes";
import { onboardingRoutes } from "@/app/router/onboarding-routes";
import { publicRoutes } from "@/app/router/public-routes";
import { rootRoute } from "@/app/router/root-route";

const routeTree = rootRoute.addChildren([
  ...publicRoutes,
  ...onboardingRoutes,
  appShellRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingMs: 250,
  defaultPendingMinMs: 150,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
