import type { OceanScores, OceanTraitKey } from "@/shared/types/psychometrics";
import {
  MAX_SIGNAL_COUNT,
  rankOceanSignal,
  TRAIT_KEYS,
  TRAIT_TIEBREAK_RANK,
} from "./ocean-scoring";
import type {
  OceanSignalCopy,
  RankedOceanSignal,
  ShowUpDirection,
  ShowUpSignal,
} from "./types";

const OCEAN_SIGNAL_COPY: Record<OceanTraitKey, OceanSignalCopy> = {
  openness: {
    label: "Curiosity",
    highLabel: "Exploratory",
    lowLabel: "Grounded",
    balancedLabel: "Adaptive",
    highDescription:
      "Their profile suggests an interest in new ideas and unfamiliar activities.",
    lowDescription:
      "Their profile suggests a preference for practical plans and workable details.",
    balancedDescription:
      "Their profile suggests an interest in both new ideas and practical details.",
  },
  conscientiousness: {
    label: "Follow-through",
    highLabel: "Structured",
    lowLabel: "Flexible",
    balancedLabel: "Responsive",
    highDescription:
      "Their profile suggests they prefer plans with clear details and follow-through.",
    lowDescription:
      "Their profile suggests they are comfortable adjusting plans as they change.",
    balancedDescription:
      "Their profile suggests they use structure when helpful but can still adapt.",
  },
  extraversion: {
    label: "Social rhythm",
    highLabel: "Expressive",
    lowLabel: "Selective",
    balancedLabel: "Situational",
    highDescription:
      "Their profile suggests comfort with expressive, energetic social settings.",
    lowDescription:
      "Their profile suggests a preference for quieter settings and smaller groups.",
    balancedDescription:
      "Their profile suggests comfort in both active and quieter social settings.",
  },
  agreeableness: {
    label: "Collaboration",
    highLabel: "Supportive",
    lowLabel: "Direct",
    balancedLabel: "Balanced",
    highDescription:
      "Their profile suggests they value cooperation and other people's comfort.",
    lowDescription:
      "Their profile suggests a direct style and comfort making independent decisions.",
    balancedDescription:
      "Their profile suggests a balance between cooperation and direct feedback.",
  },
  neuroticism: {
    label: "Composure",
    highLabel: "Attuned",
    lowLabel: "Steady",
    balancedLabel: "Aware",
    highDescription: "Their profile shows higher emotional sensitivity.",
    lowDescription:
      "Their profile shows lower emotional sensitivity to stress.",
    balancedDescription:
      "Their profile suggests a moderate response to emotional stress.",
  },
};

export function buildOceanSignals(
  scores: Partial<OceanScores>,
): ShowUpSignal[] {
  return TRAIT_KEYS.map((key) => {
    const score = scores[key];

    return typeof score === "number" ? rankOceanSignal(key, score) : null;
  })
    .filter((signal): signal is RankedOceanSignal => signal !== null)
    .sort((left, right) => {
      if (right.strength !== left.strength) {
        return right.strength - left.strength;
      }

      return TRAIT_TIEBREAK_RANK[left.key] - TRAIT_TIEBREAK_RANK[right.key];
    })
    .slice(0, MAX_SIGNAL_COUNT)
    .map((signal) => buildOceanSignal(signal));
}

function buildOceanSignal(signal: RankedOceanSignal): ShowUpSignal {
  const copy = OCEAN_SIGNAL_COPY[signal.key];

  return {
    key: signal.key,
    label: copy.label,
    value: signal.score,
    level: getOceanSignalLevel(copy, signal.direction),
    description: getOceanSignalDescription(copy, signal.direction),
    source: "ocean",
    confidence: signal.confidence,
  };
}

function getOceanSignalLevel(
  copy: OceanSignalCopy,
  direction: ShowUpDirection,
) {
  switch (direction) {
    case "high":
      return copy.highLabel;
    case "low":
      return copy.lowLabel;
    default:
      return copy.balancedLabel;
  }
}

function getOceanSignalDescription(
  copy: OceanSignalCopy,
  direction: ShowUpDirection,
) {
  switch (direction) {
    case "high":
      return copy.highDescription;
    case "low":
      return copy.lowDescription;
    default:
      return copy.balancedDescription;
  }
}
