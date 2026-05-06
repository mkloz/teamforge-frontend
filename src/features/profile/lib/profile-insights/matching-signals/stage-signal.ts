import type { User } from "@/shared/schemas";
import type { MatchingSignal } from "../types";

export function buildStageSignal(user: User): MatchingSignal {
  if (typeof user.age !== "number") {
    return {
      detail:
        "Age is not set, so life-stage filtering cannot help narrow nearby groups.",
      label: "Life stage",
      strength: "quiet",
      value: "Unset",
    };
  }

  return {
    detail: getAgeAlignmentDetail(user.age),
    label: "Life stage",
    strength: "good",
    value: `${user.age}`,
  };
}

function getAgeAlignmentDetail(age: number) {
  if (age >= 18 && age <= 28) {
    return "Inside TeamForge's strongest life-stage band, so age can help keep groups socially natural.";
  }

  return "Age is available for life-stage filtering, but may need wider nearby-group settings.";
}
