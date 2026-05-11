import { Bell } from "lucide-react";
import { useRef } from "react";

import {
  AttentionQueueView,
  type AttentionQueueViewState,
} from "@/features/home/components/attention-queue";
import { FriendsInvitation } from "@/features/home/components/friends-invitation";
import { GroupsGridView } from "@/features/home/components/groups-grid";
import { HomeHeroView } from "@/features/home/components/home-hero";
import { RecommendedGroupsView } from "@/features/home/components/recommended-groups";
import { UpcomingPlansView } from "@/features/home/components/upcoming-plans";
import { HomePageContent } from "@/features/home/home-page-content";
import type {
  HomeViewer,
  PlannedGroup,
  UserStats,
} from "@/features/home/lib/home-contract";
import { Button } from "@/shared/components/ui/button";
import type { ExploreGroup, FriendshipApi, Invite } from "@/shared/schemas";

export const HOME_PAGE_SKELETON_NAME = "home.page";

const fixtureViewer = {
  firstName: "Maya",
  mbti: "ENFP",
  nextStep: null,
} satisfies HomeViewer;

const fixtureStats = {
  trustScore: 84,
  groupsJoined: 3,
  activitiesDone: 7,
  connections: 18,
  profileCompleteness: 92,
} satisfies UserStats;

const fixtureMembers = [
  {
    userId: "fixture-member-maya",
    role: "ADMIN",
    joinedAt: "2026-05-01T12:00:00.000Z",
    leftAt: null,
    compatibilityScore: 91,
    user: {
      id: "fixture-member-maya",
      name: "Maya Rivera",
      avatar: null,
      personalityType: "ENFP",
      trustScore: 88,
      onlineStatus: "ONLINE",
    },
  },
  {
    userId: "fixture-member-sam",
    role: "MEMBER",
    joinedAt: "2026-05-02T12:00:00.000Z",
    leftAt: null,
    compatibilityScore: 82,
    user: {
      id: "fixture-member-sam",
      name: "Sam Chen",
      avatar: null,
      personalityType: "INFJ",
      trustScore: 76,
      onlineStatus: "AWAY",
    },
  },
  {
    userId: "fixture-member-noor",
    role: "MEMBER",
    joinedAt: "2026-05-03T12:00:00.000Z",
    leftAt: null,
    compatibilityScore: 79,
    user: {
      id: "fixture-member-noor",
      name: "Noor Patel",
      avatar: null,
      personalityType: "INTP",
      trustScore: 81,
      onlineStatus: "OFFLINE",
    },
  },
] satisfies PlannedGroup["members"];

const fixtureGroups = [
  createPlannedGroup({
    id: "fixture-board-games",
    name: "Board Game Circle",
    planId: "fixture-board-games-plan",
    planStatus: "PROPOSED",
    planTitle: "Vote on Thursday evening",
    dateTime: "2026-05-14T18:30:00.000Z",
    updatedAt: "2026-05-11T08:35:00.000Z",
  }),
  createPlannedGroup({
    id: "fixture-code-coffee",
    name: "Coffee and Code Review",
    planId: "fixture-code-coffee-plan",
    planStatus: "CONFIRMED",
    planTitle: "Coffee and code review",
    dateTime: "2026-05-15T10:00:00.000Z",
    updatedAt: "2026-05-10T17:00:00.000Z",
  }),
  createPlannedGroup({
    id: "fixture-climbing",
    name: "Low-key Climbing",
    planId: "fixture-climbing-plan",
    planStatus: "CONFIRMED",
    planTitle: "Low-key climbing session",
    dateTime: "2026-05-17T11:00:00.000Z",
    updatedAt: "2026-05-09T13:00:00.000Z",
  }),
] satisfies PlannedGroup[];

const fixtureInvitation = {
  id: "fixture-invite-study-walk",
  type: "FRIEND_INVITE",
  status: "PENDING",
  message: "This feels like your kind of group.",
  createdAt: "2026-05-10T12:00:00.000Z",
  updatedAt: "2026-05-10T12:00:00.000Z",
  expiresAt: "2026-05-14T12:00:00.000Z",
  respondedAt: null,
  version: 1,
  groupId: "fixture-study-walk",
  inviteeId: "fixture-member-maya",
  inviterId: "fixture-inviter-iris",
  group: {
    id: "fixture-study-walk",
    name: "Quiet Makers",
    avatar: null,
    status: "FORMING",
    maxMembers: 6,
    activeMembersCount: 4,
  },
  invitee: {
    id: "fixture-member-maya",
    name: "Maya Rivera",
    avatar: null,
    personalityType: "ENFP",
    trustScore: 88,
  },
  inviter: {
    id: "fixture-inviter-iris",
    name: "Iris Cole",
    avatar: null,
    personalityType: "ISFP",
    trustScore: 72,
  },
} satisfies Invite;

const fixtureFriendRequest = {
  requesterId: "fixture-requester-leo",
  receiverId: "fixture-member-maya",
  privateChatId: null,
  status: "PENDING",
  createdAt: "2026-05-10T16:00:00.000Z",
  updatedAt: "2026-05-10T16:00:00.000Z",
  version: 1,
  requester: {
    id: "fixture-requester-leo",
    name: "Leo Grant",
    avatar: null,
    city: "Bristol",
    personalityType: "ESTP",
    trustScore: 69,
    onlineStatus: "ONLINE",
  },
  receiver: {
    id: "fixture-member-maya",
    name: "Maya Rivera",
    avatar: null,
    city: "Bristol",
    personalityType: "ENFP",
    trustScore: 88,
    onlineStatus: "ONLINE",
  },
  counterpart: {
    id: "fixture-requester-leo",
    name: "Leo Grant",
    avatar: null,
    city: "Bristol",
    personalityType: "ESTP",
    trustScore: 69,
    onlineStatus: "ONLINE",
  },
  privateChat: null,
} satisfies FriendshipApi;

const fixtureRecommendations = [
  {
    id: "fixture-film-circle",
    name: "Indie Film Circle",
    description: "A small group for thoughtful screenings and conversation.",
    avatar: null,
    status: "FORMING",
    maxMembers: 6,
    updatedAt: "2026-05-10T18:30:00.000Z",
    version: 1,
    activeMembersCount: 4,
    access: "BY_REQUEST",
    activity: {
      id: "fixture-film-activity",
      title: "Catch an indie screening",
      city: "Bristol",
      visibility: "PUBLIC",
      access: "BY_REQUEST",
      interests: [
        {
          id: "fixture-interest-film",
          name: "Indie film",
          slug: "indie-film",
        },
        {
          id: "fixture-interest-coffee",
          name: "Coffee",
          slug: "coffee",
        },
      ],
    },
    plan: {
      id: "fixture-film-plan",
      title: "Friday screening and cafe debrief",
      category: "ARTS",
      dateTime: "2026-05-15T19:00:00.000Z",
      locationMode: "IN_PERSON",
      cost: "PAID",
    },
    members: [
      {
        id: "fixture-member-ari",
        name: "Ari Stone",
        avatar: null,
        personalityType: "ENTP",
        trustScore: 82,
      },
      {
        id: "fixture-member-talia",
        name: "Talia Brooks",
        avatar: null,
        personalityType: "INTJ",
        trustScore: 79,
      },
    ],
    compatibility: {
      interestOverlap: 86,
      personalityCompatibility: 78,
      cityAlignment: 92,
      ageAlignment: 84,
      trustScore: 88,
      friendshipProximity: 52,
      total: 83,
    },
  },
] satisfies ExploreGroup[];

const noopAsync = async () => undefined;

export function HomePageSkeletonFixture() {
  const attentionRef = useRef<HTMLElement | null>(null);
  const attentionState = {
    acceptingInviteId: null,
    acceptingRequestId: null,
    actionError: null,
    acceptVisibleInvite: noopAsync,
    acceptVisibleRequest: noopAsync,
    declineVisibleInvite: noopAsync,
    declineVisibleRequest: noopAsync,
    decliningInviteId: null,
    decliningRequestId: null,
    isAccepting: false,
    isAcceptingInvite: false,
    isDeclining: false,
    isDecliningInvite: false,
    proposedPlans: [fixtureGroups[0]],
    queueSize: 3,
    shouldShowSkeleton: false,
    viewer: fixtureViewer,
    visibleInvitations: [fixtureInvitation],
    visibleRequests: [fixtureFriendRequest],
  } satisfies AttentionQueueViewState;

  return (
    <HomePageContent
      hero={
        <HomeHeroView
          groups={fixtureGroups}
          invitations={[fixtureInvitation]}
          notificationButton={<FixtureNotificationButton />}
          plans={fixtureGroups}
          recommendations={fixtureRecommendations}
          stats={fixtureStats}
          viewer={fixtureViewer}
        />
      }
      attentionQueue={
        <AttentionQueueView scrollRef={attentionRef} state={attentionState} />
      }
      upcomingPlans={<UpcomingPlansView plans={fixtureGroups} />}
      recommendedGroups={
        <RecommendedGroupsView recommendations={fixtureRecommendations} />
      }
      groupsGrid={<GroupsGridView groups={fixtureGroups} />}
      friendsInvitation={<FriendsInvitation />}
    />
  );
}

function FixtureNotificationButton() {
  return (
    <Button
      type="button"
      variant="surface"
      size="icon"
      aria-label="View notifications (2 unread)"
      className="relative size-11 shrink-0 rounded-lg"
    >
      <Bell className="size-5" aria-hidden="true" />
      <span
        className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-spark-amber px-1 font-black text-ink text-xs"
        aria-hidden="true"
      >
        2
      </span>
    </Button>
  );
}

function createPlannedGroup({
  dateTime,
  id,
  name,
  planId,
  planStatus,
  planTitle,
  updatedAt,
}: {
  dateTime: string;
  id: string;
  name: string;
  planId: string;
  planStatus: PlannedGroup["plan"]["status"];
  planTitle: string;
  updatedAt: string;
}): PlannedGroup {
  return {
    id,
    name,
    description: "A focused group with a real plan attached.",
    avatar: null,
    status: "ACTIVE",
    maxMembers: 6,
    createdAt: "2026-05-01T12:00:00.000Z",
    updatedAt,
    version: Date.parse(updatedAt),
    disbandedAt: null,
    activityId: `${id}-activity`,
    activity: {
      id: `${id}-activity`,
      title: planTitle,
      city: "Bristol",
      status: "OPEN",
      visibility: "PUBLIC",
      access: "BY_REQUEST",
      forgeMode: "AUTO",
      interests: [
        {
          id: `${id}-interest`,
          name: "Shared plans",
          slug: "shared-plans",
        },
      ],
    },
    plan: {
      id: planId,
      title: planTitle,
      category: "SOCIAL",
      status: planStatus,
      dateTime,
      locationMode: "IN_PERSON",
      location: "Harbourside",
      locationLat: 51.4545,
      locationLng: -2.5879,
      cost: "FREE",
    },
    chat: {
      id: `${id}-chat`,
      pinnedMessages: [],
    },
    members: fixtureMembers,
  };
}
