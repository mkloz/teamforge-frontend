import type { OceanScores, OceanTraitKey } from "@/shared/types/psychometrics";
import type { UserProfilePanelParticipant } from "./types";

type ShowUpDirection = "balanced" | "high" | "low";
type ShowUpSource = "ocean" | "personalityType";

export interface ShowUpSignal {
  key: string;
  label: string;
  value: number | null;
  level: string;
  description: string;
  source: ShowUpSource;
  confidence: number;
}

interface OceanSignalCopy {
  label: string;
  highLabel: string;
  lowLabel: string;
  balancedLabel: string;
  highDescription: string;
  lowDescription: string;
  balancedDescription: string;
}

interface RankedOceanSignal {
  key: OceanTraitKey;
  score: number;
  strength: number;
  direction: ShowUpDirection;
  confidence: number;
}

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

const TYPE_SIGNAL_COPY: Record<
  string,
  Pick<ShowUpSignal, "description" | "label" | "level">
> = {
  E: {
    label: "Social rhythm",
    level: "Expressive",
    description:
      "Their type points toward outward social energy and comfort getting conversation moving.",
  },
  I: {
    label: "Social rhythm",
    level: "Selective",
    description:
      "Their type points toward quieter social energy and stronger connection in focused moments.",
  },
  N: {
    label: "Curiosity",
    level: "Pattern-led",
    description:
      "Their type points toward ideas, possibilities, and reading between the lines.",
  },
  S: {
    label: "Curiosity",
    level: "Practical",
    description:
      "Their type points toward concrete details, lived experience, and plans that feel usable.",
  },
  F: {
    label: "Collaboration",
    level: "People-aware",
    description:
      "Their type points toward noticing values, tone, and how decisions land with people.",
  },
  T: {
    label: "Collaboration",
    level: "Analytical",
    description:
      "Their type points toward clear reasoning and saying what the situation needs plainly.",
  },
  J: {
    label: "Follow-through",
    level: "Structured",
    description:
      "Their type points toward closure, planning, and making next steps easier to see.",
  },
  P: {
    label: "Follow-through",
    level: "Flexible",
    description:
      "Their type points toward adapting in the moment and keeping options open when useful.",
  },
};

const TRAIT_KEYS: OceanTraitKey[] = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
];
const TRAIT_TIEBREAK_RANK: Record<OceanTraitKey, number> = {
  agreeableness: 0,
  conscientiousness: 1,
  extraversion: 2,
  openness: 3,
  neuroticism: 4,
};

const BALANCED_SIGNAL_BAND = 8;
const STRONG_SIGNAL_DISTANCE = 25;
const MAX_SIGNAL_COUNT = 3;

export function buildShowUpSignals(
  participant: UserProfilePanelParticipant,
): ShowUpSignal[] {
  const oceanScores = getParticipantOceanScores(participant);

  if (oceanScores) {
    return buildOceanSignals(oceanScores);
  }

  if (participant.personalityType) {
    return buildPersonalityTypeSignals(participant.personalityType);
  }

  return [];
}

function getParticipantOceanScores(participant: UserProfilePanelParticipant) {
  const entries = [
    ["openness", participant.oceanO],
    ["conscientiousness", participant.oceanC],
    ["extraversion", participant.oceanE],
    ["agreeableness", participant.oceanA],
    ["neuroticism", participant.oceanN],
  ] as const;
  const scores = entries
    .map(([trait, score]) => {
      const normalizedScore = normalizeScore(score);

      return normalizedScore === null
        ? null
        : {
            trait,
            score: normalizedScore,
          };
    })
    .filter(
      (item): item is { trait: OceanTraitKey; score: number } => item !== null,
    );

  if (scores.length === 0) {
    return null;
  }

  return Object.fromEntries(
    scores.map(({ score, trait }) => [trait, score]),
  ) as Partial<OceanScores>;
}

function buildOceanSignals(scores: Partial<OceanScores>): ShowUpSignal[] {
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

function rankOceanSignal(key: OceanTraitKey, score: number): RankedOceanSignal {
  const distanceFromMiddle = Math.abs(score - 50);
  const direction =
    distanceFromMiddle <= BALANCED_SIGNAL_BAND
      ? "balanced"
      : score > 50
        ? "high"
        : "low";

  return {
    key,
    score,
    strength: distanceFromMiddle,
    direction,
    confidence: getOceanSignalConfidence(distanceFromMiddle),
  };
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

function buildPersonalityTypeSignals(personalityType: string): ShowUpSignal[] {
  return personalityType
    .split("")
    .map((dimension) => TYPE_SIGNAL_COPY[dimension])
    .filter(
      (
        signal,
      ): signal is Pick<ShowUpSignal, "description" | "label" | "level"> =>
        Boolean(signal),
    )
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

function getOceanSignalConfidence(distanceFromMiddle: number) {
  if (distanceFromMiddle <= BALANCED_SIGNAL_BAND) {
    return 0.64;
  }

  return Math.min(0.95, 0.68 + distanceFromMiddle / STRONG_SIGNAL_DISTANCE / 4);
}

function normalizeScore(score: number | null | undefined) {
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return null;
  }

  const percent = score > 0 && score <= 1 ? score * 100 : score;

  return Math.max(0, Math.min(100, Math.round(percent)));
}
