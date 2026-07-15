import type {
  MatchingSignal,
  PersonalityProfile,
  PersonalityTension,
  TraitProfile,
} from "../types";

export function buildPersonalitySignal(
  personality: PersonalityProfile,
  traits: TraitProfile | null,
  tensions: PersonalityTension[],
): MatchingSignal {
  if (!personality.type && !traits) {
    return {
      detail:
        "Personality details are missing, so TeamForge will rely mostly on interests when forming groups.",
      label: "Personality detail",
      strength: "quiet",
      value: "Missing",
    };
  }

  if (tensions.length > 0) {
    return {
      detail:
        "The personality answers include a mixed signal, so a group with a clear activity is a better starting point.",
      label: "Personality detail",
      strength: "good",
      value: "Mixed",
    };
  }

  if (personality.type && traits) {
    return {
      detail: `${personality.type} and the ${traits.dominant.label} trait score provide two views of how this person tends to engage in groups.`,
      label: "Personality detail",
      strength: "ready",
      value: personality.type,
    };
  }

  return {
    detail: personality.type
      ? `${personality.type} gives a starting point. Adding Big Five scores would provide more detail.`
      : `${traits?.dominant.label ?? "Trait"} is present. Adding a personality type would provide more detail.`,
    label: "Personality detail",
    strength: "good",
    value: personality.type ?? "Trait",
  };
}
