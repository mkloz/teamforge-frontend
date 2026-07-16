import { createRoute } from "@tanstack/react-router";
import {
  accountActionDetailRouteOptions,
  activityRouteOptions,
  exploreRouteOptions,
  forgeRouteOptions,
  groupPlanDetailRouteOptions,
  homeRouteOptions,
  profileRouteOptions,
  restrictionDetailRouteOptions,
  safetyReportDetailRouteOptions,
  safetyRouteOptions,
  settingsRouteOptions,
  userDetailRouteOptions,
} from "@/app/router/app-routes/authenticated-route-options";
import {
  createSessionRestoredRoutePreload,
  preloadMatchedAppRouteModule,
} from "@/app/router/app-routes/route-preloading";
import {
  AppShellRouteComponent,
  AppShellRouteLoading,
} from "@/app/router/app-shell-route-components";
import { loadAppShellWithNotifications } from "@/app/router/app-shell-route-loaders";
import { rootRoute } from "@/app/router/root-route";
import { requireCanonicalAppRoute } from "@/app/router/route-guards";

const appShellBaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app-shell",
  beforeLoad: ({ location }) => {
    void loadAppShellWithNotifications().catch(() => null);
    preloadMatchedAppRouteModule(location.pathname);

    return requireCanonicalAppRoute(location, {
      onSessionRestored: createSessionRestoredRoutePreload(location.pathname),
    });
  },
  pendingComponent: AppShellRouteLoading,
  component: AppShellRouteComponent,
});

const homeRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...homeRouteOptions,
});

const exploreRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...exploreRouteOptions,
});

const groupPlanDetailRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...groupPlanDetailRouteOptions,
});

const activityRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...activityRouteOptions,
});

const profileRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...profileRouteOptions,
});

const userDetailRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...userDetailRouteOptions,
});

const settingsRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...settingsRouteOptions,
});

const safetyRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...safetyRouteOptions,
});

const safetyReportDetailRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...safetyReportDetailRouteOptions,
});

const accountActionDetailRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...accountActionDetailRouteOptions,
});

const restrictionDetailRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...restrictionDetailRouteOptions,
});

const forgeRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...forgeRouteOptions,
});

const appRoutes = [
  homeRoute,
  exploreRoute,
  groupPlanDetailRoute,
  activityRoute,
  profileRoute,
  userDetailRoute,
  settingsRoute,
  safetyRoute,
  safetyReportDetailRoute,
  accountActionDetailRoute,
  restrictionDetailRoute,
  forgeRoute,
];

export const appShellRoute = appShellBaseRoute.addChildren(appRoutes);
