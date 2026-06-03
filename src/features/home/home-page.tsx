import {
  lazy,
  type ReactNode,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { AttentionQueue } from "@/features/home/components/attention-queue";
import { GroupsGrid } from "@/features/home/components/groups-grid";
import { HomeHero } from "@/features/home/components/home-hero";
import { HomeOfflineLaunchState } from "@/features/home/components/home-offline-launch-state";
import {
  HomeInviteSkeleton,
  HomeRecommendedGroupsSkeleton,
  HomeUpcomingPlansSkeleton,
} from "@/features/home/components/home-skeletons";
import { HomePageContent } from "@/features/home/home-page-content";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { useHomeRouteState } from "@/features/home/hooks/use-home-route-state";
import { useHomeViewerState } from "@/features/home/hooks/use-home-viewer";
import { PageErrorState } from "@/shared/components/page-error-state";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

const LazyFriendsInvitation = lazy(() =>
  import("@/features/home/components/friends-invitation").then((module) => ({
    default: module.FriendsInvitation,
  })),
);
const LazyRecommendedGroups = lazy(() =>
  import("@/features/home/components/recommended-groups").then((module) => ({
    default: module.RecommendedGroups,
  })),
);
const LazySentInvitationsReview = lazy(() =>
  import("@/features/home/components/sent-invitations-review").then(
    (module) => ({
      default: module.SentInvitationsReview,
    }),
  ),
);
const LazyUpcomingPlans = lazy(() =>
  import("@/features/home/components/upcoming-plans").then((module) => ({
    default: module.UpcomingPlans,
  })),
);

const HOME_PAGE_METADATA = createTeamForgePageMetadata({
  title: "Home",
  description:
    "Your TeamForge home for groups, invitations, plans, and recommended next moves.",
});

export function HomePage() {
  usePageMetadata(HOME_PAGE_METADATA);

  const {
    focusedInviteId,
    focusedPanel,
    focusedRequestId,
    invitationView,
    clearFriendRequestFocus,
    clearInvitationFocus,
  } = useHomeRouteState();
  const shouldLoadSentInvitations =
    focusedPanel === "invitations" && invitationView === "sent";
  const {
    isLoading: isCoreHomeDataLoading,
    isError: isCoreHomeDataError,
    isOfflineUnavailable: isCoreHomeDataOfflineUnavailable,
    refetchAll,
  } = useHomeData({
    include: {
      groups: true,
      invitations: true,
      plans: true,
      stats: true,
    },
  });
  const {
    sentInvitations,
    isLoading: isSentInvitationsLoading,
    isError: isSentInvitationsError,
    isOfflineUnavailable: isSentInvitationsOfflineUnavailable,
  } = useHomeData({
    include: {
      sentInvitations: shouldLoadSentInvitations,
    },
  });
  const {
    isError: viewerError,
    isLoading: viewerLoading,
    isOfflineUnavailable: isViewerOfflineUnavailable,
    refetch: refetchViewer,
  } = useHomeViewerState();
  const invitationsRef = useRef<HTMLElement | null>(null);
  const hasOfflineHomeUnavailable =
    (isCoreHomeDataOfflineUnavailable && !isCoreHomeDataLoading) ||
    (shouldLoadSentInvitations &&
      isSentInvitationsOfflineUnavailable &&
      !isSentInvitationsLoading) ||
    (isViewerOfflineUnavailable && !viewerLoading);

  function refetchHomePage() {
    void refetchAll();
    void refetchViewer();
  }

  useEffect(() => {
    if (focusedPanel !== "invitations") {
      return;
    }

    invitationsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [focusedPanel]);

  if (hasOfflineHomeUnavailable) {
    return <HomeOfflineLaunchState onRetry={refetchHomePage} />;
  }

  if (
    (isCoreHomeDataError && !isCoreHomeDataLoading) ||
    (shouldLoadSentInvitations &&
      isSentInvitationsError &&
      !isSentInvitationsLoading) ||
    (viewerError && !viewerLoading)
  ) {
    return (
      <section
        aria-label="Home error"
        className="mx-auto w-full max-w-screen-2xl px-4 pt-3 pb-8 sm:px-5 md:pt-6 lg:px-8"
      >
        <PageErrorState
          title="Home could not load"
          description="Your plans, groups, and invitations could not be refreshed right now."
          onRetry={refetchHomePage}
        />
      </section>
    );
  }

  return (
    <HomePageContent
      hero={<HomeHero />}
      sentInvitationsReview={
        focusedPanel === "invitations" && invitationView === "sent" ? (
          <Suspense fallback={null}>
            <LazySentInvitationsReview
              focusedInviteId={focusedInviteId}
              invitations={sentInvitations}
              onClose={clearInvitationFocus}
            />
          </Suspense>
        ) : null
      }
      attentionQueue={
        <AttentionQueue
          focusedPanel={focusedPanel}
          focusedInviteId={focusedInviteId}
          focusedRequestId={focusedRequestId}
          invitationView={invitationView}
          focusRef={invitationsRef}
          onClearInvitationFocus={clearInvitationFocus}
          onClearFriendRequestFocus={clearFriendRequestFocus}
        />
      }
      upcomingPlans={
        <DeferredHomePanel fallback={<HomeUpcomingPlansSkeleton />}>
          <Suspense fallback={<HomeUpcomingPlansSkeleton />}>
            <LazyUpcomingPlans />
          </Suspense>
        </DeferredHomePanel>
      }
      recommendedGroups={
        <DeferredHomePanel fallback={<HomeRecommendedGroupsSkeleton />}>
          <Suspense fallback={<HomeRecommendedGroupsSkeleton />}>
            <LazyRecommendedGroups />
          </Suspense>
        </DeferredHomePanel>
      }
      groupsGrid={<GroupsGrid />}
      friendsInvitation={
        <DeferredHomePanel fallback={<HomeInviteSkeleton />} rootMargin="160px">
          <Suspense fallback={<HomeInviteSkeleton />}>
            <LazyFriendsInvitation />
          </Suspense>
        </DeferredHomePanel>
      }
    />
  );
}

function DeferredHomePanel({
  children,
  fallback,
  rootMargin = "240px",
}: {
  children: ReactNode;
  fallback: ReactNode;
  rootMargin?: string;
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldRender) {
      return undefined;
    }

    const node = panelRef.current;

    if (!node || typeof window.IntersectionObserver !== "function") {
      setShouldRender(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  return <div ref={panelRef}>{shouldRender ? children : fallback}</div>;
}
