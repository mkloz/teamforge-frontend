import type {
  PersonalityProfile,
  PersonalityTension,
  TraitProfile,
} from "../types";

export function parsePersonalityType(type: string | null): PersonalityProfile {
  if (!type || type.length < 4) {
    return {
      attention: "unknown",
      decision: "unknown",
      energy: "unknown",
      structure: "unknown",
      type: null,
    };
  }

  return {
    attention: type[1] === "N" ? "possibility" : "practical",
    decision: type[2] === "F" ? "people" : "logic",
    energy: type[0] === "E" ? "outward" : "inward",
    structure: type[3] === "J" ? "planned" : "open",
    type,
  };
}

export function buildPersonalityTensions(
  personality: PersonalityProfile,
  traits: TraitProfile | null,
): PersonalityTension[] {
  if (!personality.type || !traits) {
    return [];
  }

  const tensions: PersonalityTension[] = [];

  if (personality.energy === "outward" && traits.scores.extraversion <= 42) {
    tensions.push({
      label: "Mixed social cue",
      value:
        "Type starts outward, but social energy scores quieter. Small active groups may fit better than big rooms.",
    });
  }

  if (personality.energy === "inward" && traits.scores.extraversion >= 58) {
    tensions.push({
      label: "Mixed social cue",
      value:
        "Type starts inward, but social energy is present. The right activity may bring it out quickly.",
    });
  }

  if (
    personality.structure === "planned" &&
    traits.scores.conscientiousness <= 42
  ) {
    tensions.push({
      label: "Mixed planning cue",
      value:
        "Type wants closure, but organization scores looser. Clear options may work better than rigid plans.",
    });
  }

  if (
    personality.structure === "open" &&
    traits.scores.conscientiousness >= 68
  ) {
    tensions.push({
      label: "Mixed planning cue",
      value:
        "Type keeps options open, but organization is high. Flexible plans still need a reliable frame.",
    });
  }

  if (personality.decision === "logic" && traits.scores.agreeableness >= 68) {
    tensions.push({
      label: "Mixed decision cue",
      value:
        "Type leans logical, but warmth scores high. Direct plans should still leave room for people.",
    });
  }

  if (personality.attention === "practical" && traits.scores.openness >= 68) {
    tensions.push({
      label: "Mixed curiosity cue",
      value:
        "Type trusts concrete details, but curiosity is high. Specific plans with a fresh angle should land well.",
    });
  }

  return tensions.slice(0, 2);
}
