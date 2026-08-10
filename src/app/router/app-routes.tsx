import { createRoute } from "@tanstack/react-router";
import {
  accountActionDetailRouteOptions,
  activityRouteOptions,
  exploreRouteOptions,
  groupPlanDetailRouteOptions,
  groupProposalRouteOptions,
  homeRouteOptions,
  onboardingPracticeRouteOptions,
  planCreationRouteOptions,
  planGuestRouteOptions,
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
import {
  requireAuthenticatedAppRoute,
  requireCanonicalAppRoute,
  requireProductCapabilityRoute,
} from "@/app/router/route-guards";

const appShellBaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app-shell",
  beforeLoad: async ({ location, preload }) => {
    await requireAuthenticatedAppRoute(location, {
      onSessionRestored: createSessionRestoredRoutePreload(location.pathname),
    });

    void loadAppShellWithNotifications().catch(() => null);
    preloadMatchedAppRouteModule(location.pathname, preload);
  },
  pendingComponent: AppShellRouteLoading,
  component: AppShellRouteComponent,
});

const homeRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...homeRouteOptions,
  beforeLoad: ({ location }) => requireCanonicalAppRoute(location),
});

const exploreRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...exploreRouteOptions,
  beforeLoad: ({ location }) => requireCanonicalAppRoute(location),
});

const onboardingPracticeRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...onboardingPracticeRouteOptions,
  beforeLoad: ({ location }) =>
    requireProductCapabilityRoute(location, "USE_ONBOARDING_PRACTICE"),
});

const groupPlanDetailRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...groupPlanDetailRouteOptions,
});

const planGuestRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...planGuestRouteOptions,
  beforeLoad: ({ location }) =>
    requireProductCapabilityRoute(location, "VIEW_PUBLIC_GROUP_PLAN", {
      preserveEstablishedObligations: true,
    }),
});

const activityRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...activityRouteOptions,
  beforeLoad: ({ location }) =>
    requireProductCapabilityRoute(location, "VIEW_PUBLIC_GROUP_PLAN", {
      preserveEstablishedObligations: true,
    }),
});

const profileRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...profileRouteOptions,
});

const userDetailRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...userDetailRouteOptions,
  beforeLoad: ({ location }) =>
    requireProductCapabilityRoute(location, "VIEW_PUBLIC_PROFILE", {
      preserveEstablishedObligations: true,
    }),
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

const planCreationRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...planCreationRouteOptions,
  beforeLoad: ({ location }) =>
    requireProductCapabilityRoute(location, [
      "START_GROUP_FORMATION",
      "START_INTRODUCTORY_GROUP_FORMATION",
    ]),
});

const groupProposalRoute = createRoute({
  getParentRoute: () => appShellBaseRoute,
  ...groupProposalRouteOptions,
  beforeLoad: ({ location }) =>
    requireProductCapabilityRoute(location, "START_GROUP_FORMATION", {
      preserveEstablishedObligations: true,
    }),
});

const appRoutes = [
  homeRoute,
  exploreRoute,
  onboardingPracticeRoute,
  groupPlanDetailRoute,
  planGuestRoute,
  activityRoute,
  profileRoute,
  userDetailRoute,
  settingsRoute,
  safetyRoute,
  safetyReportDetailRoute,
  accountActionDetailRoute,
  restrictionDetailRoute,
  planCreationRoute,
  groupProposalRoute,
];

export const appShellRoute = appShellBaseRoute.addChildren(appRoutes);
