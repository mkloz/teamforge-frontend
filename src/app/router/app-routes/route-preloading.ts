import {
  ActivityRouteLoading,
  activityPageModule,
  ExploreRouteLoading,
  explorePageModule,
  GroupPlanDetailRouteLoading,
  GroupProposalRouteLoading,
  groupPlanDetailPageModule,
  groupProposalPageModule,
  HomeRouteLoading,
  homePageModule,
  PlanCreationRouteLoading,
  ProfileRouteLoading,
  planCreationPageModule,
  profilePageModule,
  SettingsRouteLoading,
  settingsPageModule,
  userDetailPageModule,
} from "@/app/router/app-routes/route-modules";
import type { LazyRouteLoadingComponent } from "@/app/router/lazy-route-loading";
import type { LazyRouteModule } from "@/app/router/lazy-route-module";
import { DEFAULT_FILTERS } from "@/features/explore/constants/explore.constants";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import {
  ensureOnboardingProductState,
  getOnboardingProjectionScope,
} from "@/shared/api/onboarding-product-state-query";
import { appQueryClient } from "@/shared/api/query-client";
import { getBrowserDocument } from "@/shared/lib/browser-environment";
import { getSizedImageUrl } from "@/shared/lib/sized-image-url";

interface AppRouteModulePreloader {
  matches: (pathname: string) => boolean;
  module: LazyRouteModule;
  loading?: LazyRouteLoadingComponent;
  preloadData?: (pathname: string) => Promise<void>;
}

type SessionRestoredRoutePreload = () => Promise<void>;
type SessionRestoredPreloadResolver = (
  pathname: string,
) => SessionRestoredRoutePreload | undefined;

export function createRouteModuleLoader(
  module: LazyRouteModule,
  loading?: LazyRouteLoadingComponent,
) {
  return async () => {
    startRouteLoadingPreload(loading);

    await module.preload();
  };
}

export function createExploreRouteLoader(
  module: LazyRouteModule,
  loading?: LazyRouteLoadingComponent,
) {
  return async () => {
    startRouteLoadingPreload(loading);
    startRouteDataPreload(preloadDefaultExploreFeed);

    await module.preload();
  };
}

export function createActivityRouteLoader(
  module: LazyRouteModule,
  loading?: LazyRouteLoadingComponent,
) {
  return async () => {
    startRouteLoadingPreload(loading);
    startRouteDataPreload(preloadActivityFeed);

    await module.preload();
  };
}

export function createGroupPlanDetailRouteLoader(
  module: LazyRouteModule,
  loading?: LazyRouteLoadingComponent,
) {
  return async () => {
    startRouteLoadingPreload(loading);

    await module.preload();
  };
}

export function createGroupProposalRouteLoader(
  module: LazyRouteModule,
  loading?: LazyRouteLoadingComponent,
) {
  return async ({ params }: { params: { proposalId: string } }) => {
    startRouteLoadingPreload(loading);
    startRouteDataPreload(() => preloadGroupProposal(params.proposalId));

    await module.preload();
  };
}

export function createUserDetailRouteLoader(
  module: LazyRouteModule,
  loading?: LazyRouteLoadingComponent,
) {
  return async ({ params }: { params: { userId: string } }) => {
    startRouteLoadingPreload(loading);
    startRouteDataPreload(() => preloadUserDetail(params.userId));

    await module.preload();
  };
}

export function createSessionRestoredRoutePreload(pathname: string) {
  return getFirstSessionRestoredRoutePreload(pathname);
}

export function preloadMatchedAppRouteModule(pathname: string) {
  const matchedPreloader = APP_ROUTE_MODULE_PRELOADERS.find((preloader) =>
    preloader.matches(pathname),
  );

  startRouteLoadingPreload(matchedPreloader?.loading);
  void matchedPreloader?.module.preload().catch(() => null);
}

let authenticatedAppRouteWarmupPromise: Promise<void> | null = null;

export function warmAuthenticatedAppRoutes(pathname: string) {
  authenticatedAppRouteWarmupPromise ??=
    warmAuthenticatedAppRoutesOnce(pathname);

  return authenticatedAppRouteWarmupPromise;
}

async function warmAuthenticatedAppRoutesOnce(pathname: string) {
  const warmupTargets = getAppRouteWarmupTargets(pathname);

  await preloadAppRouteLoadingComponents(warmupTargets);
  await preloadAppRoutePageModules(warmupTargets);
  await preloadAppRouteData(warmupTargets, pathname);
}

async function preloadAppRouteLoadingComponents(
  warmupTargets: readonly AppRouteModulePreloader[],
) {
  const preloadTasks = warmupTargets.flatMap((target) =>
    target.loading ? [target.loading.preload()] : [],
  );

  await Promise.allSettled(preloadTasks);
}

async function preloadAppRoutePageModules(
  warmupTargets: readonly AppRouteModulePreloader[],
) {
  await Promise.allSettled(
    warmupTargets.map((target) => target.module.preload()),
  );
}

async function preloadAppRouteData(
  warmupTargets: readonly AppRouteModulePreloader[],
  pathname: string,
) {
  const preloadTasks = warmupTargets.flatMap((target) =>
    target.preloadData ? [target.preloadData(pathname)] : [],
  );

  await Promise.allSettled(preloadTasks);
}

function getAppRouteWarmupTargets(pathname: string) {
  const currentIndex = APP_ROUTE_MODULE_PRELOADERS.findIndex((preloader) =>
    preloader.matches(pathname),
  );

  if (currentIndex < 0) {
    return APP_ROUTE_MODULE_PRELOADERS;
  }

  return APP_ROUTE_MODULE_PRELOADERS.filter(
    (_preloader, index) => index !== currentIndex,
  );
}

function startRouteLoadingPreload(loading?: LazyRouteLoadingComponent) {
  void loading?.preload().catch(() => null);
}

function startRouteDataPreload(preloadData: () => Promise<void>) {
  void preloadData().catch(() => null);
}

async function preloadDefaultExploreFeed() {
  const { exploreQueries } = await import(
    "@/features/explore/api/explore-queries"
  );
  const productState = await ensureOnboardingProductState();

  const data = await appQueryClient.fetchInfiniteQuery(
    exploreQueries.feed(
      DEFAULT_FILTERS,
      "",
      getOnboardingProjectionScope(productState),
    ),
  );
  const firstGroupAvatar = data.pages[0]?.items.find(
    (item) => item.type === "GROUP",
  )?.group.avatar;

  preloadRouteImage(
    getSizedImageUrl(firstGroupAvatar, 384) ?? firstGroupAvatar,
  );
}

async function preloadActivityFeed() {
  const { getActivityFeedPreloadQueries } = await import(
    "@/features/activity/public/activity-feed-preload"
  );
  const [groupsQuery, chatsQuery, friendshipsQuery, savedMessagesQuery] =
    getActivityFeedPreloadQueries();

  await Promise.allSettled([
    appQueryClient.prefetchQuery(groupsQuery),
    appQueryClient.prefetchQuery(chatsQuery),
    appQueryClient.prefetchQuery(friendshipsQuery),
    appQueryClient.prefetchQuery(savedMessagesQuery),
  ]);
}

async function preloadHomeRouteData() {
  const { homeQueries } = await import("@/features/home/api/home-queries");
  const productState = await ensureOnboardingProductState();
  const projectionScope = getOnboardingProjectionScope(productState);

  await Promise.allSettled([
    appQueryClient.prefetchQuery(homeQueries.groups()),
    appQueryClient.prefetchQuery(homeQueries.invitations()),
    appQueryClient.prefetchQuery(homeQueries.plans()),
    appQueryClient.prefetchQuery(homeQueries.stats()),
    appQueryClient.prefetchQuery(homeQueries.recommendations(projectionScope)),
  ]);
}

async function preloadProfileRouteData() {
  await appQueryClient.prefetchQuery(currentUserQueryOptions());
}

async function preloadSettingsRouteData() {
  const { settingsQueries } = await import(
    "@/features/settings/api/settings-queries"
  );

  await Promise.allSettled([
    appQueryClient.prefetchQuery(settingsQueries.notificationPreferences()),
    appQueryClient.prefetchQuery(settingsQueries.sessions()),
    appQueryClient.prefetchQuery(settingsQueries.blockedUsers()),
  ]);
}

async function preloadPlanCreationRouteData() {
  const {
    planCreationFriendCandidatesQueryOptions,
    planCreationRecentActivitiesQueryOptions,
  } = await import("@/features/plan-creation/api/plan-creation-query-options");

  await Promise.allSettled([
    appQueryClient.prefetchInfiniteQuery(
      planCreationFriendCandidatesQueryOptions(""),
    ),
    appQueryClient.prefetchQuery(planCreationRecentActivitiesQueryOptions()),
  ]);
}

async function preloadGroupProposal(proposalId: string) {
  const { groupProposalQueries } = await import(
    "@/features/group-proposals/api/group-proposal-queries"
  );

  await appQueryClient.prefetchQuery(groupProposalQueries.detail(proposalId));
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
  const browserDocument = getBrowserDocument();

  if (browserDocument) {
    appendRouteImagePreloadLink(browserDocument, src);
  }
}

function appendRouteImagePreloadLink(browserDocument: Document, src: string) {
  if (hasRouteImagePreloadLink(browserDocument, src)) {
    return;
  }

  const link = browserDocument.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = src;
  link.setAttribute("fetchpriority", "high");
  browserDocument.head.append(link);
}

function hasRouteImagePreloadLink(browserDocument: Document, src: string) {
  const absoluteSrc = new URL(src, browserDocument.baseURI).href;

  return Array.from(
    browserDocument.head.querySelectorAll<HTMLLinkElement>(
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
      await preloadDefaultExploreFeed();
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

function createGroupProposalSessionRestoredPreload(pathname: string) {
  const proposalId = getGroupProposalIdFromPathname(pathname);

  return proposalId
    ? async () => {
        await preloadGroupProposal(proposalId);
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

function getUserIdFromPathname(pathname: string) {
  const match = /^\/users\/([^/?#]+)/.exec(pathname);
  const userId = match?.[1];

  return userId ? decodeURIComponent(userId) : null;
}

function getGroupProposalIdFromPathname(pathname: string) {
  const match = /^\/group-proposals\/([^/?#]+)/.exec(pathname);
  const proposalId = match?.[1];

  return proposalId ? decodeURIComponent(proposalId) : null;
}

const SESSION_RESTORED_PRELOAD_RESOLVERS: SessionRestoredPreloadResolver[] = [
  createExploreSessionRestoredPreload,
  createActivitySessionRestoredPreload,
  createGroupProposalSessionRestoredPreload,
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
    loading: HomeRouteLoading,
    preloadData: preloadHomeRouteData,
  },
  {
    matches: (pathname: string) => pathname === "/explore",
    module: explorePageModule,
    loading: ExploreRouteLoading,
    preloadData: preloadDefaultExploreFeed,
  },
  {
    matches: (pathname: string) =>
      pathname === "/activity" || pathname.startsWith("/activity/"),
    module: activityPageModule,
    loading: ActivityRouteLoading,
    preloadData: preloadActivityFeed,
  },
  {
    matches: (pathname: string) => pathname === "/profile",
    module: profilePageModule,
    loading: ProfileRouteLoading,
    preloadData: preloadProfileRouteData,
  },
  {
    matches: (pathname: string) => pathname.startsWith("/users/"),
    module: userDetailPageModule,
    loading: ProfileRouteLoading,
    preloadData: (pathname: string) => {
      const userId = getUserIdFromPathname(pathname);

      return userId ? preloadUserDetail(userId) : Promise.resolve();
    },
  },
  {
    matches: (pathname: string) =>
      pathname === "/settings" || pathname.startsWith("/settings/"),
    module: settingsPageModule,
    loading: SettingsRouteLoading,
    preloadData: preloadSettingsRouteData,
  },
  {
    matches: (pathname: string) => pathname.startsWith("/group-proposals/"),
    module: groupProposalPageModule,
    loading: GroupProposalRouteLoading,
    preloadData: (pathname: string) => {
      const proposalId = getGroupProposalIdFromPathname(pathname);

      return proposalId ? preloadGroupProposal(proposalId) : Promise.resolve();
    },
  },
  {
    matches: (pathname: string) => pathname === "/plans/new",
    module: planCreationPageModule,
    loading: PlanCreationRouteLoading,
    preloadData: preloadPlanCreationRouteData,
  },
  {
    matches: (pathname: string) => pathname.startsWith("/groups/"),
    module: groupPlanDetailPageModule,
    loading: GroupPlanDetailRouteLoading,
  },
] satisfies readonly AppRouteModulePreloader[];
