import { useEffect, useRef } from "react";
import { AttentionQueue } from "@/features/home/components/attention-queue";
import { FriendsInvitation } from "@/features/home/components/friends-invitation";
import { GroupsGrid } from "@/features/home/components/groups-grid";
import { HomeHero } from "@/features/home/components/home-hero";
import { RecommendedGroups } from "@/features/home/components/recommended-groups";
import { SentInvitationsReview } from "@/features/home/components/sent-invitations-review";
import { UpcomingPlans } from "@/features/home/components/upcoming-plans";
import { HomePageLoading } from "@/features/home/home-page.loading";
import { HomePageContent } from "@/features/home/home-page-content";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { useHomeRouteState } from "@/features/home/hooks/use-home-route-state";
import { useHomeViewerState } from "@/features/home/hooks/use-home-viewer";
import { PageErrorState } from "@/shared/components/page-error-state";

export function HomePage() {
  const { sentInvitations, isLoading, isError, refetchAll } = useHomeData();
  const { isLoading: viewerLoading } = useHomeViewerState();
  const {
    focusedInviteId,
    focusedPanel,
    focusedRequestId,
    invitationView,
    clearFriendRequestFocus,
    clearInvitationFocus,
  } = useHomeRouteState();
  const invitationsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (focusedPanel !== "invitations") {
      return;
    }

    invitationsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [focusedPanel]);

  if (isLoading || viewerLoading) {
    return <HomePageLoading mode="query" />;
  }

  if (isError) {
    return (
      <section
        aria-label="Home error"
        className="mx-auto w-full max-w-screen-2xl px-4 pt-3 pb-8 sm:px-5 md:pt-6 lg:px-8"
      >
        <PageErrorState
          title="Home could not load"
          description="Your plans, groups, and invitations could not be refreshed right now."
          onRetry={refetchAll}
        />
      </section>
    );
  }

  return (
    <HomePageContent
      hero={<HomeHero />}
      sentInvitationsReview={
        focusedPanel === "invitations" && invitationView === "sent" ? (
          <SentInvitationsReview
            focusedInviteId={focusedInviteId}
            invitations={sentInvitations}
            onClose={clearInvitationFocus}
          />
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
      upcomingPlans={<UpcomingPlans />}
      recommendedGroups={<RecommendedGroups />}
      groupsGrid={<GroupsGrid />}
      friendsInvitation={<FriendsInvitation />}
    />
  );
}
