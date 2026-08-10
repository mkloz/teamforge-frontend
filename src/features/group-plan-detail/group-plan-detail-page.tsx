import {
  useElementScrollRestoration,
  useParams,
  useRouter,
  useRouterState,
  useSearch,
} from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { GroupPlanDetailPageLoading } from "@/features/group-plan-detail/group-plan-detail-page.loading";
import { GroupPlanDetailPageContent } from "@/features/group-plan-detail/group-plan-detail-page-content";
import { useGroupPlanDetail } from "@/features/group-plan-detail/hooks/use-group-plan-detail";
import { useGroupPlanDetailLandingFocus } from "@/features/group-plan-detail/hooks/use-group-plan-detail-landing-focus";
import { useGroupPlanDetailRealtime } from "@/features/group-plan-detail/hooks/use-group-plan-detail-realtime";
import { IntroductoryGroupPlanDetailPage } from "@/features/group-plan-detail/introductory-group-plan-detail-page";
import {
  type GroupPlanDetail,
  type GroupPlanDetailResponse,
  isRichGroupPlanDetail,
} from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { getCachedCurrentUser } from "@/shared/api/current-user-cache";
import { PageErrorState } from "@/shared/components/page-error-state";
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
import type { GroupPlanDetailRouteSearch } from "@/shared/navigation";

const GROUP_PLAN_DETAIL_ROUTE = "/app-shell/groups/$groupId";
const GROUP_PLAN_DETAIL_DEFAULT_DESCRIPTION =
  "Review this group's plan, members, and fit summary in Findafew.";
const GROUP_DETAIL_ENTRY_CACHE_LIMIT = 20;
const groupDetailEntryScrollCache = new Map<string, number>();
let groupDetailEntryCacheUserId: string | null = null;

export function GroupPlanDetailPage() {
  const { groupId } = useParams({ from: GROUP_PLAN_DETAIL_ROUTE });
  const search = useSearch({ from: GROUP_PLAN_DETAIL_ROUTE });
  const detailQuery = useGroupPlanDetail(groupId);
  const pageMetadata = getGroupPlanDetailPageMetadata(detailQuery.data);
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
  const [readyScrollEntryToken, setReadyScrollEntryToken] = useState<
    string | null
  >(null);
  const isRestorationReady =
    detailQuery.isError ||
    (detailQuery.data !== undefined &&
      (!isRichGroupPlanDetail(detailQuery.data) ||
        readyScrollEntryToken === scrollEntry.token));
  const handleRestorationReady = useCallback(() => {
    setReadyScrollEntryToken(scrollEntry.token);
  }, [scrollEntry.token]);

  scopeGroupDetailEntryScrollCache(getCachedCurrentUser()?.id ?? null);

  usePageMetadata(pageMetadata);
  useLayoutEffect(() => {
    if (currentPathname !== `/groups/${groupId}` || !historyEntryKey) {
      return undefined;
    }

    const entryToken = scrollEntry.token;
    if (handledScrollEntryRef.current === entryToken) {
      return undefined;
    }

    const routeOwnedScroll = groupDetailEntryScrollCache.get(entryToken);
    const restoration = {
      left: restoredWindowScroll?.scrollX ?? 0,
      top: routeOwnedScroll ?? restoredWindowScroll?.scrollY ?? 0,
    };

    if (!isRestorationReady) {
      return listenForDetailRestoreCancellation(() => {
        cancelledScrollEntriesRef.current.add(entryToken);
      });
    }

    handledScrollEntryRef.current = entryToken;
    if (cancelledScrollEntriesRef.current.delete(entryToken)) {
      return undefined;
    }

    restoringScrollEntryRef.current = entryToken;
    let isCancelled = false;
    const stopCancellation = listenForDetailRestoreCancellation(() => {
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
    groupId,
    historyEntryKey,
    isRestorationReady,
    restoredWindowScroll,
    scrollEntry.token,
  ]);

  useEffect(() => {
    if (currentPathname !== `/groups/${groupId}`) return undefined;
    const isWaitingForRestoration =
      !isRestorationReady &&
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
      cacheGroupDetailEntryScroll(scrollEntry.token, getBrowserScrollY());
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
  }, [currentPathname, groupId, isRestorationReady, router, scrollEntry.token]);

  return (
    <GroupPlanDetailQueryState
      detailQuery={detailQuery}
      onRestorationReady={handleRestorationReady}
      search={search}
    />
  );
}

function cacheGroupDetailEntryScroll(entryToken: string, scrollY: number) {
  groupDetailEntryScrollCache.delete(entryToken);
  groupDetailEntryScrollCache.set(entryToken, scrollY);

  if (groupDetailEntryScrollCache.size > GROUP_DETAIL_ENTRY_CACHE_LIMIT) {
    const oldestEntry = groupDetailEntryScrollCache.keys().next().value;
    if (typeof oldestEntry === "string") {
      groupDetailEntryScrollCache.delete(oldestEntry);
    }
  }
}

function scopeGroupDetailEntryScrollCache(userId: string | null) {
  if (groupDetailEntryCacheUserId === userId) return;
  groupDetailEntryScrollCache.clear();
  groupDetailEntryCacheUserId = userId;
}

function listenForDetailRestoreCancellation(onCancel: () => void) {
  let isCancelled = false;
  const cancel = () => {
    if (isCancelled) return;
    isCancelled = true;
    onCancel();
  };
  const cancelForScrollKey = (event: KeyboardEvent) => {
    if (isDetailScrollIntentKey(event.key)) cancel();
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

function isDetailScrollIntentKey(key: string) {
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

function GroupPlanDetailQueryState({
  detailQuery,
  onRestorationReady,
  search,
}: {
  detailQuery: ReturnType<typeof useGroupPlanDetail>;
  onRestorationReady: () => void;
  search: GroupPlanDetailRouteSearch;
}) {
  if (detailQuery.isLoading) {
    return <GroupPlanDetailPageLoading mode="query" />;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return <GroupPlanDetailErrorState onRetry={detailQuery.refetch} />;
  }

  if (!isRichGroupPlanDetail(detailQuery.data)) {
    return <IntroductoryGroupPlanDetailPage detail={detailQuery.data} />;
  }

  return (
    <GroupPlanDetailLoadedView
      detail={detailQuery.data}
      onRestorationReady={onRestorationReady}
      search={search}
    />
  );
}

function GroupPlanDetailErrorState({
  onRetry,
}: {
  onRetry: ReturnType<typeof useGroupPlanDetail>["refetch"];
}) {
  return (
    <section
      aria-label="Group details error"
      className="mx-auto w-full max-w-screen-2xl px-4 pt-3 pb-6 sm:px-5 md:pt-6 lg:px-8"
    >
      <PageErrorState
        title="Group details could not load"
        description="Findafew could not load this group's details right now."
        retryLabel="Refresh details"
        onRetry={() => {
          void onRetry();
        }}
      />
    </section>
  );
}

function GroupPlanDetailLoadedView({
  detail,
  onRestorationReady,
  search,
}: {
  detail: GroupPlanDetail;
  onRestorationReady: () => void;
  search: GroupPlanDetailRouteSearch;
}) {
  const landingFocus = useGroupPlanDetailLoadedView({ detail, search });

  return (
    <GroupPlanDetailPageContent
      detail={detail}
      isPlanHighlighted={landingFocus.isPlanHighlighted}
      onRestorationReady={onRestorationReady}
      planSectionRef={landingFocus.planSectionRef}
      search={search}
    />
  );
}

function useGroupPlanDetailLoadedView({
  detail,
  search,
}: {
  detail: GroupPlanDetail;
  search: GroupPlanDetailRouteSearch;
}) {
  useGroupPlanDetailRealtime({
    groupId: detail.group.id,
    planId: detail.plan?.id ?? null,
  });

  return useGroupPlanDetailLandingFocus({
    detail,
    planId: search.plan,
    proposalId: search.proposal,
  });
}

function getGroupPlanDetailPageMetadata(
  detail: GroupPlanDetailResponse | undefined,
) {
  return createFindafewPageMetadata({
    title: getGroupPlanDetailPageTitle(detail),
    description: getGroupPlanDetailPageDescription(detail),
  });
}

function getGroupPlanDetailPageTitle(
  detail: GroupPlanDetailResponse | undefined,
) {
  if (!isRichGroupPlanDetail(detail)) return "Group preview";

  return detail?.plan?.title
    ? `${detail.plan.title} · ${detail.group.name}`
    : (detail?.group.name ?? "Group details");
}

function getGroupPlanDetailPageDescription(
  detail: GroupPlanDetailResponse | undefined,
) {
  if (!isRichGroupPlanDetail(detail)) {
    return GROUP_PLAN_DETAIL_DEFAULT_DESCRIPTION;
  }

  return detail.plan?.description ?? GROUP_PLAN_DETAIL_DEFAULT_DESCRIPTION;
}
