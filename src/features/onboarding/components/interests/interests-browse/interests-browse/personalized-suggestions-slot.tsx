import { SuggestionsSection } from "@/features/onboarding/components/interests/interests-browse/suggestions-section";
import type { Interest } from "@/shared/schemas";
import type { PersonalityType } from "@/shared/schemas/enums";

export function PersonalizedSuggestionsSlot({
  isAtMax,
  personalityType,
  selectedIds,
  shouldShow,
  suggestedTags,
  onReject,
  onToggle,
}: {
  isAtMax: boolean;
  personalityType: PersonalityType | null;
  selectedIds: Set<string>;
  shouldShow: boolean;
  suggestedTags: Interest[];
  onReject: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  if (!shouldShow || !personalityType) {
    return null;
  }

  return (
    <SuggestionsSection
      personalityType={personalityType}
      suggestedTags={suggestedTags}
      selectedIds={selectedIds}
      isAtMax={isAtMax}
      onToggle={onToggle}
      onReject={onReject}
    />
  );
}
