import {
  useElementScrollRestoration,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef } from "react";
import { ExploreFeed } from "@/features/explore/components/explore-feed";
import { ExploreQuickFilters } from "@/features/explore/components/explore-left-section/explore-quick-filters";
import { StartPlanCta } from "@/features/explore/components/explore-left-section/plan-creation-cta";
import { ExploreSearchHeader } from "@/features/explore/components/explore-search-header";
import { ExplorePageLoading } from "@/features/explore/explore-page.loading";
import { ExplorePageContent } from "@/features/explore/explore-page-content";
import { useExploreFeedQuery } from "@/features/explore/hooks/use-explore-feed-query";
import { getCachedCurrentUser } from "@/shared/api/current-user-cache";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { useScrollEntry } from "@/shared/hooks/use-scroll-entry";
import {
  addBrowserWindowEventListener,
  getBrowserScrollY,
  getBrowserWindow,
  scrollBrowserTo,
} from "@/shared/lib/browser-environment";
import {
  cancelScheduledAnimationFrame,
  scheduleAnimationFrame,
} from "@/shared/lib/browser-scheduling";
import { createFindafewPageMetadata } from "@/shared/lib/findafew-page-metadata";

const EXPLORE_PAGE_METADATA = createFindafewPageMetadata({
  title: "Explore",
  description:
    "Browse open Findafew groups by activity, date, location, and group size.",
});
const EXPLORE_ROUTE_ENTRY_CACHE_LIMIT = 20;
const exploreRouteEntryScrollCache = new Map<string, number>();
let exploreRouteEntryCacheUserId: string | null = null;

export function ExplorePage() {
  usePageMetadata(EXPLORE_PAGE_METADATA);

  const feedQuery = useExploreFeedQuery();
  const isInitialLoading = feedQuery.isLoading && !feedQuery.data;
  const isRestorationPending =
    isInitialLoading || (feedQuery.isFetching && feedQuery.isPlaceholderData);
  const scrollEntry = useScrollEntry();
  const router = useRouter();
  const historyEntryKey = useRouterState({
    select: (state) => state.location.state.__TSR_key,
  });
  const currentPathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const restoredWindowScroll = useElementScrollRestoration({
    getElement: getBrowserWindow,
    getKey: (location) => historyEntryKey ?? location.href,
  });
  const handledScrollEntryRef = useRef<string | null>(null);
  const restoringScrollEntryRef = useRef<string | null>(null);
  const cancelledScrollEntriesRef = useRef(new Set<string>());

  scopeExploreRouteEntryScrollCache(getCachedCurrentUser()?.id ?? null);

  useLayoutEffect(() => {
    if (currentPathname !== "/explore") {
      return undefined;
    }

    const entryToken = scrollEntry.token;
    if (handledScrollEntryRef.current === entryToken) {
      return undefined;
    }

    const routeOwnedScroll = exploreRouteEntryScrollCache.get(entryToken);
    const restoration =
      routeOwnedScroll === undefined && !restoredWindowScroll
        ? null
        : {
            left: restoredWindowScroll?.scrollX ?? 0,
            top: routeOwnedScroll ?? restoredWindowScroll?.scrollY ?? 0,
          };

    if (!restoration) {
      handledScrollEntryRef.current = entryToken;
      return undefined;
    }

    if (isRestorationPending) {
      return listenForRestoreCancellation(() => {
        cancelledScrollEntriesRef.current.add(entryToken);
      });
    }

    handledScrollEntryRef.current = entryToken;
    if (cancelledScrollEntriesRef.current.delete(entryToken)) {
      return undefined;
    }

    restoringScrollEntryRef.current = entryToken;
    let isCancelled = false;
    const stopCancellation = listenForRestoreCancellation(() => {
      isCancelled = true;
      restoringScrollEntryRef.current = null;
    });
    const frame = scheduleAnimationFrame(() => {
      stopCancellation();
      if (!isCancelled) {
        scrollBrowserTo({
          behavior: "instant",
          left: restoration.left,
          top: restoration.top,
        });
      }
      restoringScrollEntryRef.current = null;
    });
    return () => {
      stopCancellation();
      cancelScheduledAnimationFrame(frame);
      if (restoringScrollEntryRef.current === entryToken) {
        restoringScrollEntryRef.current = null;
      }
    };
  }, [
    currentPathname,
    isRestorationPending,
    restoredWindowScroll,
    scrollEntry.token,
  ]);

  useEffect(() => {
    if (currentPathname !== "/explore") return undefined;
    const isWaitingForRestoration =
      isRestorationPending &&
      handledScrollEntryRef.current !== scrollEntry.token;
    let isNavigating = false;
    const capture = () => {
      if (
        isWaitingForRestoration ||
        isNavigating ||
        handledScrollEntryRef.current !== scrollEntry.token ||
        restoringScrollEntryRef.current === scrollEntry.token
      ) {
        return;
      }
      cacheExploreRouteEntryScroll(scrollEntry.token, getBrowserScrollY());
    };
    capture();
    const stopScrollCapture = addBrowserWindowEventListener("scroll", capture, {
      passive: true,
    });
    const stopNavigationCapture = router.subscribe("onBeforeNavigate", () => {
      capture();
      isNavigating = true;
    });

    return () => {
      stopScrollCapture();
      stopNavigationCapture();
    };
  }, [currentPathname, isRestorationPending, router, scrollEntry.token]);

  if (isInitialLoading) {
    return <ExplorePageLoading mode="query" />;
  }

  return (
    <ExplorePageContent
      quickFilters={<ExploreQuickFilters />}
      searchHeader={<ExploreSearchHeader />}
      feed={<ExploreFeed />}
      planCreationCta={<StartPlanCta />}
    />
  );
}

function cacheExploreRouteEntryScroll(entryToken: string, scrollY: number) {
  exploreRouteEntryScrollCache.delete(entryToken);
  exploreRouteEntryScrollCache.set(entryToken, scrollY);

  if (exploreRouteEntryScrollCache.size > EXPLORE_ROUTE_ENTRY_CACHE_LIMIT) {
    const oldestEntry = exploreRouteEntryScrollCache.keys().next().value;

    if (typeof oldestEntry === "string") {
      exploreRouteEntryScrollCache.delete(oldestEntry);
    }
  }
}

function scopeExploreRouteEntryScrollCache(userId: string | null) {
  if (exploreRouteEntryCacheUserId === userId) {
    return;
  }

  exploreRouteEntryScrollCache.clear();
  exploreRouteEntryCacheUserId = userId;
}

function listenForRestoreCancellation(onCancel: () => void) {
  let isCancelled = false;
  const cancel = () => {
    if (isCancelled) return;
    isCancelled = true;
    onCancel();
  };
  const cancelForScrollKey = (event: KeyboardEvent) => {
    if (isScrollIntentKey(event.key)) cancel();
  };
  const cleanups = [
    addBrowserWindowEventListener("wheel", cancel, { passive: true }),
    addBrowserWindowEventListener("touchstart", cancel, { passive: true }),
    addBrowserWindowEventListener("pointerdown", cancel, { passive: true }),
    addBrowserWindowEventListener("keydown", cancelForScrollKey),
  ];

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}

function isScrollIntentKey(key: string) {
  return [
    "ArrowDown",
    "ArrowUp",
    "End",
    "Home",
    "PageDown",
    "PageUp",
    " ",
  ].includes(key);
}
