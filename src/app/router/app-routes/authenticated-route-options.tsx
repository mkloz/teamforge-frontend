import {
  ActivityRouteLoading,
  accountActionDetailPageModule,
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
  restrictionDetailPageModule,
  SafetyDetailRouteLoading,
  SafetyRouteLoading,
  SettingsRouteLoading,
  safetyPageModule,
  safetyReportDetailPageModule,
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
import { validateSafetySearch } from "@/shared/navigation/safety-navigation";
import { validateSettingsRouteSearch } from "@/shared/navigation/settings-navigation";

export const homeRouteOptions = {
  path: "/home" as const,
  validateSearch: validateHomeRouteSearch,
  loader: createRouteModuleLoader(homePageModule, HomeRouteLoading),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: HomeRouteLoading,
  component: createLazyPageRoute(
    homePageModule.Component,
    <HomeRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.home,
    title: "Home could not load",
    description: "Your groups, plans, and suggestions did not load.",
    fallbackTo: "/activity",
    fallbackLabel: "Open activity",
  }),
};

export const exploreRouteOptions = {
  path: "/explore" as const,
  validateSearch: validateExploreRouteSearch,
  loader: createExploreRouteLoader(explorePageModule, ExploreRouteLoading),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: ExploreRouteLoading,
  component: createLazyPageRoute(
    explorePageModule.Component,
    <ExploreRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.explore,
    title: "Explore could not load",
    description: "People, requests, and group options did not load.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
};

export const groupPlanDetailRouteOptions = {
  path: "/groups/$groupId" as const,
  validateSearch: validateGroupPlanDetailSearch,
  loader: createGroupPlanDetailRouteLoader(
    groupPlanDetailPageModule,
    GroupPlanDetailRouteLoading,
  ),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: GroupPlanDetailRouteLoading,
  component: createLazyPageRoute(
    groupPlanDetailPageModule.Component,
    <GroupPlanDetailRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.groupPlanDetail,
    title: "Group details could not load",
    description: "The group and plan details did not load.",
    fallbackTo: "/explore",
    fallbackLabel: "Back to explore",
  }),
};

export const activityRouteOptions = {
  path: "/activity" as const,
  validateSearch: validateActivityRouteSearch,
  loader: createActivityRouteLoader(activityPageModule, ActivityRouteLoading),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: ActivityRouteLoading,
  component: createLazyPageRoute(
    activityPageModule.Component,
    <ActivityRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.activity,
    title: "Activity could not load",
    description: "Your conversations and planning tools did not load.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
};

export const profileRouteOptions = {
  path: "/profile" as const,
  loader: createRouteModuleLoader(profilePageModule, ProfileRouteLoading),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: ProfileRouteLoading,
  component: createLazyPageRoute(
    profilePageModule.Component,
    <ProfileRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.profile,
    title: "Profile could not load",
    description:
      "Your personality details, interests, and trust history did not load.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
};

export const userDetailRouteOptions = {
  path: "/users/$userId" as const,
  validateSearch: validateUserDetailSearch,
  loader: createUserDetailRouteLoader(
    userDetailPageModule,
    ProfileRouteLoading,
  ),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: ProfileRouteLoading,
  component: createLazyPageRoute(
    userDetailPageModule.Component,
    <ProfileRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.userDetail,
    title: "This profile could not load",
    description:
      "The profile details, interests, and group information did not load.",
    fallbackTo: "/explore",
    fallbackLabel: "Back to explore",
  }),
};

export const settingsRouteOptions = {
  path: "/settings" as const,
  validateSearch: validateSettingsRouteSearch,
  loader: createRouteModuleLoader(settingsPageModule, SettingsRouteLoading),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: SettingsRouteLoading,
  component: createLazyPageRoute(
    settingsPageModule.Component,
    <SettingsRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.settings,
    title: "Settings could not load",
    description: "Your account settings did not load.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
};

export const safetyRouteOptions = {
  path: "/safety" as const,
  validateSearch: validateSafetySearch,
  loader: createRouteModuleLoader(safetyPageModule, SafetyRouteLoading),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: SafetyRouteLoading,
  component: createLazyPageRoute(
    safetyPageModule.Component,
    <SafetyRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.safety,
    title: "Safety Center could not load",
    description: "Your safety information did not load.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
};

export const safetyReportDetailRouteOptions = {
  path: "/safety/reports/$reportId" as const,
  loader: createRouteModuleLoader(
    safetyReportDetailPageModule,
    SafetyDetailRouteLoading,
  ),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: SafetyDetailRouteLoading,
  component: createLazyPageRoute(
    safetyReportDetailPageModule.Component,
    <SafetyDetailRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.safetyReport,
    title: "Report details could not load",
    description: "This report is unavailable right now.",
    fallbackTo: "/safety",
    fallbackLabel: "Back to Safety Center",
  }),
};

export const accountActionDetailRouteOptions = {
  path: "/safety/account-actions/$noticeId" as const,
  loader: createRouteModuleLoader(
    accountActionDetailPageModule,
    SafetyDetailRouteLoading,
  ),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: SafetyDetailRouteLoading,
  component: createLazyPageRoute(
    accountActionDetailPageModule.Component,
    <SafetyDetailRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.safetyAccountAction,
    title: "Account action could not load",
    description: "This notice is unavailable right now.",
    fallbackTo: "/safety",
    fallbackLabel: "Back to Safety Center",
  }),
};

export const restrictionDetailRouteOptions = {
  path: "/safety/restrictions/$containmentId" as const,
  loader: createRouteModuleLoader(
    restrictionDetailPageModule,
    SafetyDetailRouteLoading,
  ),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: SafetyDetailRouteLoading,
  component: createLazyPageRoute(
    restrictionDetailPageModule.Component,
    <SafetyDetailRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.safetyRestriction,
    title: "Safety restriction could not load",
    description: "This restriction is unavailable right now.",
    fallbackTo: "/safety",
    fallbackLabel: "Back to Safety Center",
  }),
};

export const forgeRouteOptions = {
  path: "/forge" as const,
  validateSearch: validateForgeRouteSearch,
  loader: createRouteModuleLoader(forgePageModule, ForgeRouteLoading),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: ForgeRouteLoading,
  component: createLazyPageRoute(
    forgePageModule.Component,
    <ForgeRouteLoading />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.forge,
    title: "Forge could not load",
    description: "The group setup did not load.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
};
