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
import {
  ensureOnboardingProductState,
  getOnboardingProjectionScope,
} from "@/shared/api/onboarding-product-state-query";
import { appQueryClient } from "@/shared/api/query-client";
import {
  getBrowserDocument,
  getBrowserNetworkInformation,
  isBrowserDocumentVisible,
  isBrowserOnline,
} from "@/shared/lib/browser-environment";
import { getSizedImageUrl } from "@/shared/lib/sized-image-url";

interface AppRouteModulePreloader {
  matches: (pathname: string) => boolean;
  module: LazyRouteModule;
  loading?: LazyRouteLoadingComponent;
}

type SessionRestoredRoutePreload = () => Promise<void>;
type SessionRestoredPreloadResolver = (
  pathname: string,
) => SessionRestoredRoutePreload | undefined;

interface RouteLoaderContext {
  preload?: boolean;
}

type RoutePreloadBudget = "module-only" | "navigation" | "none";

export function createRouteModuleLoader(
  module: LazyRouteModule,
  loading?: LazyRouteLoadingComponent,
) {
  return async ({ preload = false }: RouteLoaderContext = {}) => {
    const budget = getRoutePreloadBudget(preload);

    if (budget === "none") {
      return;
    }

    if (budget === "navigation") {
      startRouteLoadingPreload(loading);
    }

    await module.preload();
  };
}

export function createExploreRouteLoader(
  module: LazyRouteModule,
  loading?: LazyRouteLoadingComponent,
) {
  return async ({ preload = false }: RouteLoaderContext = {}) => {
    const budget = getRoutePreloadBudget(preload);

    if (budget === "none") {
      return;
    }

    if (budget === "navigation") {
      startRouteLoadingPreload(loading);
      startRouteDataPreload(preloadDefaultExploreFeed);
    }

    await module.preload();
  };
}

export function createActivityRouteLoader(
  module: LazyRouteModule,
  loading?: LazyRouteLoadingComponent,
) {
  return async ({ preload = false }: RouteLoaderContext = {}) => {
    const budget = getRoutePreloadBudget(preload);

    if (budget === "none") {
      return;
    }

    if (budget === "navigation") {
      startRouteLoadingPreload(loading);
      startRouteDataPreload(preloadActivityFeed);
    }

    await module.preload();
  };
}

export function createGroupPlanDetailRouteLoader(
  module: LazyRouteModule,
  loading?: LazyRouteLoadingComponent,
) {
  return async ({ preload = false }: RouteLoaderContext = {}) => {
    const budget = getRoutePreloadBudget(preload);

    if (budget === "none") {
      return;
    }

    if (budget === "navigation") {
      startRouteLoadingPreload(loading);
    }

    await module.preload();
  };
}

export function createGroupProposalRouteLoader(
  module: LazyRouteModule,
  loading?: LazyRouteLoadingComponent,
) {
  return async ({
    params,
    preload = false,
  }: RouteLoaderContext & { params: { proposalId: string } }) => {
    const budget = getRoutePreloadBudget(preload);

    if (budget === "none") {
      return;
    }

    if (budget === "navigation") {
      startRouteLoadingPreload(loading);
      startRouteDataPreload(() => preloadGroupProposal(params.proposalId));
    }

    await module.preload();
  };
}

export function createUserDetailRouteLoader(
  module: LazyRouteModule,
  loading?: LazyRouteLoadingComponent,
) {
  return async ({
    params,
    preload = false,
  }: RouteLoaderContext & { params: { userId: string } }) => {
    const budget = getRoutePreloadBudget(preload);

    if (budget === "none") {
      return;
    }

    if (budget === "navigation") {
      startRouteLoadingPreload(loading);
      startRouteDataPreload(() => preloadUserDetail(params.userId));
    }

    await module.preload();
  };
}

export function createSessionRestoredRoutePreload(pathname: string) {
  return getFirstSessionRestoredRoutePreload(pathname);
}

export function preloadMatchedAppRouteModule(
  pathname: string,
  preload = false,
) {
  if (getRoutePreloadBudget(preload) === "none") {
    return;
  }

  const matchedPreloader = APP_ROUTE_MODULE_PRELOADERS.find((preloader) =>
    preloader.matches(pathname),
  );

  if (!preload) {
    startRouteLoadingPreload(matchedPreloader?.loading);
  }
  void matchedPreloader?.module.preload().catch(() => null);
}

export function getRoutePreloadBudget(preload: boolean): RoutePreloadBudget {
  if (!preload) {
    return "navigation";
  }

  if (!isBrowserDocumentVisible() || !isBrowserOnline()) {
    return "none";
  }

  const connection = getBrowserNetworkInformation();

  if (
    connection?.saveData ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g"
  ) {
    return "none";
  }

  return "module-only";
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
  },
  {
    matches: (pathname: string) => pathname === "/explore",
    module: explorePageModule,
    loading: ExploreRouteLoading,
  },
  {
    matches: (pathname: string) =>
      pathname === "/activity" || pathname.startsWith("/activity/"),
    module: activityPageModule,
    loading: ActivityRouteLoading,
  },
  {
    matches: (pathname: string) => pathname === "/profile",
    module: profilePageModule,
    loading: ProfileRouteLoading,
  },
  {
    matches: (pathname: string) => pathname.startsWith("/users/"),
    module: userDetailPageModule,
    loading: ProfileRouteLoading,
  },
  {
    matches: (pathname: string) =>
      pathname === "/settings" || pathname.startsWith("/settings/"),
    module: settingsPageModule,
    loading: SettingsRouteLoading,
  },
  {
    matches: (pathname: string) => pathname.startsWith("/group-proposals/"),
    module: groupProposalPageModule,
    loading: GroupProposalRouteLoading,
  },
  {
    matches: (pathname: string) => pathname === "/plans/new",
    module: planCreationPageModule,
    loading: PlanCreationRouteLoading,
  },
  {
    matches: (pathname: string) => pathname.startsWith("/groups/"),
    module: groupPlanDetailPageModule,
    loading: GroupPlanDetailRouteLoading,
  },
] satisfies readonly AppRouteModulePreloader[];
