import type {
  GroupInvitation,
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

export const MOCK_INVITATIONS: GroupInvitation[] = [
  {
    id: "inv-1",
    groupName: "Sunday Trail Runners",
    avatarSeed: "trail-runners",
    invitedBy: "Jordan Kim",
    inviterAvatarSeed: "jordan-kim",
    memberCount: 5,
    activityType: "Outdoors",
    receivedAt: "2h ago",
  },
  {
    id: "inv-2",
    groupName: "Indie Film Watchers",
    avatarSeed: "indie-film",
    invitedBy: "Riley Park",
    inviterAvatarSeed: "riley-park",
    memberCount: 3,
    activityType: "Arts",
    receivedAt: "Yesterday",
  },
];

export const MOCK_RECOMMENDED_GROUPS: RecommendedGroup[] = [
  {
    id: "1",
    matchScore: 91,
    title: "Midnight Jazz & Improvisation",
    groupName: "Midnight Jazz Collective",
    imageUrl:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600&auto=format&fit=crop",
    date: "Fri, Oct 20 • 11:00 PM",
    distance: "1.2 miles",
    locationMode: "In-Person",
    cost: "Free",
    category: "Music",
    currentSize: 5,
    capacity: 8,
    access: "Open",
    personalizationCue: "Matches your creative profile",
  },
  {
    id: "2",
    matchScore: 84,
    title: "High-Intensity Circuit Training",
    groupName: "Sunday Strength Training",
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop",
    date: "Sun, Oct 22 • 9:00 AM",
    distance: "0.8 miles",
    locationMode: "In-Person",
    cost: "Free",
    category: "Wellness",
    currentSize: 3,
    capacity: 6,
    access: "Open",
    personalizationCue: "Popular in your area",
  },
  {
    id: "3",
    matchScore: 78,
    title: "Stoicism & Existentialism Discussion",
    groupName: "Philosophy & Coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=600&auto=format&fit=crop",
    date: "Sat, Oct 21 • 10:30 AM",
    distance: "2.5 miles",
    locationMode: "In-Person",
    cost: "Paid",
    category: "Social",
    currentSize: 4,
    capacity: 5,
    access: "By Request",
    personalizationCue: "Based on your interests",
  },
  {
    id: "4",
    matchScore: 94,
    title: "Balboa Park Golden Hour Shoot",
    groupName: "Golden Hour Photo Walk",
    imageUrl:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600&auto=format&fit=crop",
    date: "Tue, Oct 24 • 5:45 PM",
    distance: "3.1 miles",
    locationMode: "In-Person",
    cost: "Free",
    category: "Creative",
    currentSize: 6,
    capacity: 10,
    access: "Open",
    personalizationCue: "Highly compatible personality match",
  },
];
