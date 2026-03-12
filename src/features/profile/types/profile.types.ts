// MBTI Types
export type MBTIType =
  | "INTJ" | "INTP" | "ENTJ" | "ENTP"
  | "INFJ" | "INFP" | "ENFJ" | "ENFP"
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ"
  | "ISTP" | "ISFP" | "ESTP" | "ESFP";

export type DimensionKey = "EI" | "SN" | "TF" | "JP";

export interface DimensionScore {
  dimension: DimensionKey;
  score: number; // 0-100 where 0 = first letter (E, S, T, J), 100 = second letter (I, N, F, P)
  letter: string; // The resulting letter based on score
  isBorderline: boolean; // true if score is 45-55
}

export type CognitiveFunctionCode =
  | "Ne" | "Ni" | "Se" | "Si"
  | "Te" | "Ti" | "Fe" | "Fi";

export interface CognitiveFunction {
  code: CognitiveFunctionCode;
  name: string;
  shortName: string;
  description: string;
  role: "dominant" | "auxiliary" | "tertiary" | "inferior";
}

export interface Interest {
  id: string;
  label: string;
  category: "outdoors" | "social" | "creative" | "sports" | "food" | "music" | "learning" | "gaming";
}

// OCEAN Big Five Personality Traits
export interface OceanScores {
  openness: number;         // 0-100: Curiosity, creativity, openness to new experiences
  conscientiousness: number; // 0-100: Organization, dependability, self-discipline
  extraversion: number;      // 0-100: Sociability, assertiveness, positive emotions
  agreeableness: number;     // 0-100: Cooperation, trust, empathy
  neuroticism: number;       // 0-100: Emotional sensitivity, anxiety, moodiness
}

export type OceanTraitKey = keyof OceanScores;

export interface OceanTraitMeta {
  key: OceanTraitKey;
  label: string;           // User-friendly name
  highDescription: string; // What high score means
  lowDescription: string;  // What low score means
}

export interface UserProfile {
  id: string;
  avatar: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  
  // MBTI data
  mbtiType: MBTIType;
  dimensionScores: DimensionScore[];
  
  // OCEAN Big Five scores
  oceanScores: OceanScores;
  
  // Derived data
  archetype: string;
  trustScore: number; // 0-100
  
  // Interests
  interests: Interest[];
  
  // Metadata
  joinedAt: string;
}
