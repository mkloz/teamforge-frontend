import type { PlanCategory } from "@/features/forge/lib/forge-contract";

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
    description: "Coding, startups, demos, prototypes",
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
