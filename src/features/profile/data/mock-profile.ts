import type { UserProfile, DimensionScore, OceanScores } from "../types/profile.types";

// Helper to determine letter from score
function getLetterFromScore(dimension: string, score: number): string {
  const pairs: Record<string, [string, string]> = {
    EI: ["E", "I"],
    SN: ["S", "N"],
    TF: ["T", "F"],
    JP: ["J", "P"],
  };
  const [first, second] = pairs[dimension];
  return score <= 50 ? first : second;
}

// Helper to check if borderline (45-55%)
function isBorderline(score: number): boolean {
  return score >= 45 && score <= 55;
}

// Create dimension scores
function createDimensionScores(ei: number, sn: number, tf: number, jp: number): DimensionScore[] {
  return [
    { dimension: "EI", score: ei, letter: getLetterFromScore("EI", ei), isBorderline: isBorderline(ei) },
    { dimension: "SN", score: sn, letter: getLetterFromScore("SN", sn), isBorderline: isBorderline(sn) },
    { dimension: "TF", score: tf, letter: getLetterFromScore("TF", tf), isBorderline: isBorderline(tf) },
    { dimension: "JP", score: jp, letter: getLetterFromScore("JP", jp), isBorderline: isBorderline(jp) },
  ];
}

export const MOCK_PROFILE: UserProfile = {
  id: "user-self",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4",
  name: "Alex Johnson",
  age: 28,
  location: "Portland, OR",
  bio: "Adventure seeker who believes the best moments happen when plans go sideways.",
  
  mbtiType: "ENFP",
  dimensionScores: createDimensionScores(
    48,  // E/I - borderline! (48% toward E, very close to center)
    78,  // S/N - clearly N (78% toward N)
    82,  // T/F - clearly F (82% toward F)
    65,  // J/P - P (65% toward P)
  ),
  
  archetype: "The Spark",
  trustScore: 94,
  
  // OCEAN scores (derived from ENFP tendencies)
  oceanScores: {
    openness: 85,          // High - creative, curious, imaginative
    conscientiousness: 45, // Moderate-low - flexible, spontaneous
    extraversion: 72,      // High - social, energetic
    agreeableness: 78,     // High - warm, cooperative
    neuroticism: 52,       // Moderate - emotionally aware
  },
  
  interests: [
    { id: "1", label: "Hiking", category: "outdoors" },
    { id: "2", label: "Live Music", category: "music" },
    { id: "3", label: "Coffee Culture", category: "food" },
    { id: "4", label: "Board Games", category: "gaming" },
    { id: "5", label: "Photography", category: "creative" },
    { id: "6", label: "Day Trips", category: "outdoors" },
    { id: "7", label: "Cooking Classes", category: "learning" },
    { id: "8", label: "Volleyball", category: "sports" },
  ],
  
  joinedAt: "2024-03-15T00:00:00Z",
};

// Alternative profile for testing different types
export const MOCK_PROFILE_INTJ: UserProfile = {
  id: "user-intj",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan&backgroundColor=c0aede",
  name: "Morgan Chen",
  age: 32,
  location: "Seattle, WA",
  bio: "Building systems that make sense. Chess player, sci-fi reader, occasional mountain climber.",
  
  mbtiType: "INTJ",
  dimensionScores: createDimensionScores(
    72,  // I (72% toward I)
    85,  // N (85% toward N)
    35,  // T (35% toward T, clear T)
    28,  // J (28% toward J, clear J)
  ),
  
  archetype: "The Strategist",
  trustScore: 97,
  
  // OCEAN scores (derived from INTJ tendencies)
  oceanScores: {
    openness: 78,          // High - intellectual curiosity
    conscientiousness: 88, // Very high - organized, goal-oriented
    extraversion: 28,      // Low - reserved, independent
    agreeableness: 42,     // Moderate-low - direct, objective
    neuroticism: 35,       // Low - emotionally stable
  },
  
  interests: [
    { id: "1", label: "Chess", category: "gaming" },
    { id: "2", label: "Sci-Fi Books", category: "learning" },
    { id: "3", label: "Rock Climbing", category: "sports" },
    { id: "4", label: "Tech Meetups", category: "social" },
    { id: "5", label: "Minimalist Design", category: "creative" },
  ],
  
  joinedAt: "2023-11-20T00:00:00Z",
};
