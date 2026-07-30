import type { ReactNode } from "react";
import { HomeDayJourney } from "@/features/home/components/home-day-journey";
import { HomeJourneyPlans } from "@/features/home/components/home-journey-plans";

interface HomePageContentProps {
  attentionQueue: ReactNode;
  candidateAvailability?: ReactNode;
  friendsInvitation: ReactNode;
  groupsGrid: ReactNode;
  forgeRequest?: ReactNode;
  recommendedGroups: ReactNode;
  sentInvitationsReview?: ReactNode;
}

export function HomePageContent({
  attentionQueue,
  candidateAvailability,
  friendsInvitation,
  groupsGrid,
  forgeRequest,
  recommendedGroups,
  sentInvitationsReview,
}: HomePageContentProps) {
  return (
    <HomeDayJourney
      attention={attentionQueue}
      availability={candidateAvailability}
      forgeRequest={forgeRequest}
      groups={groupsGrid}
      invitationReview={sentInvitationsReview}
      inviteSomeone={friendsInvitation}
      openPlans={recommendedGroups}
      upcomingPlans={<HomeJourneyPlans />}
    />
  );
}
