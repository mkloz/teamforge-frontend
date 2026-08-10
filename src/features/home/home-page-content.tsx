import type { ReactNode } from "react";
import { HomeDayJourney } from "@/features/home/components/home-day-journey";
import { HomeJourneyPlans } from "@/features/home/components/home-journey-plans";

interface HomePageContentProps {
  accountReadiness?: ReactNode;
  attentionQueue: ReactNode;
  groupProposalAvailability?: ReactNode;
  friendsInvitation: ReactNode;
  groupsGrid: ReactNode;
  groupFormationRequest?: ReactNode;
  recommendedGroups: ReactNode;
  sentInvitationsReview?: ReactNode;
}

export function HomePageContent({
  accountReadiness,
  attentionQueue,
  groupProposalAvailability,
  friendsInvitation,
  groupsGrid,
  groupFormationRequest,
  recommendedGroups,
  sentInvitationsReview,
}: HomePageContentProps) {
  return (
    <HomeDayJourney
      accountReadiness={accountReadiness}
      attention={attentionQueue}
      availability={groupProposalAvailability}
      groupFormationRequest={groupFormationRequest}
      groups={groupsGrid}
      invitationReview={sentInvitationsReview}
      inviteSomeone={friendsInvitation}
      openPlans={recommendedGroups}
      upcomingPlans={<HomeJourneyPlans />}
    />
  );
}
