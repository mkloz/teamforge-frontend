import type { FixedGroupSize } from "../types/forge.types";

export const ALGORITHM_GROUP_SIZES = [
  { value: 4 as FixedGroupSize, label: "4", note: "Tight-knit" },
  { value: 6 as FixedGroupSize, label: "6", note: "Balanced" },
  { value: 8 as FixedGroupSize, label: "8", note: "Expansive" },
];

export const MOCK_PARTICIPANTS = [
  { id: "1", name: "Mia Torres", avatar: "MT", compatibility: 94 },
  { id: "2", name: "James Park", avatar: "JP", compatibility: 88 },
  { id: "3", name: "Sofia Chen", avatar: "SC", compatibility: 82 },
  { id: "4", name: "Luca Bianchi", avatar: "LB", compatibility: 76 },
  { id: "5", name: "Priya Nair", avatar: "PN", compatibility: 91 },
  { id: "6", name: "Noah Ellis", avatar: "NE", compatibility: 79 },
  { id: "7", name: "Amara Osei", avatar: "AO", compatibility: 85 },
];

export interface ActivityOption {
  id: string;
  label: string;
  description: string;
}

export const ACTIVITIES: ActivityOption[] = [
  {
    id: "sports",
    label: "Sports & Fitness",
    description: "Team sports, gym, running",
  },
  {
    id: "gaming",
    label: "Gaming & Tech",
    description: "E-sports, board games, VR",
  },
  {
    id: "social",
    label: "Social & Networking",
    description: "Coffee, drinks, meetups",
  },
  {
    id: "arts",
    label: "Arts & Culture",
    description: "Museums, painting, cinema",
  },
  {
    id: "music",
    label: "Music & Performance",
    description: "Concerts, jam sessions, DJ",
  },
  {
    id: "outdoors",
    label: "Outdoors & Nature",
    description: "Hiking, camping, beach",
  },
  {
    id: "learning",
    label: "Learning & Workshops",
    description: "Coding, photography, design",
  },
  {
    id: "food",
    label: "Food & Dining",
    description: "Dinner, brunch, cooking",
  },
  {
    id: "professional",
    label: "Work & Career",
    description: "Collaboration, brainstorms",
  },
  {
    id: "wellness",
    label: "Wellness & Health",
    description: "Yoga, meditation, spa",
  },
  {
    id: "creative",
    label: "Creative Hobbies",
    description: "DIY, crafting, gardening",
  },
  {
    id: "community",
    label: "Volunteering",
    description: "Social impact, charity",
  },
];

export const RECENT = [
  { id: "sports", label: "Tennis at Riverside", count: 3 },
  { id: "social", label: "Product Brainstorming", count: 2 },
];
