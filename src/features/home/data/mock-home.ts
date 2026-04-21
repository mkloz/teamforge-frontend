import type {
  RecommendedGroup,
  UpcomingPlan,
  UserGroup,
  UserStats,
} from "../types/home.types";

export const MOCK_CURRENT_USER = {
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

export const MOCK_UPCOMING_PLANS: UpcomingPlan[] = [
  {
    id: "1",
    title: "Saturday Morning Bouldering",
    date: "Sat, Oct 14 • 10:00 AM",
    groupName: "Mesa Rim Climbers",
    status: "confirmed",
    memberAvatarSeeds: ["alex", "jordan", "sam"],
    category: "Outdoors",
  },
  {
    id: "2",
    title: "React UI Architecture Deep Dive",
    date: "Sun, Oct 15 • 2:00 PM",
    groupName: "Frontend Masters Guild",
    status: "confirmed",
    memberAvatarSeeds: ["riley", "morgan", "casey", "drew"],
    category: "Tech",
  },
  {
    id: "3",
    title: "Casual Coffee & Sketching",
    date: "Wed, Oct 18 • 6:30 PM",
    groupName: "Creative Brews",
    status: "pending",
    memberAvatarSeeds: ["taylor", "quinn"],
    category: "Arts",
  },
];

export const MOCK_USER_GROUPS: UserGroup[] = [
  {
    id: "1",
    name: "Mesa Rim Climbers",
    avatarSeed: "mesa-rim",
    memberCount: 4,
    lastActivity: "2h ago",
    hasUnread: true,
  },
  {
    id: "2",
    name: "Frontend Masters",
    avatarSeed: "frontend-masters",
    memberCount: 6,
    lastActivity: "5h ago",
    hasUnread: false,
  },
  {
    id: "3",
    name: "Creative Brews",
    avatarSeed: "creative-brews",
    memberCount: 3,
    lastActivity: "Yesterday",
    hasUnread: true,
  },
  {
    id: "4",
    name: "SD Hikers",
    avatarSeed: "sd-hikers",
    memberCount: 8,
    lastActivity: "2d ago",
    hasUnread: false,
  },
  {
    id: "5",
    name: "Book Club",
    avatarSeed: "book-club",
    memberCount: 5,
    lastActivity: "3d ago",
    hasUnread: false,
  },
  {
    id: "6",
    name: "Jazz Sessions",
    avatarSeed: "jazz-sessions",
    memberCount: 4,
    lastActivity: "1w ago",
    hasUnread: false,
  },
];

export const MOCK_RECOMMENDED_GROUPS: RecommendedGroup[] = [
  {
    id: "1",
    name: "Midnight Jazz Collective",
    activityType: "Music",
    imageUrl:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600&auto=format&fit=crop",
    compatibility: 91,
    memberCount: 5,
    memberAvatarSeeds: ["a", "b", "c", "d"],
    access: "Open",
    personalizationCue: "Matches your creative profile",
  },
  {
    id: "2",
    name: "Sunday Strength Training",
    activityType: "Wellness",
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop",
    compatibility: 84,
    memberCount: 3,
    memberAvatarSeeds: ["e", "f", "g"],
    access: "Open",
    personalizationCue: "Popular in your area",
  },
  {
    id: "3",
    name: "Philosophy & Coffee",
    activityType: "Social",
    imageUrl:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=600&auto=format&fit=crop",
    compatibility: 78,
    memberCount: 4,
    memberAvatarSeeds: ["h", "i", "j", "k"],
    access: "By Request",
    personalizationCue: "Based on your interests",
  },
];
