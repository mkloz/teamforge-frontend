import { GroupPlanDetailPageContent } from "@/features/group-plan-detail/group-plan-detail-page-content";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  GeneratedPageLoading,
  type PageLoadingProps,
} from "@/shared/components/loading/page-loading";

export const GROUP_PLAN_DETAIL_PAGE_SKELETON_NAME = "group-plan-detail.page";

const now = "2026-05-11T12:00:00.000Z";

export function GroupPlanDetailPageLoading(_props: PageLoadingProps = {}) {
  const fixture = <GroupPlanDetailPageLoadingFixture />;

  return (
    <GeneratedPageLoading
      name={GROUP_PLAN_DETAIL_PAGE_SKELETON_NAME}
      fixture={fixture}
    >
      {fixture}
    </GeneratedPageLoading>
  );
}

export function GroupPlanDetailPageLoadingFixture() {
  return <GroupPlanDetailPageContent detail={groupPlanDetailFixture} />;
}

const groupPlanDetailFixture: GroupPlanDetail = {
  group: {
    id: "group-gallery-night",
    name: "Gallery Night Crew",
    description:
      "A small, low-pressure group for an evening around new exhibits and a relaxed chat after.",
    avatar: null,
    status: "PLANNING",
    access: "OPEN",
    visibility: "PUBLIC",
    maxMembers: 6,
    activeMembersCount: 4,
    createdAt: now,
    updatedAt: now,
  },
  activity: {
    id: "activity-gallery-night",
    title: "Gallery night",
    city: "London",
    interests: [
      {
        id: "interest-art",
        name: "Art",
        slug: "art",
      },
      {
        id: "interest-coffee",
        name: "Coffee",
        slug: "coffee",
      },
    ],
  },
  plan: {
    id: "plan-gallery-night",
    title: "Evening at Tate Modern",
    description:
      "Meet by the main entrance, walk through the new exhibits, then decide together whether to stay nearby for coffee.",
    category: "ARTS",
    coverImage: null,
    status: "CONFIRMED",
    dateTime: "2026-05-18T18:45:00.000Z",
    locationMode: "IN_PERSON",
    location: "Tate Modern",
    locationLat: null,
    locationLng: null,
    cost: "FREE",
    costAmount: null,
    costDetails: "Free entry. Bring money only if you want coffee after.",
  },
  members: [
    member("member-alex", "user-alex", "Alex Morgan", "ADMIN", "ENFP", 0.94),
    member(
      "member-cody",
      "user-cody",
      "Cody Rivera",
      "MEMBER",
      "INTJ",
      0.88,
      "Friend of Maya",
    ),
    member("member-maya", "user-maya", "Maya Chen", "MEMBER", "ISFP", 0.84),
    member("member-noah", "user-noah", "Noah Patel", "MEMBER", "ENTP", 0.8),
  ],
  viewer: {
    userId: "user-alex",
    relationship: "MEMBER",
    role: "ADMIN",
    canJoin: false,
    canRequestToJoin: false,
    canCancelRequest: false,
    canOpenActivity: true,
    canSuggestPlanChange: true,
    canVoteOnPlanChange: true,
    canInviteMembers: true,
    canLeaveGroup: true,
    canManageGroup: true,
    pendingInviteId: null,
    joinDisabledReason: "ALREADY_MEMBER",
  },
  fit: {
    totalScore: 0.82,
    summary:
      "This group has strong overlap around low-pressure cultural plans, reliable attendance, and nearby location preferences.",
    signals: [
      {
        key: "SHARED_INTERESTS",
        label: "Shared interests",
        detail:
          "Several members overlap around art, coffee, and relaxed social plans.",
        strength: "HIGH",
      },
      {
        key: "SOCIAL_PACE",
        label: "Social pace",
        detail:
          "The group leans toward structured plans with room for easy conversation.",
        strength: "HIGH",
      },
      {
        key: "LOCATION",
        label: "Location",
        detail:
          "The plan is close enough for most members to reach without a long trip.",
        strength: "MEDIUM",
      },
      {
        key: "RELIABILITY",
        label: "Reliability",
        detail:
          "Members have a solid recent show-up pattern across planned activities.",
        strength: "MEDIUM",
      },
    ],
  },
  planning: {
    pendingProposalCount: 1,
    visibility: "PUBLIC_SUMMARY",
    proposals: [
      {
        id: "proposal-time",
        field: "DATE_TIME",
        currentValue: "2026-05-18T18:45:00.000Z",
        proposedValue: "2026-05-18T19:15:00.000Z",
        status: "PENDING",
        createdAt: "2026-05-11T11:30:00.000Z",
        updatedAt: "2026-05-11T11:30:00.000Z",
        resolvedAt: null,
        version: 1,
        planId: "plan-gallery-night",
        proposerId: "user-cody",
        proposer: {
          id: "user-cody",
          name: "Cody Rivera",
          avatar: null,
        },
        votes: [
          {
            userId: "user-maya",
            vote: "APPROVE",
            createdAt: "2026-05-11T11:45:00.000Z",
          },
        ],
      },
    ],
  },
  timestamps: {
    createdAt: now,
    updatedAt: now,
  },
};

function member(
  id: string,
  userId: string,
  name: string,
  role: GroupPlanDetail["members"][number]["role"],
  personalityType: GroupPlanDetail["members"][number]["personalityType"],
  compatibilityScore: number,
  knownConnection: string | null = null,
): GroupPlanDetail["members"][number] {
  return {
    id,
    userId,
    name,
    avatar: null,
    personalityType,
    trustScore: 0.86,
    compatibilityScore,
    role,
    joinedAt: now,
    knownConnection,
  };
}
