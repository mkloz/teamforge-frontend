import type { Interest, PersonalityType } from "@/shared/schemas";

interface InterestSelectionSyncParams {
  selectedIds: string[];
  userInterests: Interest[] | undefined;
  leafById: Record<string, Interest>;
  maxInterests: number;
}

export function getNextInterestPersonalityType(
  currentType: PersonalityType | null,
  personalityTypeHint: PersonalityType | null,
  userPersonalityType: PersonalityType | null | undefined,
) {
  if (currentType) {
    return null;
  }

  return personalityTypeHint ?? userPersonalityType ?? null;
}

export function getNextSelectedInterestIds({
  selectedIds,
  userInterests,
  leafById,
  maxInterests,
}: InterestSelectionSyncParams) {
  const validSelectedIds = selectedIds.filter((id) => leafById[id]);

  if (!selectedIds.length) {
    const validUserInterestIds =
      userInterests
        ?.map((interest) => interest.id)
        .filter((id) => leafById[id])
        .slice(0, maxInterests) ?? [];

    return validUserInterestIds.length > 0 ? validUserInterestIds : null;
  }

  return validSelectedIds.length === selectedIds.length
    ? null
    : validSelectedIds.slice(0, maxInterests);
}
