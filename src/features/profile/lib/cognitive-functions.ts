import type { PersonalityType } from "@/shared/schemas/enums";
import type {
  CognitiveFunction,
  CognitiveFunctionCode,
} from "./profile-contract";

// Full function descriptions
export const FUNCTION_INFO: Record<
  CognitiveFunctionCode,
  { name: string; shortName: string; description: string }
> = {
  Ne: {
    name: "Extraverted Intuition",
    shortName: "Exploration",
    description:
      "Sees patterns, possibilities, and connections in the external world",
  },
  Ni: {
    name: "Introverted Intuition",
    shortName: "Vision",
    description: "Forms deep insights and envisions future outcomes",
  },
  Se: {
    name: "Extraverted Sensing",
    shortName: "Experience",
    description: "Engages fully with the present moment and physical world",
  },
  Si: {
    name: "Introverted Sensing",
    shortName: "Memory",
    description: "Recalls detailed past experiences and values tradition",
  },
  Te: {
    name: "Extraverted Thinking",
    shortName: "Systems",
    description: "Organizes the external world with logic and efficiency",
  },
  Ti: {
    name: "Introverted Thinking",
    shortName: "Analysis",
    description: "Builds precise internal logical frameworks",
  },
  Fe: {
    name: "Extraverted Feeling",
    shortName: "Harmony",
    description: "Reads and nurtures group emotions and social bonds",
  },
  Fi: {
    name: "Introverted Feeling",
    shortName: "Values",
    description: "Maintains authentic personal values and convictions",
  },
};

// MBTI type to cognitive function stack mapping
const TYPE_STACKS: Record<
  PersonalityType,
  [
    CognitiveFunctionCode,
    CognitiveFunctionCode,
    CognitiveFunctionCode,
    CognitiveFunctionCode,
  ]
> = {
  // Analysts
  INTJ: ["Ni", "Te", "Fi", "Se"],
  INTP: ["Ti", "Ne", "Si", "Fe"],
  ENTJ: ["Te", "Ni", "Se", "Fi"],
  ENTP: ["Ne", "Ti", "Fe", "Si"],
  // Diplomats
  INFJ: ["Ni", "Fe", "Ti", "Se"],
  INFP: ["Fi", "Ne", "Si", "Te"],
  ENFJ: ["Fe", "Ni", "Se", "Ti"],
  ENFP: ["Ne", "Fi", "Te", "Si"],
  // Sentinels
  ISTJ: ["Si", "Te", "Fi", "Ne"],
  ISFJ: ["Si", "Fe", "Ti", "Ne"],
  ESTJ: ["Te", "Si", "Ne", "Fi"],
  ESFJ: ["Fe", "Si", "Ne", "Ti"],
  // Explorers
  ISTP: ["Ti", "Se", "Ni", "Fe"],
  ISFP: ["Fi", "Se", "Ni", "Te"],
  ESTP: ["Se", "Ti", "Fe", "Ni"],
  ESFP: ["Se", "Fi", "Te", "Ni"],
};

const ROLES: ["dominant", "auxiliary", "tertiary", "inferior"] = [
  "dominant",
  "auxiliary",
  "tertiary",
  "inferior",
];

export function getCognitiveStack(type: PersonalityType): CognitiveFunction[] {
  const stack = TYPE_STACKS[type];
  return stack.map((code, index) => ({
    code,
    name: FUNCTION_INFO[code].name,
    shortName: FUNCTION_INFO[code].shortName,
    description: FUNCTION_INFO[code].description,
    role: ROLES[index],
  }));
}

// Get function strength percentage for visualization
export function getFunctionStrength(role: CognitiveFunction["role"]): number {
  switch (role) {
    case "dominant":
      return 85;
    case "auxiliary":
      return 65;
    case "tertiary":
      return 40;
    case "inferior":
      return 20;
  }
}
