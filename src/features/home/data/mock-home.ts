import type {
  GroupInvitation,
  RecommendedGroup,
  UpcomingPlan,
  UserGroup,
  UserStats,
} from "../types/home.types";
import type { PersonalityType } from "@/shared/schemas/enums";
import type { Group, GroupMember, User } from "@/shared/schemas";

export const MOCK_CURRENT_USER: { firstName: string; mbti: PersonalityType } = {
  firstName: "Alex",
  mbti: "INTJ",
};

export const MOCK_USER_STATS: UserStats = {
  trustScore: 98,
  groupsJoined: 7,
  activitiesDone: 23,
  connections: 41,
  profileCompleteness: 85,
};

const NOW = new Date().toISOString();

const createMockUser = (
  id: string,
  fullName: string,
  personalityType: PersonalityType,
): User => ({
  id,
  email: `${id}@example.com`,
  fullName,
  avatar: `https://i.pravatar.cc/150?u=${id}`,
  bio: null,
  authProvider: "EMAIL",
  emailVerified: true,
  createdAt: NOW,
  updatedAt: NOW,
  age: 25,
  gender: "OTHER",
  city: "San Diego",
  personalityType,
  oceanO: 0.7,
  oceanC: 0.7,
  oceanE: 0.7,
  oceanA: 0.7,
  oceanN: 0.3,
  searchStatus: "IDLE",
  trustScore: 90,
  profileComplete: true,
  interests: [],
});

const createMockGroupMember = (
  userId: string,
  groupId: string,
  role: "ADMIN" | "MODERATOR" | "MEMBER" = "MEMBER",
): GroupMember => ({
  userId,
  groupId,
  role,
  joinedAt: NOW,
  leftAt: null,
  compatibilityScore: 90,
});

const createMockGroup = (
  id: string,
  name: string,
  description: string,
): Group => ({
  id,
  name,
  description,
  avatar: id,
  status: "ACTIVE",
  maxMembers: 8,
  createdAt: NOW,
  updatedAt: NOW,
  disbandedAt: null,
  activityId: `act-${id}`,
  activity: {
    id: `act-${id}`,
    title: name,
    description: `Activity for ${name}`,
    city: "San Diego",
    locationLat: 32.7157,
    locationLng: -117.1611,
    visibility: "PUBLIC",
    access: "OPEN",
    forgeMode: "AUTO",
    status: "OPEN",
    createdAt: NOW,
    updatedAt: NOW,
    creatorId: "u1",
  },
  plan: {
    id: `plan-${id}`,
    groupId: id,
    title: `Next meet for ${name}`,
    description: "Meeting up for our regular session.",
    category: "SOCIAL",
    coverImage:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=400",
    status: "CONFIRMED",
    dateTime: NOW,
    locationMode: "IN_PERSON",
    location: "Downtown San Diego",
    locationLat: 32.7157,
    locationLng: -117.1611,
    cost: "FREE",
    costAmount: null,
    costDetails: null,
    completedAt: null,
    cancelledAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  members: [],
});

export const MOCK_UPCOMING_PLANS: UpcomingPlan[] = [
  {
    id: "1",
    title: "Saturday Morning Bouldering",
    description: "Weekly climbing session at Mesa Rim.",
    category: "OUTDOORS",
    coverImage:
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=400",
    status: "CONFIRMED",
    dateTime: "2026-10-14T10:00:00Z",
    locationMode: "IN_PERSON",
    location: "Mesa Rim Climbing Gym",
    locationLat: 32.7157,
    locationLng: -117.1611,
    cost: "PAID",
    costAmount: 25,
    costDetails: "Day pass required",
    createdAt: NOW,
    updatedAt: NOW,
    completedAt: null,
    cancelledAt: null,
    groupId: "group-1",
    group: {
      ...createMockGroup(
        "group-1",
        "Mesa Rim Climbers",
        "Climbing enthusiasts in San Diego",
      ),
      members: Array.from({ length: 5 }).map((_, i) => ({
        ...createMockGroupMember(
          `u${i + 1}`,
          "group-1",
          i === 0 ? "ADMIN" : "MEMBER",
        ),
        user: createMockUser(
          `u${i + 1}`,
          ["Alex", "Jordan", "Sam", "Taylor", "Morgan"][i],
          "INTJ",
        ),
      })),
    },
  },
  {
    id: "2",
    title: "React UI Architecture Deep Dive",
    description: "Discussing the latest frontend patterns.",
    category: "TECH",
    coverImage:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=400",
    status: "CONFIRMED",
    dateTime: "2026-10-15T14:00:00Z",
    locationMode: "ONLINE",
    location: "Google Meet",
    locationLat: null,
    locationLng: null,
    cost: "FREE",
    costAmount: null,
    costDetails: null,
    createdAt: NOW,
    updatedAt: NOW,
    completedAt: null,
    cancelledAt: null,
    groupId: "group-2",
    group: {
      ...createMockGroup(
        "group-2",
        "Frontend Masters Guild",
        "Advanced React discussion group",
      ),
      members: Array.from({ length: 3 }).map((_, i) => ({
        ...createMockGroupMember(
          `u${i + 4}`,
          "group-2",
          i === 0 ? "ADMIN" : "MEMBER",
        ),
        user: createMockUser(
          `u${i + 4}`,
          ["Riley", "Morgan", "Casey"][i],
          "ENTJ",
        ),
      })),
    },
  },
  {
    id: "3",
    title: "Tabletop Game Night",
    description: "Playing Catan and Terraforming Mars.",
    category: "GAMING",
    coverImage:
      "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=400",
    status: "PROPOSED",
    dateTime: "2026-10-16T19:00:00Z",
    locationMode: "IN_PERSON",
    location: "The Boardroom Cafe",
    locationLat: 32.7157,
    locationLng: -117.1611,
    cost: "FREE",
    costAmount: null,
    costDetails: null,
    createdAt: NOW,
    updatedAt: NOW,
    completedAt: null,
    cancelledAt: null,
    groupId: "group-3",
    group: {
      ...createMockGroup("group-3", "Strategy Seekers", "Board game lovers"),
      members: Array.from({ length: 4 }).map((_, i) => ({
        ...createMockGroupMember(`u${i + 10}`, "group-3"),
        user: createMockUser(`u${i + 10}`, "Player", "ISTP"),
      })),
    },
  },
  {
    id: "4",
    title: "Beach Yoga & Meditation",
    description: "Sunrise session at Pacific Beach.",
    category: "WELLNESS",
    coverImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400",
    status: "CONFIRMED",
    dateTime: "2026-10-18T06:30:00Z",
    locationMode: "IN_PERSON",
    location: "Pacific Beach, Lifeguard Tower 23",
    locationLat: 32.7946,
    locationLng: -117.2554,
    cost: "FREE",
    costAmount: null,
    costDetails: null,
    createdAt: NOW,
    updatedAt: NOW,
    completedAt: null,
    cancelledAt: null,
    groupId: "group-4",
    group: {
      ...createMockGroup("group-4", "Zen Flow Collective", "Yoga community"),
      members: Array.from({ length: 6 }).map((_, i) => ({
        ...createMockGroupMember(`u${i + 20}`, "group-4"),
        user: createMockUser(`u${i + 20}`, "Yogi", "INFJ"),
      })),
    },
  },
];

export const MOCK_USER_GROUPS: UserGroup[] = [
  {
    ...createMockGroup(
      "1",
      "Mesa Rim Climbers",
      "Climbing enthusiasts in San Diego",
    ),
    lastActivity: "2h ago",
    hasUnread: true,
  },
  {
    ...createMockGroup(
      "2",
      "Frontend Masters",
      "Advanced React discussion group",
    ),
    lastActivity: "5h ago",
    hasUnread: false,
  },
  {
    ...createMockGroup(
      "3",
      "Craft Coffee Crawl",
      "Exploring the best roasters in the city",
    ),
    status: "PLANNING",
    lastActivity: "1d ago",
    hasUnread: true,
  },
  {
    ...createMockGroup(
      "4",
      "Night Owls Coding",
      "Late night co-working and building",
    ),
    lastActivity: "15m ago",
    hasUnread: false,
  },
];

export const MOCK_INVITATIONS: GroupInvitation[] = [
  {
    id: "inv-1",
    group: createMockGroup(
      "group-3",
      "Sunday Trail Runners",
      "Outdoor running group",
    ),
    invitedBy: createMockUser("u2", "Jordan Kim", "ENFP"),
    receivedAt: "2h ago",
  },
  {
    id: "inv-2",
    group: createMockGroup(
      "group-5",
      "Sushi Saturday",
      "Omakase experience at Ota",
    ),
    invitedBy: createMockUser("u12", "Emi Sato", "ISFJ"),
    receivedAt: "5h ago",
  },
  {
    id: "inv-3",
    group: createMockGroup(
      "group-6",
      "Design Systems Workshop",
      "Building accessible components",
    ),
    invitedBy: createMockUser("u44", "Marcus Aurelius", "INFJ"),
    receivedAt: "1d ago",
  },
];

export const MOCK_RECOMMENDED_GROUPS: RecommendedGroup[] = [
  {
    ...createMockGroup(
      "rec-1",
      "Midnight Jazz Collective",
      "Late night jam sessions",
    ),
    status: "PLANNING",
    matchScore: 91,
    distance: "1.2 miles",
    personalizationCue: "Matches your creative profile",
    plan: {
      ...createMockGroup("rec-1", "Jazz", "Jazz").plan!,
      title: "Midnight Jazz & Improvisation",
      category: "MUSIC",
      coverImage:
        "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=400",
    },
  },
  {
    ...createMockGroup(
      "rec-2",
      "San Diego Tech Hikers",
      "Networking while hiking",
    ),
    matchScore: 88,
    distance: "4.5 miles",
    personalizationCue: "Popular in your city",
    plan: {
      ...createMockGroup("rec-2", "Hike", "Hike").plan!,
      title: "Cowles Mountain Networking Hike",
      category: "OUTDOORS",
      coverImage:
        "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=400",
    },
  },
  {
    ...createMockGroup(
      "rec-3",
      "Indie Film Society",
      "Weekly screenings of niche cinema",
    ),
    matchScore: 94,
    distance: "0.8 miles",
    personalizationCue: "Based on your interest in Arts",
    plan: {
      ...createMockGroup("rec-3", "Film", "Film").plan!,
      title: "Wes Anderson Marathon",
      category: "ARTS",
      coverImage:
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400",
    },
  },
];
