import { useEffect, useRef } from "react";
import { AttentionQueue } from "@/features/home/components/attention-queue";
import { FriendsInvitation } from "@/features/home/components/friends-invitation";
import { GroupsGrid } from "@/features/home/components/groups-grid";
import { HomeHero } from "@/features/home/components/home-hero";
import { RecommendedGroups } from "@/features/home/components/recommended-groups";
import { SentInvitationsReview } from "@/features/home/components/sent-invitations-review";
import { UpcomingPlans } from "@/features/home/components/upcoming-plans";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { useHomeRouteState } from "@/features/home/hooks/use-home-route-state";
import { PageErrorState } from "@/shared/components/page-error-state";

export function HomePage() {
  const { sentInvitations, isError, refetchAll } = useHomeData();
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
    <div className="mx-auto w-full max-w-screen-2xl overflow-x-clip px-4 pt-3 pb-28 sm:px-5 md:pt-6 md:pb-10 lg:px-8">
      <div className="lg:home-page-grid grid grid-cols-1 gap-9 lg:gap-12 xl:gap-14">
        <div className="flex min-w-0 flex-col gap-10 lg:gap-12">
          <HomeHero />
          {focusedPanel === "invitations" && invitationView === "sent" ? (
            <SentInvitationsReview
              focusedInviteId={focusedInviteId}
              invitations={sentInvitations}
              onClose={clearInvitationFocus}
            />
          ) : null}
          <AttentionQueue
            focusedPanel={focusedPanel}
            focusedInviteId={focusedInviteId}
            focusedRequestId={focusedRequestId}
            invitationView={invitationView}
            focusRef={invitationsRef}
            onClearInvitationFocus={clearInvitationFocus}
            onClearFriendRequestFocus={clearFriendRequestFocus}
          />
          <UpcomingPlans />
          <RecommendedGroups />
        </div>

        <aside
          aria-label="Active groups and sharing"
          className="flex min-w-0 flex-col gap-8"
        >
          <div className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-8">
            <GroupsGrid />
            <FriendsInvitation />
          </div>
        </aside>
      </div>
    </div>
  );
}
