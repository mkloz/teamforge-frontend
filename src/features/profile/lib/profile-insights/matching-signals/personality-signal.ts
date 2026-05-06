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
        "Personality data is missing, so matching leans mostly on interests for now.",
      label: "Social read",
      strength: "quiet",
      value: "Missing",
    };
  }

  if (tensions.length > 0) {
    return {
      detail:
        "There is useful personality depth, but one mixed cue means the first group should stay concrete.",
      label: "Social read",
      strength: "good",
      value: "Mixed",
    };
  }

  if (personality.type && traits) {
    return {
      detail: `${personality.type} plus ${traits.dominant.label}-led OCEAN scores gives the matcher a clear social shape.`,
      label: "Social read",
      strength: "ready",
      value: personality.type,
    };
  }

  return {
    detail: personality.type
      ? `${personality.type} gives an early social pattern; OCEAN scores would sharpen it.`
      : `${traits?.dominant.label ?? "Trait"} is present; MBTI would make the read more complete.`,
    label: "Social read",
    strength: "good",
    value: personality.type ?? "Trait",
  };
}
