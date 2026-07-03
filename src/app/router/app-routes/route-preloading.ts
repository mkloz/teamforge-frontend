import {
  activityPageModule,
  explorePageModule,
  forgePageModule,
  groupPlanDetailPageModule,
  homePageModule,
  profilePageModule,
  settingsPageModule,
  userDetailPageModule,
} from "@/app/router/app-routes/route-modules";
import type { LazyRouteModule } from "@/app/router/lazy-route-module";
import { DEFAULT_FILTERS } from "@/features/explore/constants/explore.constants";
import { appQueryClient } from "@/shared/api/query-client";
import { getSizedImageUrl } from "@/shared/lib/sized-image-url";

interface PreloadableGroupPlanDetail {
  plan?: { coverImage?: string | null } | null;
  group: { avatar?: string | null };
  members: { avatar?: string | null }[];
}

type SessionRestoredRoutePreload = () => Promise<void>;
type SessionRestoredPreloadResolver = (
  pathname: string,
) => SessionRestoredRoutePreload | undefined;

export function createRouteModuleLoader(module: LazyRouteModule) {
  return async () => {
    await module.preload();
  };
}

export function createExploreRouteLoader(module: LazyRouteModule) {
  return async () => {
    const exploreGroupsTask = preloadDefaultExploreGroups().catch(() => null);

    await Promise.all([module.preload(), exploreGroupsTask]);
  };
}

export function createActivityRouteLoader(module: LazyRouteModule) {
  return async () => {
    void preloadActivityFeed().catch(() => null);

    await module.preload();
  };
}

export function createGroupPlanDetailRouteLoader(module: LazyRouteModule) {
  return async ({ params }: { params: { groupId: string } }) => {
    const detailTask = preloadGroupPlanDetail(params.groupId).catch(() => null);

    await Promise.all([module.preload(), detailTask]);
  };
}

export function createUserDetailRouteLoader(module: LazyRouteModule) {
  return async ({ params }: { params: { userId: string } }) => {
    const userTask = preloadUserDetail(params.userId).catch(() => null);

    await Promise.all([module.preload(), userTask]);
  };
}

export function createSessionRestoredRoutePreload(pathname: string) {
  return getFirstSessionRestoredRoutePreload(pathname);
}

export function preloadMatchedAppRouteModule(pathname: string) {
  const matchedPreloader = APP_ROUTE_MODULE_PRELOADERS.find((preloader) =>
    preloader.matches(pathname),
  );

  void matchedPreloader?.module.preload().catch(() => null);
}

async function preloadDefaultExploreGroups() {
  const { exploreQueries } = await import(
    "@/features/explore/api/explore-queries"
  );

  const data = await appQueryClient.fetchInfiniteQuery(
    exploreQueries.groups(DEFAULT_FILTERS, ""),
  );
  const firstGroupAvatar = data.pages[0]?.groups[0]?.avatar;

  preloadRouteImage(
    getSizedImageUrl(firstGroupAvatar, 384) ?? firstGroupAvatar,
  );
}

async function preloadActivityFeed() {
  const { getActivityFeedPreloadQueries } = await import(
    "@/features/activity/public/activity-feed-preload"
  );
  const [groupsQuery, chatsQuery, friendshipsQuery] =
    getActivityFeedPreloadQueries();

  await Promise.allSettled([
    appQueryClient.prefetchQuery(groupsQuery),
    appQueryClient.prefetchQuery(chatsQuery),
    appQueryClient.prefetchQuery(friendshipsQuery),
  ]);
}

async function preloadGroupPlanDetail(groupId: string) {
  const { groupPlanDetailQueries } = await import(
    "@/features/group-plan-detail/api/group-plan-detail-queries"
  );

  const detail = await appQueryClient.fetchQuery(
    groupPlanDetailQueries.detail(groupId),
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
