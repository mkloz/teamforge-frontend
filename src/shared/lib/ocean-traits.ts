import type { OceanTraitKey, OceanTraitMeta } from "../types/psychometrics";

interface ExtendedTraitInfo {
  key: OceanTraitKey;
  label: string;
  highDetailedDescription: string;
  lowDetailedDescription: string;
  inActivities: string;
  compatibleWith: string;
}

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

const EXTENDED_TRAITS: Record<OceanTraitKey, ExtendedTraitInfo> = {
  openness: {
    key: "openness",
    label: "Curiosity",
    highDetailedDescription:
      "You enjoy fresh ideas, unexpected experiences, and creative problem-solving.",
    lowDetailedDescription:
      "You prefer practical plans, familiar routines, and approaches you already trust.",
    inActivities:
      "Usually enjoys creative workshops, travel, culture, and open-ended plans.",
    compatibleWith:
      "Balances well with practical people who can help turn ideas into action.",
  },
  conscientiousness: {
    key: "conscientiousness",
    label: "Organization",
    highDetailedDescription:
      "You value structure, follow-through, and reliable planning in shared experiences.",
    lowDetailedDescription:
      "You prefer flexibility, spontaneity, and adapting as the situation changes.",
    inActivities:
      "Often helps with logistics, planning, and keeping group plans on track.",
    compatibleWith:
      "Pairs well with more spontaneous people who bring momentum and experimentation.",
  },
  extraversion: {
    key: "extraversion",
    label: "Social Energy",
    highDetailedDescription:
      "You tend to gain energy from people, conversation, and lively shared environments.",
    lowDetailedDescription:
      "You usually prefer smaller groups, quieter moments, and deeper one-to-one connection.",
    inActivities:
      "Shows up in comfort with group energy, social momentum, and visible participation.",
    compatibleWith:
      "Works well with quieter personalities who add depth and steadiness to group dynamics.",
  },
  agreeableness: {
    key: "agreeableness",
    label: "Warmth",
    highDetailedDescription:
      "You lean toward empathy, cooperation, and keeping the group experience supportive.",
    lowDetailedDescription:
      "You lean toward directness, independence, and honest feedback over social smoothing.",
    inActivities:
      "Often helps collaboration, mediation, and social trust in new groups.",
    compatibleWith:
      "Complements more assertive personalities by softening tension and building trust.",
  },
  neuroticism: {
    key: "neuroticism",
    label: "Sensitivity",
    highDetailedDescription:
      "You are emotionally attuned and likely to notice subtle changes in people and atmosphere.",
    lowDetailedDescription:
      "You tend to stay calm under pressure and bring emotional steadiness into group settings.",
    inActivities:
      "Shapes how much predictability, reassurance, or stimulation feels comfortable.",
    compatibleWith:
      "Often balances nicely with emotionally steady people who bring grounding energy.",
  },
};

const TRAIT_LEVEL_THRESHOLDS = [
  { minScore: 80, label: "Very High" },
  { minScore: 60, label: "High" },
  { minScore: 40, label: "Moderate" },
  { minScore: 20, label: "Low" },
] as const;

export function getExtendedTraitInfo(key: OceanTraitKey, score: number) {
  const trait = EXTENDED_TRAITS[key];
  const isHigh = score >= 50;

  return {
    label: trait.label,
    score,
    level: getTraitLevel(score),
    description: isHigh
      ? trait.highDetailedDescription
      : trait.lowDetailedDescription,
    inActivities: trait.inActivities,
    compatibleWith: trait.compatibleWith,
  };
}

function getTraitLevel(score: number) {
  return (
    TRAIT_LEVEL_THRESHOLDS.find(({ minScore }) => score >= minScore)?.label ??
    "Very Low"
  );
}
