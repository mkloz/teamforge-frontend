import type {
  FixedGroupSize,
  PlanCategory,
} from "@/features/forge/lib/forge-contract";

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
  id: PlanCategory;
  label: string;
  description: string;
}

export const ACTIVITIES: ActivityOption[] = [
  {
    id: "SPORTS",
    label: "Sport & Movement",
    description: "Games, workouts, runs, climbing",
  },
  {
    id: "GAMING",
    label: "Games & Play",
    description: "Board games, video games, arcades",
  },
  {
    id: "SOCIAL",
    label: "Social & Nightlife",
    description: "Coffee, drinks, brunch, meetups",
  },
  {
    id: "ARTS",
    label: "Arts & Culture",
    description: "Museums, galleries, film, making",
  },
  {
    id: "MUSIC",
    label: "Music & Shows",
    description: "Concerts, gigs, karaoke, jams",
  },
  {
    id: "OUTDOORS",
    label: "Outdoors & Nature",
    description: "Hikes, parks, cycling, fresh air",
  },
  {
    id: "LEARNING",
    label: "Study & Skills",
    description: "Study groups, workshops, practice",
  },
  {
    id: "FOOD",
    label: "Food & Drink",
    description: "Dinner, markets, cooking, cafes",
  },
  {
    id: "TECH",
    label: "Tech & Build",
    description: "Coding, startups, demos, AI",
  },
  {
    id: "WELLNESS",
    label: "Wellness & Reset",
    description: "Yoga, meditation, recovery, habits",
  },
  {
    id: "TRAVEL",
    label: "Day Trips & Discovery",
    description: "City breaks, routes, local gems",
  },
  {
    id: "OTHER",
    label: "Projects & Wildcards",
    description: "Volunteering, swaps, niche ideas",
  },
];
