import type { User } from "@/shared/schemas";

import { findActivityOption } from "./activity-option-resolution";

export function selectInterestIds(user: User, selectedActivity: string | null) {
  const interests = user.interests ?? [];

  if (interests.length === 0) {
    return [];
  }

  const match = findActivityOption(selectedActivity);
  const keywords = new Set(
    [selectedActivity, match?.label, match?.description, match?.id]
      .filter(Boolean)
      .flatMap((value) =>
        String(value)
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((part) => part.length >= 3),
      ),
  );

  const matchingInterests = interests.filter((interest) => {
    const haystack =
      `${interest.name} ${interest.slug} ${interest.aliases.join(" ")}`.toLowerCase();
    return [...keywords].some((keyword) => haystack.includes(keyword));
  });

  const source = matchingInterests.length > 0 ? matchingInterests : interests;

  return source.slice(0, 10).map((interest) => interest.id);
}
