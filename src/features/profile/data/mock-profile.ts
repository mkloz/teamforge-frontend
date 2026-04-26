import type { UserProfile } from "../types/profile.types";
import { createDimensionScores } from "../lib/profile-utils";

export const MOCK_PROFILE: UserProfile = {
  id: "user-self",
  email: "alex.johnson@example.com",
  emailVerified: true,
  authProvider: "EMAIL",
  fullName: "Alex Johnson",
  avatar:
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
  bio: "Adventure seeker who believes the best moments happen when plans go sideways.",
  age: 28,
  gender: "MALE",
  city: "Portland, OR",
  createdAt: "2024-03-15T00:00:00Z",
  updatedAt: "2024-03-15T00:00:00Z",
  searchStatus: "IDLE",
  trustScore: 94,
  profileComplete: true,

  // Personality
  personalityType: "ENFP",
  oceanO: 85,
  oceanC: 45,
  oceanE: 72,
  oceanA: 78,
  oceanN: 52,

  // UI Projections
  oceanScores: {
    openness: 85,
    conscientiousness: 45,
    extraversion: 72,
    agreeableness: 78,
    neuroticism: 52,
  },
  dimensionScores: createDimensionScores(
    48, // E/I
    78, // S/N
    82, // T/F
    65, // J/P
  ),
  archetype: "The Spark",

  interests: [
    {
      id: "1",
      label: "Hiking",
      slug: "hiking",
      description: null,
      icon: "Mountain",
      color: "#0d9488",
      sortOrder: 1,
      isActive: true,
      parentId: null,
      aliases: [],
    },
    {
      id: "2",
      label: "Live Music",
      slug: "live-music",
      description: null,
      icon: "Music",
      color: "#f59e0b",
      sortOrder: 2,
      isActive: true,
      parentId: null,
      aliases: [],
    },
    {
      id: "3",
      label: "Coffee Culture",
      slug: "coffee",
      description: null,
      icon: "Coffee",
      color: "#ec4899",
      sortOrder: 3,
      isActive: true,
      parentId: null,
      aliases: [],
    },
  ],
};

// Alternative profile for testing different types
export const MOCK_PROFILE_INTJ: UserProfile = {
  id: "user-intj",
  email: "morgan.chen@example.com",
  emailVerified: true,
  authProvider: "GOOGLE",
  fullName: "Morgan Chen",
  avatar:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
  bio: "Building systems that make sense. Chess player, sci-fi reader, occasional mountain climber.",
  age: 32,
  gender: "MALE",
  city: "Seattle, WA",
  createdAt: "2023-11-20T00:00:00Z",
  updatedAt: "2023-11-20T00:00:00Z",
  searchStatus: "IDLE",
  trustScore: 97,
  profileComplete: true,

  // Personality
  personalityType: "INTJ",
  oceanO: 78,
  oceanC: 88,
  oceanE: 28,
  oceanA: 42,
  oceanN: 35,

  // UI Projections
  oceanScores: {
    openness: 78,
    conscientiousness: 88,
    extraversion: 28,
    agreeableness: 42,
    neuroticism: 35,
  },
  dimensionScores: createDimensionScores(
    72, // I
    85, // N
    35, // T
    28, // J
  ),
  archetype: "The Strategist",

  interests: [],
};
