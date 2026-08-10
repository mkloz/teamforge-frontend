import type { User } from "@/shared/schemas";
import type { MatchingSignal } from "../types";

export function buildStageSignal(user: User): MatchingSignal {
  if (!isUsableAge(user.age)) {
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

function isUsableAge(age: User["age"]): age is number {
  return typeof age === "number" && Number.isFinite(age);
}

function getAgeAlignmentDetail(age: number) {
  if (age >= 18 && age <= 28) {
    return "Inside Findafew's strongest life-stage band, so age can help keep groups socially natural.";
  }

  return "Age is available for life-stage filtering, but may need wider nearby-group settings.";
}
