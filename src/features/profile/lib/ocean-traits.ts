import type { OceanScores, OceanTraitKey, OceanTraitMeta } from "../types/profile.types";

// Human-friendly trait metadata with rich descriptions
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

// Rich personality descriptions based on dominant traits
const PERSONALITY_DESCRIPTIONS: Record<string, string> = {
  // High Openness patterns
  "high-openness-high-extraversion": "A creative explorer who thrives on new experiences and social adventures. They bring imaginative ideas to every gathering and inspire others to see the world differently. Natural storytellers who can turn any outing into an unforgettable experience.",
  "high-openness-low-extraversion": "A thoughtful dreamer with rich inner world and deep appreciation for art, ideas, and meaningful one-on-one conversations. They bring unique perspectives and creative solutions, preferring quality connections over large social scenes.",
  "high-openness-high-conscientiousness": "A visionary planner who combines creativity with execution. They dream big but also follow through, making them excellent at turning ambitious ideas into reality. Reliable yet innovative.",
  
  // High Conscientiousness patterns
  "high-conscientiousness-high-agreeableness": "A dependable team player who takes commitments seriously and puts others first. They're the friend who always shows up on time, remembers important dates, and makes sure everyone feels included and cared for.",
  "high-conscientiousness-low-agreeableness": "A results-driven achiever with clear goals and high standards. They value efficiency and directness, preferring to cut through small talk to get things done. Honest and straightforward in their approach.",
  
  // High Extraversion patterns  
  "high-extraversion-high-agreeableness": "A natural connector who lights up any room and makes everyone feel welcome. They thrive on bringing people together, smoothing over conflicts, and creating warm, inclusive atmospheres wherever they go.",
  "high-extraversion-low-agreeableness": "A bold leader who isn't afraid to speak their mind and take charge. They bring energy and confidence to group settings, often stepping up to organize and direct activities with natural authority.",
  
  // High Agreeableness patterns
  "high-agreeableness-high-sensitivity": "A deeply empathetic soul who feels others' emotions intensely. They're natural caregivers with intuitive understanding of what people need, though they may need time to recharge after emotionally charged situations.",
  "high-agreeableness-low-sensitivity": "A steady, supportive presence who remains calm and caring even in stressful situations. They offer reliable emotional support without getting overwhelmed, making them excellent in crisis moments.",
  
  // Balanced patterns
  "balanced": "A versatile personality who adapts well to different social situations. They balance multiple qualities without extreme tendencies, making them flexible companions who can mesh with various group dynamics.",
};

// Generate comprehensive personality description
export function generateDetailedDescription(scores: OceanScores): string {
  const highTraits: OceanTraitKey[] = [];
  const lowTraits: OceanTraitKey[] = [];
  
  Object.entries(scores).forEach(([key, value]) => {
    if (value >= 65) highTraits.push(key as OceanTraitKey);
    if (value <= 35) lowTraits.push(key as OceanTraitKey);
  });
  
  // Try to find matching description pattern
  if (highTraits.includes("openness") && highTraits.includes("extraversion")) {
    return PERSONALITY_DESCRIPTIONS["high-openness-high-extraversion"];
  }
  if (highTraits.includes("openness") && lowTraits.includes("extraversion")) {
    return PERSONALITY_DESCRIPTIONS["high-openness-low-extraversion"];
  }
  if (highTraits.includes("openness") && highTraits.includes("conscientiousness")) {
    return PERSONALITY_DESCRIPTIONS["high-openness-high-conscientiousness"];
  }
  if (highTraits.includes("conscientiousness") && highTraits.includes("agreeableness")) {
    return PERSONALITY_DESCRIPTIONS["high-conscientiousness-high-agreeableness"];
  }
  if (highTraits.includes("conscientiousness") && lowTraits.includes("agreeableness")) {
    return PERSONALITY_DESCRIPTIONS["high-conscientiousness-low-agreeableness"];
  }
  if (highTraits.includes("extraversion") && highTraits.includes("agreeableness")) {
    return PERSONALITY_DESCRIPTIONS["high-extraversion-high-agreeableness"];
  }
  if (highTraits.includes("extraversion") && lowTraits.includes("agreeableness")) {
    return PERSONALITY_DESCRIPTIONS["high-extraversion-low-agreeableness"];
  }
  if (highTraits.includes("agreeableness") && highTraits.includes("neuroticism")) {
    return PERSONALITY_DESCRIPTIONS["high-agreeableness-high-sensitivity"];
  }
  if (highTraits.includes("agreeableness") && lowTraits.includes("neuroticism")) {
    return PERSONALITY_DESCRIPTIONS["high-agreeableness-low-sensitivity"];
  }
  
  // Default balanced description
  return PERSONALITY_DESCRIPTIONS["balanced"];
}

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
