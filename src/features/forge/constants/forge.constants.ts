import type { FixedGroupSize } from "../lib/forge-contract";

export const ALGORITHM_GROUP_SIZES: {
  value: FixedGroupSize;
  label: string;
  note: string;
}[] = [
  { value: 4, label: "4", note: "Tight-knit" },
  { value: 6, label: "6", note: "Balanced" },
  { value: 8, label: "8", note: "Expansive" },
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
