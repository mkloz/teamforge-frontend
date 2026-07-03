import type { OceanScores, OceanTraitKey } from "@/shared/types/psychometrics";
import {
  MAX_SIGNAL_COUNT,
  rankOceanSignal,
  TRAIT_KEYS,
  TRAIT_TIEBREAK_RANK,
} from "./ocean-scoring";
import { getPersonalityTypeSignalCues } from "./personality-type-cues";
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
      "They are likely to bring new angles, ideas, and room for creative detours.",
    lowDescription:
      "They are likely to keep plans practical and return the group to what feels workable.",
    balancedDescription:
      "They can move between fresh ideas and practical details without getting stuck at either end.",
  },
  conscientiousness: {
    label: "Follow-through",
    highLabel: "Structured",
    lowLabel: "Flexible",
    balancedLabel: "Responsive",
    highDescription:
      "They tend to make plans easier to trust by tracking details and keeping momentum steady.",
    lowDescription:
      "They tend to stay loose when the plan changes and help the group avoid over-planning.",
    balancedDescription:
      "They can add structure when it helps and relax the plan when the moment needs more room.",
  },
  extraversion: {
    label: "Social rhythm",
    highLabel: "Expressive",
    lowLabel: "Selective",
    balancedLabel: "Situational",
    highDescription:
      "They usually add visible energy early and make conversation feel easier to start.",
    lowDescription:
      "They are more likely to build trust through quieter presence and smaller-group attention.",
    balancedDescription:
      "They can meet the room's energy without needing to dominate it or disappear from it.",
  },
  agreeableness: {
    label: "Collaboration",
    highLabel: "Supportive",
    lowLabel: "Direct",
    balancedLabel: "Clear-hearted",
    highDescription:
      "They tend to notice comfort, smooth friction, and make cooperation feel natural.",
    lowDescription:
      "They are likely to bring candor and independent judgment when a group needs clarity.",
    balancedDescription:
      "They can be warm without losing honesty, and direct without making the room colder.",
  },
  neuroticism: {
    label: "Composure",
    highLabel: "Attuned",
    lowLabel: "Steady",
    balancedLabel: "Aware",
    highDescription:
      "They may catch tension early and notice emotional shifts before everyone has words for them.",
    lowDescription:
      "They tend to stay calm when plans wobble and give the group a steadier baseline.",
    balancedDescription:
      "They can read emotional context without letting every small ripple take over the room.",
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

export function buildPersonalityTypeSignals(
  personalityType: string,
): ShowUpSignal[] {
  return getPersonalityTypeSignalCues(personalityType)
    .slice(0, MAX_SIGNAL_COUNT)
    .map((signal, index) => ({
      key: `type-${index}-${signal.label}`,
      label: signal.label,
      value: null,
      level: signal.level,
      description: signal.description,
      source: "personalityType",
      confidence: 0.58,
    }));
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
