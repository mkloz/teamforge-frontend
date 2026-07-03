import { m } from "framer-motion";
import { CategorySection } from "@/features/onboarding/components/interests/interests-browse/category-section";
import {
  BalanceNudgeSlot,
  PersonalizedSuggestionsSlot,
  YouMightAlsoLikeSlot,
} from "@/features/onboarding/components/interests/interests-browse/interests-browse/recommendation-slots";
import type { InterestsDiscoveryContentProps } from "@/features/onboarding/components/interests/interests-browse/interests-browse/types";
import { Accordion } from "@/shared/components/ui/accordion";
import { cn } from "@/shared/lib/utils";

export function InterestsDiscoveryContent({
  categories,
  expandedSubcategories,
  isAtMax,
  personalityType,
  selectedIds,
  showBalanceNudge,
  suggestedTags,
  viewState,
  youMightAlsoLike,
  onAccordionChange,
  onRegisterCategory,
  onReject,
  onToggle,
  onToggleSubcategory,
}: InterestsDiscoveryContentProps) {
  return (
    <m.div
      layout="position"
      animate={{ opacity: viewState.isSearching ? 0 : 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex flex-col gap-2",
        viewState.isSearching && "pointer-events-none",
      )}
    >
      <PersonalizedSuggestionsSlot
        isAtMax={isAtMax}
        personalityType={personalityType}
        selectedIds={selectedIds}
        shouldShow={viewState.shouldShowSuggestions}
        suggestedTags={suggestedTags}
        onReject={onReject}
        onToggle={onToggle}
      />

      <BalanceNudgeSlot shouldShow={showBalanceNudge} />

      <Accordion
        type="multiple"
        value={viewState.openCategories}
        onValueChange={onAccordionChange}
      >
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            selectedIds={selectedIds}
            expandedSubcategories={expandedSubcategories}
            isAtMax={isAtMax}
            onRegisterCategory={onRegisterCategory}
            onToggleSubcategory={onToggleSubcategory}
            onToggleTag={onToggle}
          />
        ))}
      </Accordion>

      <YouMightAlsoLikeSlot
        isAtMax={isAtMax}
        selectedIds={selectedIds}
        shouldShow={viewState.shouldShowYouMightAlsoLike}
        tags={youMightAlsoLike}
        onReject={onReject}
        onToggle={onToggle}
      />
    </m.div>
  );
}
