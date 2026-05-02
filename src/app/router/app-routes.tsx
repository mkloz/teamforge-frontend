import { createRoute } from "@tanstack/react-router";
import { lazy } from "react";

import { AppShellWithNotifications } from "@/app/router/app-shell-with-notifications";
import { LazyPage } from "@/app/router/lazy-page";
import { rootRoute } from "@/app/router/root-route";
import { requireCanonicalAppRoute } from "@/app/router/route-guards";
import { RouteErrorState } from "@/shared/components/route-error-state";
import { routeErrorScopes } from "@/shared/lib/telemetry-contract";

const HomePage = lazy(() =>
  import("@/features/home/home-page").then((m) => ({ default: m.HomePage })),
);

const ExplorePage = lazy(() =>
  import("@/features/explore/explore-page").then((m) => ({
    default: m.ExplorePage,
  })),
);

const ActivityPage = lazy(() =>
  import("@/features/activity/activity-page").then((m) => ({
    default: m.ActivityPage,
  })),
);

const ProfilePage = lazy(() =>
  import("@/features/profile/profile-page").then((m) => ({
    default: m.ProfilePage,
  })),
);

const SettingsPage = lazy(() =>
  import("@/features/settings/settings-page").then((m) => ({
    default: m.SettingsPage,
  })),
);

const ForgePage = lazy(() =>
  import("@/features/forge/forge-page").then((m) => ({
    default: m.ForgePage,
  })),
);

export const appShellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app-shell",
  beforeLoad: ({ location }) => requireCanonicalAppRoute(location),
  component: AppShellWithNotifications,
});

const homeRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/home",
  component: () => <LazyPage component={HomePage} />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.home}
      title="Home could not finish loading"
      description="Your dashboard hit an unexpected issue while refreshing groups, plans, or recommendations."
      fallbackTo="/activity"
      fallbackLabel="Open activity"
      onRetry={reset}
    />
  ),
});

const exploreRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/explore",
  component: () => <LazyPage component={ExplorePage} />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.explore}
      title="Explore could not finish loading"
      description="Group discovery ran into an unexpected issue while loading people, requests, or group options."
      fallbackTo="/home"
      fallbackLabel="Back to home"
      onRetry={reset}
    />
  ),
});

const activityRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/activity",
  component: () => <LazyPage component={ActivityPage} />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.activity}
      title="The activity workspace hit a snag"
      description="Your conversations and planning space couldn't finish rendering cleanly."
      fallbackTo="/home"
      fallbackLabel="Back to home"
      onRetry={reset}
    />
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/profile",
  component: () => <LazyPage component={ProfilePage} />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.profile}
      title="Profile could not finish loading"
      description="Your profile hit an unexpected issue while loading personality details, interests, or trust history."
      fallbackTo="/home"
      fallbackLabel="Back to home"
      onRetry={reset}
    />
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/settings",
  component: () => <LazyPage component={SettingsPage} />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.settings}
      title="Settings could not finish loading"
      description="Your account settings hit an unexpected issue before the page could render cleanly."
      fallbackTo="/home"
      fallbackLabel="Back to home"
      onRetry={reset}
    />
  ),
});

const forgeRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/forge",
  component: () => <LazyPage component={ForgePage} />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.forge}
      title="Forge hit an unexpected issue"
      description="We couldn't finish loading the group-forging flow right now."
      fallbackTo="/home"
      fallbackLabel="Back to home"
      onRetry={reset}
    />
  ),
});

export const appRoutes = [
  homeRoute,
  exploreRoute,
  activityRoute,
  profileRoute,
  settingsRoute,
  forgeRoute,
];
