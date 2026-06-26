import { createRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { createLazyPageRoute } from "@/app/router/lazy-page-route";
import { createLazyRouteLoading } from "@/app/router/lazy-route-loading";
import {
  createLazyRouteModule,
  type LazyRouteModule,
} from "@/app/router/lazy-route-module";
import { rootRoute } from "@/app/router/root-route";
import { createRouteErrorComponent } from "@/app/router/route-error-component";
import { requireCanonicalAppRoute } from "@/app/router/route-guards";
import {
  validateGroupPlanDetailSearch,
  validateUserDetailSearch,
} from "@/app/router/route-search-validators";
import { validateActivityRouteSearch } from "@/features/activity/lib/activity-route";
import { DEFAULT_FILTERS } from "@/features/explore/constants/explore.constants";
import { validateExploreRouteSearch } from "@/features/explore/lib/explore-route";
import { validateForgeRouteSearch } from "@/features/forge/lib/forge-route";
import { validateHomeRouteSearch } from "@/features/home/lib/home-route";
import { validateSettingsRouteSearch } from "@/features/settings/lib/settings-route";
import { appQueryClient } from "@/shared/api/query-client";
import { ForgeLoadingMark } from "@/shared/components/loading/forge-loading-mark";
import { getSizedImageUrl } from "@/shared/lib/sized-image-url";
import { routeErrorScopes } from "@/shared/lib/telemetry-contract";

interface PreloadableGroupPlanDetail {
  plan?: { coverImage?: string | null } | null;
  group: { avatar?: string | null };
  members: { avatar?: string | null }[];
}

type SessionRestoredRoutePreload = () => Promise<void>;
type SessionRestoredPreloadResolver = (
  pathname: string,
) => SessionRestoredRoutePreload | undefined;

function loadAppShellWithNotifications() {
  return import("@/app/router/app-shell-with-notifications").then((module) => ({
    default: module.AppShellWithNotifications,
  }));
}

const AppShellWithNotifications = lazy(loadAppShellWithNotifications);

const homePageModule = createLazyRouteModule(() =>
  import("@/features/home/home-page").then((m) => ({ default: m.HomePage })),
);

const HomeRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/home/home-page.loading").then((m) => ({
      default: m.HomePageLoading,
    })),
  { mode: "route" },
);

const explorePageModule = createLazyRouteModule(() =>
  import("@/features/explore/explore-page").then((m) => ({
    default: m.ExplorePage,
  })),
);

const ExploreRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/explore/explore-page.loading").then((m) => ({
      default: m.ExplorePageLoading,
    })),
  { mode: "route" },
);

const activityPageModule = createLazyRouteModule(() =>
  import("@/features/activity/activity-page").then((m) => ({
    default: m.ActivityPage,
  })),
);

const ActivityRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/activity/activity-page.loading").then((m) => ({
      default: m.ActivityPageLoading,
    })),
  { mode: "route" },
);

const profilePageModule = createLazyRouteModule(() =>
  import("@/features/profile/profile-page").then((m) => ({
    default: m.ProfilePage,
  })),
);

const ProfileRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/profile/profile-page/profile-page.loading").then(
      (m) => ({
        default: m.ProfilePageLoading,
      }),
    ),
  { mode: "route" },
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

const SettingsRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/settings/settings-page/settings-page.loading").then(
      (m) => ({
        default: m.SettingsPageLoading,
      }),
    ),
  { mode: "route" },
);

const forgePageModule = createLazyRouteModule(() =>
  import("@/features/forge/forge-page").then((m) => ({
    default: m.ForgePage,
  })),
);

const ForgeRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/forge/forge-page.loading").then((m) => ({
      default: m.ForgePageLoading,
    })),
  { mode: "route" },
);

const groupPlanDetailPageModule = createLazyRouteModule(() =>
  import("@/features/group-plan-detail/group-plan-detail-page").then((m) => ({
    default: m.GroupPlanDetailPage,
  })),
);

const GroupPlanDetailRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/group-plan-detail/group-plan-detail-page.loading").then(
      (m) => ({
        default: m.GroupPlanDetailPageLoading,
      }),
    ),
  { mode: "route" },
);

function createRouteModuleLoader(module: LazyRouteModule) {
  return async () => {
    await module.preload();
  };
}

async function preloadDefaultExploreGroups() {
  const { ExploreQueryFactory } = await import(
    "@/features/explore/api/explore-query-factory"
  );

  const data = await appQueryClient.fetchInfiniteQuery(
    ExploreQueryFactory.groups(DEFAULT_FILTERS, ""),
  );
  const firstGroupAvatar = data.pages[0]?.groups[0]?.avatar;

  preloadRouteImage(
    getSizedImageUrl(firstGroupAvatar, 384) ?? firstGroupAvatar,
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
    void preloadActivityFeed().catch(() => null);

    await module.preload();
  };
}

async function preloadGroupPlanDetail(groupId: string) {
  const { GroupPlanDetailQueryFactory } = await import(
    "@/features/group-plan-detail/api/group-plan-detail-query-factory"
  );

  const detail = await appQueryClient.fetchQuery(
    GroupPlanDetailQueryFactory.detail(groupId),
  );
  const coverSrc = getPreferredGroupPlanCoverSrc(detail);

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
  if (!canPreloadRouteImage(src)) {
    return;
  }

  preloadRouteImageLink(src);
  warmRouteImage(src);
}

function canPreloadRouteImage(src: string | null | undefined): src is string {
  return Boolean(src) && typeof globalThis.Image === "function";
}

function preloadRouteImageLink(src: string) {
  if (typeof document !== "undefined") {
    appendRouteImagePreloadLink(src);
  }
}

function appendRouteImagePreloadLink(src: string) {
  if (hasRouteImagePreloadLink(src)) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = src;
  link.setAttribute("fetchpriority", "high");
  document.head.append(link);
}

function hasRouteImagePreloadLink(src: string) {
  const absoluteSrc = new URL(src, document.baseURI).href;

  return Array.from(
    document.head.querySelectorAll<HTMLLinkElement>(
      'link[rel="preload"][as="image"]',
    ),
  ).some((link) => link.href === absoluteSrc);
}

function warmRouteImage(src: string) {
  const image = new globalThis.Image();
  image.decoding = "async";
  image.fetchPriority = "high";
  image.src = src;
}

function createExploreSessionRestoredPreload(pathname: string) {
  if (pathname === "/explore") {
    return async () => {
      await preloadDefaultExploreGroups();
    };
  }

  return undefined;
}

function createActivitySessionRestoredPreload(pathname: string) {
  if (pathname === "/activity" || pathname.startsWith("/activity/")) {
    return async () => {
      await preloadActivityFeed();
    };
  }

  return undefined;
}

function createGroupSessionRestoredPreload(pathname: string) {
  const groupId = getGroupPlanIdFromPathname(pathname);

  return groupId
    ? async () => {
        await preloadGroupPlanDetail(groupId);
      }
    : undefined;
}

function createUserSessionRestoredPreload(pathname: string) {
  const userId = getUserIdFromPathname(pathname);

  return userId
    ? async () => {
        await preloadUserDetail(userId);
      }
    : undefined;
}

function getPreferredGroupPlanCoverSrc(detail: PreloadableGroupPlanDetail) {
  return (
    detail.plan?.coverImage ??
    detail.group.avatar ??
    getFirstMemberAvatar(detail.members)
  );
}

function getFirstMemberAvatar(members: PreloadableGroupPlanDetail["members"]) {
  return members.find(hasAvatar)?.avatar ?? null;
}

function hasAvatar(member: { avatar?: string | null }): member is {
  avatar: string;
} {
  return Boolean(member.avatar);
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

const SESSION_RESTORED_PRELOAD_RESOLVERS: SessionRestoredPreloadResolver[] = [
  createExploreSessionRestoredPreload,
  createActivitySessionRestoredPreload,
  createGroupSessionRestoredPreload,
  createUserSessionRestoredPreload,
];

function createSessionRestoredRoutePreload(pathname: string) {
  return getFirstSessionRestoredRoutePreload(pathname);
}

function getFirstSessionRestoredRoutePreload(pathname: string) {
  for (const resolvePreload of SESSION_RESTORED_PRELOAD_RESOLVERS) {
    const preload = resolvePreload(pathname);

    if (preload) {
      return preload;
    }
  }

  return undefined;
}

const APP_ROUTE_MODULE_PRELOADERS = [
  {
    matches: (pathname: string) => pathname === "/home",
    module: homePageModule,
  },
  {
    matches: (pathname: string) => pathname === "/explore",
    module: explorePageModule,
  },
  {
    matches: (pathname: string) =>
      pathname === "/activity" || pathname.startsWith("/activity/"),
    module: activityPageModule,
  },
  {
    matches: (pathname: string) => pathname === "/profile",
    module: profilePageModule,
  },
  {
    matches: (pathname: string) => pathname.startsWith("/users/"),
    module: userDetailPageModule,
  },
  {
    matches: (pathname: string) =>
      pathname === "/settings" || pathname.startsWith("/settings/"),
    module: settingsPageModule,
  },
  {
    matches: (pathname: string) => pathname === "/forge",
    module: forgePageModule,
  },
  {
    matches: (pathname: string) => pathname.startsWith("/groups/"),
    module: groupPlanDetailPageModule,
  },
] as const;

function preloadMatchedAppRouteModule(pathname: string) {
  const matchedPreloader = APP_ROUTE_MODULE_PRELOADERS.find((preloader) =>
    preloader.matches(pathname),
  );

  void matchedPreloader?.module.preload().catch(() => null);
}

function AppShellRouteComponent() {
  return (
    <Suspense fallback={<AppShellRouteLoading />}>
      <AppShellWithNotifications />
    </Suspense>
  );
}

function AppShellRouteLoading() {
  return (
    <div className="loading-canvas-glow flex min-h-dvh items-center justify-center px-6 text-ink">
      <ForgeLoadingMark label="Loading TeamForge" size="md" />
    </div>
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
  pendingComponent: AppShellRouteLoading,
  component: AppShellRouteComponent,
});

const homeRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/home",
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
});

const exploreRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/explore",
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
});

const groupPlanDetailRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/groups/$groupId",
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
});

const activityRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/activity",
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
});

const profileRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/profile",
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
});

const userDetailRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/users/$userId",
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
});

const settingsRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/settings",
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
});

const forgeRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/forge",
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
