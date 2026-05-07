import { createRoute } from "@tanstack/react-router";

import { AppShellWithNotifications } from "@/app/router/app-shell-with-notifications";
import { createLazyPageRoute } from "@/app/router/lazy-page-route";
import { createLazyRouteModule } from "@/app/router/lazy-route-module";
import { rootRoute } from "@/app/router/root-route";
import { createRouteErrorComponent } from "@/app/router/route-error-component";
import { requireCanonicalAppRoute } from "@/app/router/route-guards";
import { routeErrorScopes } from "@/shared/lib/telemetry-contract";

const homePageModule = createLazyRouteModule(() =>
  import("@/features/home/home-page").then((m) => ({ default: m.HomePage })),
);

const explorePageModule = createLazyRouteModule(() =>
  import("@/features/explore/explore-page").then((m) => ({
    default: m.ExplorePage,
  })),
);

const activityPageModule = createLazyRouteModule(() =>
  import("@/features/activity/activity-page").then((m) => ({
    default: m.ActivityPage,
  })),
);

const profilePageModule = createLazyRouteModule(() =>
  import("@/features/profile/profile-page").then((m) => ({
    default: m.ProfilePage,
  })),
);

const settingsPageModule = createLazyRouteModule(() =>
  import("@/features/settings/settings-page").then((m) => ({
    default: m.SettingsPage,
  })),
);

const forgePageModule = createLazyRouteModule(() =>
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
  component: createLazyPageRoute(homePageModule.Component),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.home,
    title: "Home could not finish loading",
    description:
      "Your dashboard hit an unexpected issue while refreshing groups, plans, or recommendations.",
    fallbackTo: "/activity",
    fallbackLabel: "Open activity",
  }),
});

const exploreRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/explore",
  component: createLazyPageRoute(explorePageModule.Component),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.explore,
    title: "Explore could not finish loading",
    description:
      "Group discovery ran into an unexpected issue while loading people, requests, or group options.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
});

const activityRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/activity",
  component: createLazyPageRoute(activityPageModule.Component),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.activity,
    title: "The activity workspace hit a snag",
    description:
      "Your conversations and planning space couldn't finish rendering cleanly.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
});

const profileRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/profile",
  component: createLazyPageRoute(profilePageModule.Component),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.profile,
    title: "Profile could not finish loading",
    description:
      "Your profile hit an unexpected issue while loading personality details, interests, or trust history.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
});

const settingsRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/settings",
  component: createLazyPageRoute(settingsPageModule.Component),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.settings,
    title: "Settings could not finish loading",
    description:
      "Your account settings hit an unexpected issue before the page could render cleanly.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
});

const forgeRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/forge",
  component: createLazyPageRoute(forgePageModule.Component),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.forge,
    title: "Forge hit an unexpected issue",
    description: "We couldn't finish loading the group-forging flow right now.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
});

export const appRoutes = [
  homeRoute,
  exploreRoute,
  activityRoute,
  profileRoute,
  settingsRoute,
  forgeRoute,
];

export const appRouteModules = [
  homePageModule,
  explorePageModule,
  activityPageModule,
  profilePageModule,
  settingsPageModule,
  forgePageModule,
];
