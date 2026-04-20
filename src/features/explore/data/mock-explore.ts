import type { GroupPreview } from "../types/explore.types";

export const MOCK_USER = {
  mbti: "INTJ" as const,
  trustScore: 98,
  oceanScores: {
    openness: 85,
    conscientiousness: 70,
    extraversion: 40,
    agreeableness: 65,
    neuroticism: 30,
  },
};

export const MOCK_GROUPS: GroupPreview[] = [
  {
    id: "1",
    matchScore: 94,
    title: "Saturday Morning Bouldering",
    groupName: "Mesa Rim Climbers",
    date: "Sat, Oct 14 • 10:00 AM",
    distance: "3.2 miles away",
    cost: "Paid",
    category: "Outdoors",
    currentSize: 3,
    capacity: 4,
    access: "Open",
    locationMode: "In-Person",
  },
  {
    id: "2",
    matchScore: 88,
    title: "React UI Architecture Deep Dive",
    groupName: "Frontend Masters Guild",
    imageUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop",
    date: "Sun, Oct 15 • 2:00 PM",
    distance: "",
    locationMode: "Online",
    cost: "Free",
    category: "Tech",
    currentSize: 5,
    capacity: 6,
    access: "By Request",
  },
  {
    id: "3",
    matchScore: 82,
    title: "Casual Coffee & Sketching",
    groupName: "Creative Brews",
    imageUrl:
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop",
    date: "Wed, Oct 18 • 6:30 PM",
    distance: "0.8 miles away",
    cost: "Free",
    category: "Arts",
    currentSize: 2,
    capacity: 4,
    access: "Open",
    locationMode: "In-Person",
  },
  {
    id: "4",
    matchScore: 75,
    title: "Weekend Hike - Black Mountain",
    groupName: "San Diego Hikers",
    imageUrl:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=600&auto=format&fit=crop",
    date: "Sat, Oct 21 • 8:00 AM",
    distance: "12 miles away",
    cost: "Free",
    category: "Outdoors",
    currentSize: 8,
    capacity: 8,
    access: "Open",
    isFull: true,
    locationMode: "In-Person",
  },
];
