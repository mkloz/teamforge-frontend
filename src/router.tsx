import { createRouter } from "@tanstack/react-router";

import {
  appRouteModules,
  appRoutes,
  appShellRoute,
} from "@/app/router/app-routes";
import {
  onboardingRouteModules,
  onboardingRoutes,
} from "@/app/router/onboarding-routes";
import { publicRouteModules, publicRoutes } from "@/app/router/public-routes";
import { rootRoute } from "@/app/router/root-route";

const routeTree = rootRoute.addChildren([
  ...publicRoutes,
  ...onboardingRoutes,
  appShellRoute.addChildren(appRoutes),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingMs: 250,
  defaultPendingMinMs: 150,
  scrollRestoration: true,
});

export const lazyRouteModules = [
  ...publicRouteModules,
  ...onboardingRouteModules,
  ...appRouteModules,
];

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
