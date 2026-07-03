import type { PersonalityProfile } from "@/shared/lib/personality-profile/types";

export const FALLBACK_STRENGTHS = [
  "Adapts to different social situations",
  "Bridges different personalities without losing yourself",
  "Provides balance when a room has too much of one energy",
  "Connects with a wide range of people",
];

export function buildBalancedProfile(): PersonalityProfile {
  return {
    title: "The Adaptive Ally",
    summary:
      "You are not pulled too hard toward one extreme, which can make you harder to summarize but easier to recognize in real life. You tend to read the moment, adjust your pace, and become different parts of yourself depending on who is around and what the situation asks for.",
    strengths: [...FALLBACK_STRENGTHS],
    inGroups:
      "Around other people, you are often the one who adjusts without making a performance of it. You can be steady, playful, practical, or reflective depending on what feels true in the moment.",
  };
}
