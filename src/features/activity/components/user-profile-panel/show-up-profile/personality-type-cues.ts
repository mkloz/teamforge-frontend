import type { PersonalityTypeSignalCue } from "./types";

const TYPE_SIGNAL_COPY: Record<string, PersonalityTypeSignalCue> = {
  E: {
    label: "Social rhythm",
    level: "Expressive",
    description:
      "Their personality type is associated with expressive social settings.",
  },
  I: {
    label: "Social rhythm",
    level: "Selective",
    description:
      "Their personality type is associated with quieter, more focused social settings.",
  },
  N: {
    label: "Curiosity",
    level: "Pattern-led",
    description:
      "Their personality type is associated with ideas, possibilities, and patterns.",
  },
  S: {
    label: "Curiosity",
    level: "Practical",
    description:
      "Their personality type is associated with concrete details and practical plans.",
  },
  F: {
    label: "Collaboration",
    level: "People-aware",
    description:
      "Their personality type is associated with values and the effect of decisions on people.",
  },
  T: {
    label: "Collaboration",
    level: "Analytical",
    description:
      "Their personality type is associated with analytical, direct decisions.",
  },
  J: {
    label: "Follow-through",
    level: "Structured",
    description:
      "Their personality type is associated with planning and clear next steps.",
  },
  P: {
    label: "Follow-through",
    level: "Flexible",
    description:
      "Their personality type is associated with adapting and keeping options open.",
  },
};

export function getPersonalityTypeSignalCues(
  personalityType: string,
): PersonalityTypeSignalCue[] {
  return personalityType
    .split("")
    .map((dimension) => TYPE_SIGNAL_COPY[dimension])
    .filter((signal): signal is PersonalityTypeSignalCue => Boolean(signal));
}
