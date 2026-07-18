import { lazy, type ReactNode, Suspense, useEffect, useRef } from "react";
import { AttentionQueue } from "@/features/home/components/attention-queue";
import { AutoForgeRequestStatus } from "@/features/home/components/auto-forge-request-status";
import { CandidateAvailabilitySection } from "@/features/home/components/candidate-availability-section";
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
import { useDeferredRender } from "@/shared/hooks/use-deferred-render";
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
    "See your TeamForge groups, invitations, upcoming plans, and suggested actions.",
});

type HomeDataState = ReturnType<typeof useHomeData>;
type HomePageStatus = "error" | "offline" | "ready";
type HomePageStatusPredicate = (input: HomePageStatusInput) => boolean;

interface HomePageStatusInput {
  isCoreHomeDataError: boolean;
  isCoreHomeDataLoading: boolean;
  isCoreHomeDataOfflineUnavailable: boolean;
  isSentInvitationsError: boolean;
  isSentInvitationsLoading: boolean;
  isSentInvitationsOfflineUnavailable: boolean;
  isViewerOfflineUnavailable: boolean;
  shouldLoadSentInvitations: boolean;
  viewerError: boolean;
  viewerLoading: boolean;
}

const HOME_OFFLINE_BLOCKERS: HomePageStatusPredicate[] = [
  ({ isCoreHomeDataLoading, isCoreHomeDataOfflineUnavailable }) =>
    isCoreHomeDataOfflineUnavailable && !isCoreHomeDataLoading,
  ({
    isSentInvitationsLoading,
    isSentInvitationsOfflineUnavailable,
    shouldLoadSentInvitations,
  }) =>
    shouldLoadSentInvitations &&
    isSentInvitationsOfflineUnavailable &&
    !isSentInvitationsLoading,
  ({ isViewerOfflineUnavailable, viewerLoading }) =>
    isViewerOfflineUnavailable && !viewerLoading,
];

const HOME_ERROR_BLOCKERS: HomePageStatusPredicate[] = [
  ({ isCoreHomeDataError, isCoreHomeDataLoading }) =>
    isCoreHomeDataError && !isCoreHomeDataLoading,
  ({
    isSentInvitationsError,
    isSentInvitationsLoading,
    shouldLoadSentInvitations,
  }) =>
    shouldLoadSentInvitations &&
    isSentInvitationsError &&
    !isSentInvitationsLoading,
  ({ viewerError, viewerLoading }) => viewerError && !viewerLoading,
];

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
  const pageStatus = getHomePageStatus({
    isCoreHomeDataError,
    isCoreHomeDataLoading,
    isCoreHomeDataOfflineUnavailable,
    isSentInvitationsError,
    isSentInvitationsLoading,
    isSentInvitationsOfflineUnavailable,
    isViewerOfflineUnavailable,
    shouldLoadSentInvitations,
    viewerError,
    viewerLoading,
  });

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

  if (pageStatus === "offline") {
    return <HomeOfflineLaunchState onRetry={refetchHomePage} />;
  }

  if (pageStatus === "error") {
    return <HomePageErrorSection onRetry={refetchHomePage} />;
  }

  return (
    <HomePageContent
      hero={<HomeHero />}
      forgeRequest={<AutoForgeRequestStatus />}
      candidateAvailability={<CandidateAvailabilitySection />}
      sentInvitationsReview={getSentInvitationsReviewSlot({
        focusedInviteId,
        invitations: sentInvitations,
        onClose: clearInvitationFocus,
        shouldShow: focusedPanel === "invitations" && invitationView === "sent",
      })}
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

function getHomePageStatus(input: HomePageStatusInput): HomePageStatus {
  if (hasHomeOfflineUnavailable(input)) {
    return "offline";
  }

  return hasHomeBlockingError(input) ? "error" : "ready";
}

function hasHomeOfflineUnavailable(input: HomePageStatusInput) {
  return HOME_OFFLINE_BLOCKERS.some((isBlocked) => isBlocked(input));
}

function hasHomeBlockingError(input: HomePageStatusInput) {
  return HOME_ERROR_BLOCKERS.some((isBlocked) => isBlocked(input));
}

function HomePageErrorSection({ onRetry }: { onRetry: () => void }) {
  return (
    <section
      aria-label="Home error"
      className="mx-auto w-full max-w-screen-2xl px-4 pt-3 pb-8 sm:px-5 md:pt-6 lg:px-8"
    >
      <PageErrorState
        title="Home could not load"
        description="Your plans, groups, and invitations could not be refreshed right now."
        onRetry={onRetry}
      />
    </section>
  );
}

function getSentInvitationsReviewSlot({
  focusedInviteId,
  invitations,
  onClose,
  shouldShow,
}: {
  focusedInviteId: string | null;
  invitations: HomeDataState["sentInvitations"];
  onClose: () => void;
  shouldShow: boolean;
}) {
  if (!shouldShow) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <LazySentInvitationsReview
        focusedInviteId={focusedInviteId}
        invitations={invitations}
        onClose={onClose}
      />
    </Suspense>
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
  const { sentinelRef, shouldRender } = useDeferredRender({ rootMargin });

  return <div ref={sentinelRef}>{shouldRender ? children : fallback}</div>;
}
