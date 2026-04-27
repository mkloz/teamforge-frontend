import type { FixedGroupSize } from "../types/forge.types";
import type { GroupMember } from "@/shared/schemas/group";

export const ALGORITHM_GROUP_SIZES: {
  value: FixedGroupSize;
  label: string;
  note: string;
}[] = [
  { value: 4, label: "4", note: "Tight-knit" },
  { value: 6, label: "6", note: "Balanced" },
  { value: 8, label: "8", note: "Expansive" },
];

/**
 * Local projection of a group member for the forge wizard.
 * Uses a partial User to avoid complex mock data while remaining
 * structurally compatible with GroupMember-based components.
 */
export interface ForgeParticipant extends Omit<GroupMember, "user"> {
  user: {
    id: string;
    fullName: string;
    avatar: string;
  };
  compatibilityScore: number;
}

export const MOCK_PARTICIPANTS: ForgeParticipant[] = [
  {
    userId: "1",
    groupId: "forge",
    role: "MEMBER",
    joinedAt: new Date().toISOString(),
    leftAt: null,
    compatibilityScore: 94,
    user: { id: "1", fullName: "Mia Torres", avatar: "MT" },
  },
  {
    userId: "2",
    groupId: "forge",
    role: "MEMBER",
    joinedAt: new Date().toISOString(),
    leftAt: null,
    compatibilityScore: 88,
    user: { id: "2", fullName: "James Park", avatar: "JP" },
  },
  {
    userId: "3",
    groupId: "forge",
    role: "MEMBER",
    joinedAt: new Date().toISOString(),
    leftAt: null,
    compatibilityScore: 82,
    user: { id: "3", fullName: "Sofia Chen", avatar: "SC" },
  },
  {
    userId: "4",
    groupId: "forge",
    role: "MEMBER",
    joinedAt: new Date().toISOString(),
    leftAt: null,
    compatibilityScore: 76,
    user: { id: "4", fullName: "Luca Bianchi", avatar: "LB" },
  },
  {
    userId: "5",
    groupId: "forge",
    role: "MEMBER",
    joinedAt: new Date().toISOString(),
    leftAt: null,
    compatibilityScore: 91,
    user: { id: "5", fullName: "Priya Nair", avatar: "PN" },
  },
  {
    userId: "6",
    groupId: "forge",
    role: "MEMBER",
    joinedAt: new Date().toISOString(),
    leftAt: null,
    compatibilityScore: 79,
    user: { id: "6", fullName: "Noah Ellis", avatar: "NE" },
  },
  {
    userId: "7",
    groupId: "forge",
    role: "MEMBER",
    joinedAt: new Date().toISOString(),
    leftAt: null,
    compatibilityScore: 85,
    user: { id: "7", fullName: "Amara Osei", avatar: "AO" },
  },
];

export interface ActivityOption {
  id: string;
  label: string;
  description: string;
}

export const ACTIVITIES: ActivityOption[] = [
  {
    id: "SPORTS",
    label: "Sports & Fitness",
    description: "Team sports, gym, running",
  },
  {
    id: "GAMING",
    label: "Gaming & Tech",
    description: "E-sports, board games, VR",
  },
  {
    id: "SOCIAL",
    label: "Social & Networking",
    description: "Coffee, drinks, meetups",
  },
  {
    id: "ARTS",
    label: "Arts & Culture",
    description: "Museums, painting, cinema",
  },
  {
    id: "MUSIC",
    label: "Music & Performance",
    description: "Concerts, jam sessions, DJ",
  },
  {
    id: "OUTDOORS",
    label: "Outdoors & Nature",
    description: "Hiking, camping, beach",
  },
  {
    id: "LEARNING",
    label: "Learning & Workshops",
    description: "Coding, photography, design",
  },
  {
    id: "FOOD",
    label: "Food & Dining",
    description: "Dinner, brunch, cooking",
  },
  {
    id: "TECH",
    label: "Tech & Innovation",
    description: "Coding, hackathons, AI",
  },
  {
    id: "WELLNESS",
    label: "Wellness & Health",
    description: "Yoga, meditation, spa",
  },
  {
    id: "TRAVEL",
    label: "Travel & Adventure",
    description: "Backpacking, road trips, culture",
  },
  {
    id: "OTHER",
    label: "Something Else",
    description: "Unique activities, special projects",
  },
];

export const RECENT = [
  { id: "SPORTS", label: "Tennis at Riverside", count: 3 },
  { id: "SOCIAL", label: "Product Brainstorming", count: 2 },
];
