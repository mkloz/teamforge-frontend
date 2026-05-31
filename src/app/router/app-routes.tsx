import { createRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { createLazyPageRoute } from "@/app/router/lazy-page-route";
import {
  createLazyRouteModule,
  type LazyRouteModule,
} from "@/app/router/lazy-route-module";
import { rootRoute } from "@/app/router/root-route";
import { createRouteErrorComponent } from "@/app/router/route-error-component";
import { requireCanonicalAppRoute } from "@/app/router/route-guards";
import { ActivityPageLoading } from "@/features/activity/activity-page.loading";
import { ExplorePageLoading } from "@/features/explore/explore-page.loading";
import { ForgePageLoading } from "@/features/forge/forge-page.loading";
import { GroupPlanDetailPageLoading } from "@/features/group-plan-detail/group-plan-detail-page.loading";
import {
  type GroupPlanDetailRouteSearch,
  type GroupPlanDetailSource,
  groupPlanDetailSourceValues,
} from "@/features/group-plan-detail/lib/group-plan-detail-route";
import { HomePageLoading } from "@/features/home/home-page.loading";
import { ProfilePageLoading } from "@/features/profile/profile-page/profile-page.loading";
import { SettingsPageLoading } from "@/features/settings/settings-page/settings-page.loading";
import { appQueryClient } from "@/shared/api/query-client";
import { getSizedImageUrl } from "@/shared/lib/sized-image-url";
import { routeErrorScopes } from "@/shared/lib/telemetry-contract";

function loadAppShellWithNotifications() {
  return import("@/app/router/app-shell-with-notifications").then((module) => ({
    default: module.AppShellWithNotifications,
  }));
}

const AppShellWithNotifications = lazy(loadAppShellWithNotifications);

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

const userDetailPageModule = createLazyRouteModule(() =>
  import("@/features/profile/user-detail-page").then((m) => ({
    default: m.UserDetailPage,
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

const groupPlanDetailPageModule = createLazyRouteModule(() =>
  import("@/features/group-plan-detail/group-plan-detail-page").then((m) => ({
    default: m.GroupPlanDetailPage,
  })),
);

function parseOptionalSearchString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function isGroupPlanDetailSource(
  value: unknown,
): value is GroupPlanDetailSource {
  return (
    typeof value === "string" &&
    groupPlanDetailSourceValues.some((source) => source === value)
  );
}

function validateGroupPlanDetailSearch(
  search: Record<string, unknown>,
): GroupPlanDetailRouteSearch {
  return {
    plan: parseOptionalSearchString(search.plan),
    proposal: parseOptionalSearchString(search.proposal),
    returnTo: parseOptionalSearchString(search.returnTo),
    source: isGroupPlanDetailSource(search.source) ? search.source : undefined,
  };
}

function createRouteModuleLoader(module: LazyRouteModule) {
  return async () => {
    await module.preload();
  };
}

async function preloadDefaultExploreGroups() {
  const [{ ExploreQueryFactory }, { DEFAULT_FILTERS }] = await Promise.all([
    import("@/features/explore/api/explore-query-factory"),
    import("@/features/explore/constants/explore.constants"),
  ]);

  const data = await appQueryClient.fetchInfiniteQuery(
    ExploreQueryFactory.groups(DEFAULT_FILTERS, ""),
  );
  const firstGroupAvatar = data.pages[0]?.groups[0]?.avatar;

  preloadRouteImage(
    getSizedImageUrl(firstGroupAvatar, 480) ?? firstGroupAvatar,
  );
}

async function preloadActivityFeed() {
  const { ActivityQueryFactory } = await import(
    "@/features/activity/api/activity-query-factory"
  );

  await Promise.allSettled([
    appQueryClient.prefetchQuery(ActivityQueryFactory.groups()),
    appQueryClient.prefetchQuery(ActivityQueryFactory.chats()),
    appQueryClient.prefetchQuery(ActivityQueryFactory.friendships()),
  ]);
}

function createExploreRouteLoader(module: LazyRouteModule) {
  return async () => {
    const exploreGroupsTask = preloadDefaultExploreGroups().catch(() => null);

    await Promise.all([module.preload(), exploreGroupsTask]);
  };
}

function createActivityRouteLoader(module: LazyRouteModule) {
  return async () => {
    const feedTask = preloadActivityFeed().catch(() => null);

    await Promise.all([module.preload(), feedTask]);
  };
}

async function preloadGroupPlanDetail(groupId: string) {
  const { GroupPlanDetailQueryFactory } = await import(
    "@/features/group-plan-detail/api/group-plan-detail-query-factory"
  );

  const detail = await appQueryClient.fetchQuery(
    GroupPlanDetailQueryFactory.detail(groupId),
  );
  const coverSrc =
    detail.plan?.coverImage ??
    detail.group.avatar ??
    detail.members.find((member) => member.avatar)?.avatar ??
    null;

  preloadRouteImage(getSizedImageUrl(coverSrc, 800) ?? coverSrc);
}

async function preloadUserDetail(userId: string) {
  const { publicProfileQueryOptions } = await import(
    "@/features/profile/api/profile-query-options"
  );

  const profile = await appQueryClient.fetchQuery(
    publicProfileQueryOptions(userId),
  );

  preloadRouteImage(getSizedImageUrl(profile.avatar, 128) ?? profile.avatar);
}

function preloadRouteImage(src: string | null | undefined) {
  if (!src || typeof globalThis.Image !== "function") {
    return;
  }

  const image = new globalThis.Image();
  image.decoding = "async";
  image.fetchPriority = "high";
  image.src = src;
}

function createGroupPlanDetailRouteLoader(module: LazyRouteModule) {
  return async ({ params }: { params: { groupId: string } }) => {
    const detailTask = preloadGroupPlanDetail(params.groupId).catch(() => null);

    await Promise.all([module.preload(), detailTask]);
  };
}

function createUserDetailRouteLoader(module: LazyRouteModule) {
  return async ({ params }: { params: { userId: string } }) => {
    const userTask = preloadUserDetail(params.userId).catch(() => null);

    await Promise.all([module.preload(), userTask]);
  };
}

function getGroupPlanIdFromPathname(pathname: string) {
  const match = /^\/groups\/([^/?#]+)/.exec(pathname);
  const groupId = match?.[1];

  return groupId ? decodeURIComponent(groupId) : null;
}

function getUserIdFromPathname(pathname: string) {
  const match = /^\/users\/([^/?#]+)/.exec(pathname);
  const userId = match?.[1];

  return userId ? decodeURIComponent(userId) : null;
}

function createSessionRestoredRoutePreload(pathname: string) {
  if (pathname === "/explore") {
    return () => preloadDefaultExploreGroups();
  }

  if (pathname === "/activity" || pathname.startsWith("/activity/")) {
    return () => preloadActivityFeed();
  }

  const groupId = getGroupPlanIdFromPathname(pathname);

  if (groupId) {
    return () => preloadGroupPlanDetail(groupId);
  }

  const userId = getUserIdFromPathname(pathname);

  if (userId) {
    return () => preloadUserDetail(userId);
  }

  return undefined;
}

function preloadMatchedAppRouteModule(pathname: string) {
  if (pathname === "/home") {
    void homePageModule.preload().catch(() => null);
    return;
  }

  if (pathname === "/explore") {
    void explorePageModule.preload().catch(() => null);
    return;
  }

  if (pathname === "/activity" || pathname.startsWith("/activity/")) {
    void activityPageModule.preload().catch(() => null);
    return;
  }

  if (pathname === "/profile") {
    void profilePageModule.preload().catch(() => null);
    return;
  }

  if (pathname.startsWith("/users/")) {
    void userDetailPageModule.preload().catch(() => null);
    return;
  }

  if (pathname === "/settings" || pathname.startsWith("/settings/")) {
    void settingsPageModule.preload().catch(() => null);
    return;
  }

  if (pathname === "/forge") {
    void forgePageModule.preload().catch(() => null);
    return;
  }

  if (pathname.startsWith("/groups/")) {
    void groupPlanDetailPageModule.preload().catch(() => null);
  }
}

function AppShellRouteComponent() {
  return (
    <Suspense fallback={null}>
      <AppShellWithNotifications />
    </Suspense>
  );
}

export const appShellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app-shell",
  beforeLoad: ({ location }) => {
    void loadAppShellWithNotifications().catch(() => null);
    preloadMatchedAppRouteModule(location.pathname);

    return requireCanonicalAppRoute(location, {
      onSessionRestored: createSessionRestoredRoutePreload(location.pathname),
    });
  },
  component: AppShellRouteComponent,
});

const homeRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/home",
  loader: createRouteModuleLoader(homePageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: () => <HomePageLoading mode="route" />,
  component: createLazyPageRoute(
    homePageModule.Component,
    <HomePageLoading mode="route" />,
  ),
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
  loader: createExploreRouteLoader(explorePageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: () => <ExplorePageLoading mode="route" />,
  component: createLazyPageRoute(
    explorePageModule.Component,
    <ExplorePageLoading mode="route" />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.explore,
    title: "Explore could not finish loading",
    description:
      "Group discovery ran into an unexpected issue while loading people, requests, or group options.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
});

const groupPlanDetailRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/groups/$groupId",
  validateSearch: validateGroupPlanDetailSearch,
  loader: createGroupPlanDetailRouteLoader(groupPlanDetailPageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: () => <GroupPlanDetailPageLoading mode="route" />,
  component: createLazyPageRoute(
    groupPlanDetailPageModule.Component,
    <GroupPlanDetailPageLoading mode="route" />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.groupPlanDetail,
    title: "Group details could not finish loading",
    description:
      "The group and plan briefing hit an unexpected issue before it could render cleanly.",
    fallbackTo: "/explore",
    fallbackLabel: "Back to explore",
  }),
});

const activityRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/activity",
  loader: createActivityRouteLoader(activityPageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: () => <ActivityPageLoading mode="route" />,
  component: createLazyPageRoute(
    activityPageModule.Component,
    <ActivityPageLoading mode="route" />,
  ),
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
  loader: createRouteModuleLoader(profilePageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: () => <ProfilePageLoading mode="route" />,
  component: createLazyPageRoute(
    profilePageModule.Component,
    <ProfilePageLoading mode="route" />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.profile,
    title: "Profile could not finish loading",
    description:
      "Your profile hit an unexpected issue while loading personality details, interests, or trust history.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
});

const userDetailRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/users/$userId",
  loader: createUserDetailRouteLoader(userDetailPageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: () => <ProfilePageLoading mode="route" />,
  component: createLazyPageRoute(
    userDetailPageModule.Component,
    <ProfilePageLoading mode="route" />,
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.userDetail,
    title: "Profile could not finish loading",
    description:
      "This public profile hit an unexpected issue while loading details, interests, or social fit.",
    fallbackTo: "/explore",
    fallbackLabel: "Back to explore",
  }),
});

const settingsRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/settings",
  loader: createRouteModuleLoader(settingsPageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: () => <SettingsPageLoading mode="route" />,
  component: createLazyPageRoute(
    settingsPageModule.Component,
    <SettingsPageLoading mode="route" />,
  ),
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
  loader: createRouteModuleLoader(forgePageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: () => <ForgePageLoading mode="route" />,
  component: createLazyPageRoute(
    forgePageModule.Component,
    <ForgePageLoading mode="route" />,
  ),
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
  groupPlanDetailRoute,
  activityRoute,
  profileRoute,
  userDetailRoute,
  settingsRoute,
  forgeRoute,
];

export const appRouteModules = [
  homePageModule,
  explorePageModule,
  groupPlanDetailPageModule,
  activityPageModule,
  profilePageModule,
  userDetailPageModule,
  settingsPageModule,
  forgePageModule,
];
