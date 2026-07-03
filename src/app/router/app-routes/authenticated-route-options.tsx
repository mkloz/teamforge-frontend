import {
  ActivityRouteLoading,
  activityPageModule,
  ExploreRouteLoading,
  explorePageModule,
  ForgeRouteLoading,
  forgePageModule,
  GroupPlanDetailRouteLoading,
  groupPlanDetailPageModule,
  HomeRouteLoading,
  homePageModule,
  ProfileRouteLoading,
  profilePageModule,
  SettingsRouteLoading,
  settingsPageModule,
  userDetailPageModule,
} from "@/app/router/app-routes/route-modules";
import {
  createActivityRouteLoader,
  createExploreRouteLoader,
  createGroupPlanDetailRouteLoader,
  createRouteModuleLoader,
  createUserDetailRouteLoader,
} from "@/app/router/app-routes/route-preloading";
import { createLazyPageRoute } from "@/app/router/lazy-page-route";
import { createRouteErrorComponent } from "@/app/router/route-error-component";
import {
  validateGroupPlanDetailSearch,
  validateUserDetailSearch,
} from "@/app/router/route-search-validators";
import { routeErrorScopes } from "@/shared/lib/telemetry-contract";
import { validateExploreRouteSearch } from "@/shared/navigation";
import { validateActivityRouteSearch } from "@/shared/navigation/activity-navigation";
import { validateForgeRouteSearch } from "@/shared/navigation/forge-navigation";
import { validateHomeRouteSearch } from "@/shared/navigation/home-navigation";
import { validateSettingsRouteSearch } from "@/shared/navigation/settings-navigation";

export const homeRouteOptions = {
  path: "/home" as const,
  validateSearch: validateHomeRouteSearch,
  loader: createRouteModuleLoader(homePageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: HomeRouteLoading,
  component: createLazyPageRoute(
    homePageModule.Component,
    <HomeRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.home,
    title: "Home could not finish loading",
    description:
      "Your dashboard hit an unexpected issue while refreshing groups, plans, or recommendations.",
    fallbackTo: "/activity",
    fallbackLabel: "Open activity",
  }),
};

export const exploreRouteOptions = {
  path: "/explore" as const,
  validateSearch: validateExploreRouteSearch,
  loader: createExploreRouteLoader(explorePageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: ExploreRouteLoading,
  component: createLazyPageRoute(
    explorePageModule.Component,
    <ExploreRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.explore,
    title: "Explore could not finish loading",
    description:
      "Group discovery ran into an unexpected issue while loading people, requests, or group options.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
};

export const groupPlanDetailRouteOptions = {
  path: "/groups/$groupId" as const,
  validateSearch: validateGroupPlanDetailSearch,
  loader: createGroupPlanDetailRouteLoader(groupPlanDetailPageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: GroupPlanDetailRouteLoading,
  component: createLazyPageRoute(
    groupPlanDetailPageModule.Component,
    <GroupPlanDetailRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.groupPlanDetail,
    title: "Group details could not finish loading",
    description:
      "The group and plan briefing hit an unexpected issue before it could render cleanly.",
    fallbackTo: "/explore",
    fallbackLabel: "Back to explore",
  }),
};

export const activityRouteOptions = {
  path: "/activity" as const,
  validateSearch: validateActivityRouteSearch,
  loader: createActivityRouteLoader(activityPageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: ActivityRouteLoading,
  component: createLazyPageRoute(
    activityPageModule.Component,
    <ActivityRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.activity,
    title: "The activity workspace hit a snag",
    description:
      "Your conversations and planning space couldn't finish rendering cleanly.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
};

export const profileRouteOptions = {
  path: "/profile" as const,
  loader: createRouteModuleLoader(profilePageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: ProfileRouteLoading,
  component: createLazyPageRoute(
    profilePageModule.Component,
    <ProfileRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.profile,
    title: "Profile could not finish loading",
    description:
      "Your profile hit an unexpected issue while loading personality details, interests, or trust history.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
};

export const userDetailRouteOptions = {
  path: "/users/$userId" as const,
  validateSearch: validateUserDetailSearch,
  loader: createUserDetailRouteLoader(userDetailPageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: ProfileRouteLoading,
  component: createLazyPageRoute(
    userDetailPageModule.Component,
    <ProfileRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.userDetail,
    title: "Profile could not finish loading",
    description:
      "This public profile hit an unexpected issue while loading details, interests, or social fit.",
    fallbackTo: "/explore",
    fallbackLabel: "Back to explore",
  }),
};

export const settingsRouteOptions = {
  path: "/settings" as const,
  validateSearch: validateSettingsRouteSearch,
  loader: createRouteModuleLoader(settingsPageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: SettingsRouteLoading,
  component: createLazyPageRoute(
    settingsPageModule.Component,
    <SettingsRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.settings,
    title: "Settings could not finish loading",
    description:
      "Your account settings hit an unexpected issue before the page could render cleanly.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
};

export const forgeRouteOptions = {
  path: "/forge" as const,
  validateSearch: validateForgeRouteSearch,
  loader: createRouteModuleLoader(forgePageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: ForgeRouteLoading,
  component: createLazyPageRoute(
    forgePageModule.Component,
    <ForgeRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.forge,
    title: "Forge hit an unexpected issue",
    description: "We couldn't finish loading the group-forging flow right now.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
};
