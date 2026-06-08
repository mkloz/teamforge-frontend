import { MBTI_SUGGESTIONS } from "@/features/onboarding/data/interest-recommendations";
import type { PersonalityType } from "@/shared/schemas/enums";

import type { InterestsSnapshot } from "./interests-store.types";

export const INTERESTS_DEFAULT_STATE: InterestsSnapshot = {
  selectedIds: [],
  rejectedIds: [],
  screen: "intro",
  personalityType: null,
};

export function isInterestPersonalityType(
  value: string,
): value is PersonalityType {
  return value in MBTI_SUGGESTIONS;
}

export function getCappedUniqueInterestIds(
  ids: string[],
  maxInterests: number,
) {
  return Array.from(new Set(ids)).slice(0, maxInterests);
}

export function toggleSelectedInterest(
  selectedIds: string[],
  rejectedIds: string[],
  id: string,
  maxInterests: number,
) {
  const selected = new Set(selectedIds);
  const rejected = new Set(rejectedIds);

  if (selected.has(id)) {
    selected.delete(id);
  } else if (selected.size < maxInterests) {
    selected.add(id);
    rejected.delete(id);
  }

  return {
    selectedIds: [...selected],
    rejectedIds: [...rejected],
  };
}

export function toggleRejectedInterest(rejectedIds: string[], id: string) {
  const rejected = new Set(rejectedIds);

  if (rejected.has(id)) {
    rejected.delete(id);
  } else {
    rejected.add(id);
  }

  return [...rejected];
}
