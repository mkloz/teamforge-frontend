import { useEffect, useRef } from "react";

import { PageErrorState } from "@/shared/components/page-error-state";

import { FriendsInvitation } from "@/features/home/components/friends-invitation";
import { GroupsGrid } from "@/features/home/components/groups-grid";
import { HomeHero } from "@/features/home/components/home-hero";
import { Invitations } from "@/features/home/components/invitations";
import { SentInvitationsReview } from "@/features/home/components/invitations/sent-invitations-review";
import { RecommendedGroups } from "@/features/home/components/recommended-groups";
import { UpcomingPlans } from "@/features/home/components/upcoming-plans";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { useHomeRouteState } from "@/features/home/hooks/use-home-route-state";

export function HomePage() {
  const { sentInvitations, isError, refetchAll } = useHomeData();
  const {
    focusedInviteId,
    focusedPanel,
    invitationView,
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
      <main
        id="main-content"
        className="mx-auto w-full max-w-screen-2xl px-4 pt-2 pb-8 md:pt-6 lg:px-6"
      >
        <PageErrorState
          title="Home could not load"
          description="Your plans, groups, and invitations could not be refreshed right now."
          onRetry={refetchAll}
        />
      </main>
    );
  }

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 lg:px-6 pt-2 md:pt-6 pb-8">
      {/* 12-column grid: main column (8) + sticky sidebar (4) on lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left / main column: Hero → Plans → Recommendations */}
        <main
          id="main-content"
          className="col-span-1 lg:col-span-8 flex flex-col gap-12"
        >
          <HomeHero />
          <div className="h-px w-full bg-border/50" aria-hidden="true" />
          {focusedPanel === "invitations" && invitationView === "sent" ? (
            <SentInvitationsReview
              focusedInviteId={focusedInviteId}
              invitations={sentInvitations}
              onClose={clearInvitationFocus}
            />
          ) : null}
          <UpcomingPlans />
          <RecommendedGroups />
        </main>

        {/* Right / sidebar column: Groups grid + Stats (sticky on desktop) */}
        <aside
          aria-label="Your groups and stats"
          className="col-span-1 lg:col-span-4 flex flex-col gap-8"
        >
          <div className="lg:sticky lg:top-8 flex flex-col gap-8">
            <Invitations
              focusedInviteId={focusedInviteId}
              focusedView={invitationView}
              focusRef={invitationsRef}
              onClearFocus={clearInvitationFocus}
            />
            <GroupsGrid />
            <div className="h-px w-full bg-border/30" aria-hidden="true" />
            <FriendsInvitation />
          </div>
        </aside>
      </div>
    </div>
  );
}
