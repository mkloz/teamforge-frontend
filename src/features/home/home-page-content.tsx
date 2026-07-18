import type { ReactNode } from "react";

interface HomePageContentProps {
  attentionQueue: ReactNode;
  candidateAvailability?: ReactNode;
  friendsInvitation: ReactNode;
  groupsGrid: ReactNode;
  hero: ReactNode;
  forgeRequest?: ReactNode;
  recommendedGroups: ReactNode;
  sentInvitationsReview?: ReactNode;
  upcomingPlans: ReactNode;
}

export function HomePageContent({
  attentionQueue,
  candidateAvailability,
  friendsInvitation,
  groupsGrid,
  hero,
  forgeRequest,
  recommendedGroups,
  sentInvitationsReview,
  upcomingPlans,
}: HomePageContentProps) {
  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 pt-3 pb-6 sm:px-5 md:pt-6 md:pb-10 lg:px-8">
      <div className="grid grid-cols-1 gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:gap-12 xl:gap-14">
        <div className="flex min-w-0 flex-col gap-10 lg:gap-12">
          {hero}
          {forgeRequest}
          {candidateAvailability}
          {sentInvitationsReview}
          {attentionQueue}
          {upcomingPlans}
          {recommendedGroups}
        </div>

        <aside
          aria-label="Active groups and sharing"
          className="flex min-w-0 flex-col gap-8 border-border/70 lg:border-l lg:pl-8 xl:pl-10"
        >
          <div className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-8">
            {groupsGrid}
            {friendsInvitation}
          </div>
        </aside>
      </div>
    </div>
  );
}
