import { useEffect, useRef } from "react";

import { FriendsInvitation } from "./components/friends-invitation";
import { GroupsGrid } from "./components/groups-grid";
import { HomeHero } from "./components/home-hero";
import { Invitations } from "./components/invitations";
import { SentInvitationsReview } from "./components/invitations/sent-invitations-review";
import { RecommendedGroups } from "./components/recommended-groups";
import { UpcomingPlans } from "./components/upcoming-plans";
import { PageErrorState } from "@/shared/components/page-error-state";
import { useHomeRouteState } from "./hooks/use-home-route-state";
import { useHomeData } from "./hooks/use-home-data";

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
