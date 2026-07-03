import type { PersonalityTypeSignalCue } from "./types";

const TYPE_SIGNAL_COPY: Record<string, PersonalityTypeSignalCue> = {
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

export function getPersonalityTypeSignalCues(
  personalityType: string,
): PersonalityTypeSignalCue[] {
  return personalityType
    .split("")
    .map((dimension) => TYPE_SIGNAL_COPY[dimension])
    .filter((signal): signal is PersonalityTypeSignalCue => Boolean(signal));
}
