import { YouMightAlsoLikeSection } from "@/features/onboarding/components/interests/interests-browse/you-might-also-like-section";
import type { Interest } from "@/shared/schemas";

export function YouMightAlsoLikeSlot({
  isAtMax,
  selectedIds,
  shouldShow,
  tags,
  onReject,
  onToggle,
}: {
  isAtMax: boolean;
  selectedIds: Set<string>;
  shouldShow: boolean;
  tags: Interest[];
  onReject: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="pt-4">
      <YouMightAlsoLikeSection
        tags={tags}
        selectedIds={selectedIds}
        isAtMax={isAtMax}
        onToggle={onToggle}
        onReject={onReject}
      />
    </div>
  );
}
