import type { OceanScores, OceanTraitKey, OceanTraitMeta } from "../types/profile.types";

// Human-friendly trait metadata
export const OCEAN_TRAITS: OceanTraitMeta[] = [
  {
    key: "openness",
    label: "Curiosity",
    highDescription: "Loves exploring new ideas and experiences",
    lowDescription: "Prefers familiar routines and practical approaches",
  },
  {
    key: "conscientiousness",
    label: "Organization",
    highDescription: "Structured, reliable, and detail-oriented",
    lowDescription: "Flexible, spontaneous, and adaptable",
  },
  {
    key: "extraversion",
    label: "Social Energy",
    highDescription: "Energized by people and social activities",
    lowDescription: "Recharges with quiet time and smaller groups",
  },
  {
    key: "agreeableness",
    label: "Warmth",
    highDescription: "Trusting, cooperative, and empathetic",
    lowDescription: "Independent, direct, and objective",
  },
  {
    key: "neuroticism",
    label: "Sensitivity",
    highDescription: "Emotionally aware and deeply feeling",
    lowDescription: "Calm under pressure and emotionally stable",
  },
];

// Get trait meta by key
export function getTraitMeta(key: OceanTraitKey): OceanTraitMeta {
  return OCEAN_TRAITS.find((t) => t.key === key)!;
}

// Get top N traits by score
export function getTopTraits(scores: OceanScores, count: number = 2): OceanTraitMeta[] {
  const sorted = OCEAN_TRAITS.slice()
    .sort((a, b) => scores[b.key] - scores[a.key]);
  return sorted.slice(0, count);
}

// Get trait level label
export function getTraitLevel(score: number): string {
  if (score >= 80) return "Very High";
  if (score >= 60) return "High";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "Low";
  return "Very Low";
}

// Generate personality summary from OCEAN scores
export function generateOceanSummary(scores: OceanScores): string {
  const topTraits = getTopTraits(scores, 2);
  const highTraits = topTraits.map((t) => t.label.toLowerCase());
  
  const descriptors: string[] = [];
  
  if (scores.openness >= 70) descriptors.push("creative and curious");
  else if (scores.openness <= 30) descriptors.push("practical and grounded");
  
  if (scores.conscientiousness >= 70) descriptors.push("organized and reliable");
  else if (scores.conscientiousness <= 30) descriptors.push("spontaneous and flexible");
  
  if (scores.extraversion >= 70) descriptors.push("outgoing and energetic");
  else if (scores.extraversion <= 30) descriptors.push("thoughtful and reserved");
  
  if (scores.agreeableness >= 70) descriptors.push("warm and cooperative");
  else if (scores.agreeableness <= 30) descriptors.push("independent and direct");
  
  // Neuroticism framed positively
  if (scores.neuroticism >= 70) descriptors.push("emotionally attuned");
  else if (scores.neuroticism <= 30) descriptors.push("calm and steady");
  
  const uniqueDescriptors = descriptors.slice(0, 3);
  
  if (uniqueDescriptors.length === 0) {
    return `A balanced personality with moderate levels across all traits, showing adaptability in various situations.`;
  }
  
  return `${uniqueDescriptors.slice(0, -1).join(", ")}${uniqueDescriptors.length > 1 ? " and " : ""}${uniqueDescriptors.slice(-1)[0]}. Strongest in ${highTraits.join(" and ")}.`;
}
