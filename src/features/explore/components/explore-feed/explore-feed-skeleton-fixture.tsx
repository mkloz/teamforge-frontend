import { ExploreFeedContent } from "@/features/explore/components/explore-feed/explore-feed-content";
import type { ExploreGroup } from "@/shared/schemas";

export const EXPLORE_FEED_SKELETON_NAME = "explore.feed";

export const exploreGroupFixtures = [
  {
    id: "explore-fixture-film",
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
      id: "activity-film",
      title: "Catch an indie screening",
      city: "Bristol",
      visibility: "PUBLIC",
      access: "BY_REQUEST",
      interests: [
        {
          id: "interest-film",
          name: "Indie film",
          slug: "indie-film",
        },
        {
          id: "interest-coffee",
          name: "Coffee",
          slug: "coffee",
        },
      ],
    },
    plan: {
      id: "plan-film",
      title: "Friday screening and cafe debrief",
      category: "ARTS",
      dateTime: "2026-05-15T19:00:00.000Z",
      locationMode: "IN_PERSON",
      cost: "PAID",
    },
    members: [
      {
        id: "member-1",
        name: "Maya Rivera",
        avatar: null,
        personalityType: "ENFP",
        trustScore: 88,
      },
      {
        id: "member-2",
        name: "Sam Chen",
        avatar: null,
        personalityType: "INFJ",
        trustScore: 76,
      },
      {
        id: "member-3",
        name: "Noor Patel",
        avatar: null,
        personalityType: "INTP",
        trustScore: 81,
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
  {
    id: "explore-fixture-climb",
    name: "Sunday Bouldering",
    description: "A relaxed climbing group with coffee after.",
    avatar: null,
    status: "FORMING",
    maxMembers: 5,
    updatedAt: "2026-05-09T16:00:00.000Z",
    version: 1,
    activeMembersCount: 3,
    access: "OPEN",
    activity: {
      id: "activity-climb",
      title: "Low-pressure bouldering session",
      city: "Bristol",
      visibility: "PUBLIC",
      access: "OPEN",
      interests: [
        {
          id: "interest-climbing",
          name: "Bouldering",
          slug: "bouldering",
        },
      ],
    },
    plan: {
      id: "plan-climb",
      title: "Bouldering and coffee",
      category: "SPORTS",
      dateTime: "2026-05-17T11:00:00.000Z",
      locationMode: "IN_PERSON",
      cost: "PAID",
    },
    members: [
      {
        id: "member-4",
        name: "Iris Cole",
        avatar: null,
        personalityType: "ISFP",
        trustScore: 72,
      },
      {
        id: "member-5",
        name: "Leo Grant",
        avatar: null,
        personalityType: "ESTP",
        trustScore: 69,
      },
    ],
    compatibility: {
      interestOverlap: 74,
      personalityCompatibility: 71,
      cityAlignment: 90,
      ageAlignment: 80,
      trustScore: 75,
      friendshipProximity: 35,
      total: 76,
    },
  },
  {
    id: "explore-fixture-design",
    name: "Design Crit Circle",
    description: "Bring a thing you are making and get clear feedback.",
    avatar: null,
    status: "FORMING",
    maxMembers: 8,
    updatedAt: "2026-05-08T12:00:00.000Z",
    version: 1,
    activeMembersCount: 5,
    access: "BY_REQUEST",
    activity: {
      id: "activity-design",
      title: "Design critique evening",
      city: "Bristol",
      visibility: "PUBLIC",
      access: "BY_REQUEST",
      interests: [
        {
          id: "interest-design",
          name: "Design critique",
          slug: "design-critique",
        },
      ],
    },
    plan: {
      id: "plan-design",
      title: "Product teardown night",
      category: "TECH",
      dateTime: "2026-05-20T18:30:00.000Z",
      locationMode: "ONLINE",
      cost: "FREE",
    },
    members: [
      {
        id: "member-6",
        name: "Ari Stone",
        avatar: null,
        personalityType: "ENTP",
        trustScore: 82,
      },
      {
        id: "member-7",
        name: "Talia Brooks",
        avatar: null,
        personalityType: "INTJ",
        trustScore: 79,
      },
    ],
    compatibility: {
      interestOverlap: 79,
      personalityCompatibility: 73,
      cityAlignment: 66,
      ageAlignment: 82,
      trustScore: 81,
      friendshipProximity: 41,
      total: 78,
    },
  },
] satisfies ExploreGroup[];

export function ExploreFeedSkeletonFixture() {
  return <ExploreFeedContent groups={exploreGroupFixtures} />;
}
