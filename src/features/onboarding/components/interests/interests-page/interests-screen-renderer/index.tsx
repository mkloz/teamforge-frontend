import { AnimatePresence, motion } from "framer-motion";

import { ErrorOnboardingCatalogVisual } from "@/assets/error-state/error-onboarding-catalog";
import { InterestsBrowse } from "@/features/onboarding/components/interests/interests-browse";
import { InterestsReview } from "@/features/onboarding/components/interests/interests-review";
import type { UseInterestsReturn } from "@/features/onboarding/hooks/use-interests";
import { Button } from "@/shared/components/ui/button";
import { InterestsCatalogSkeleton } from "./interests-catalog-skeleton";
import { InterestsCatalogState } from "./interests-catalog-state";
import { InterestsIntro } from "./interests-intro";

interface InterestsScreenRendererProps {
  backLabel: string;
  isEditMode: boolean;
  onBack: () => void;
  state: UseInterestsReturn;
}

export function InterestsScreenRenderer({
  backLabel,
  isEditMode,
  onBack,
  state,
}: InterestsScreenRendererProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {state.screen === "intro" && (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <InterestsIntro
            backLabel={backLabel}
            onBack={onBack}
            onStart={() => state.setScreen("browse")}
          />
        </motion.div>
      )}

      {state.screen === "browse" && (
        <motion.div
          key="browse"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
        >
          <InterestsBrowseScreen state={state} isEditMode={isEditMode} />
        </motion.div>
      )}

      {state.screen === "review" && (
        <motion.div
          key="review"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
        >
          <InterestsReview
            categories={state.categories}
            leafById={state.leafById}
            selectedIds={state.selectedIds}
            onRemove={state.toggle}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface InterestsBrowseScreenProps {
  isEditMode: boolean;
  state: UseInterestsReturn;
}

function InterestsBrowseScreen({
  isEditMode,
  state,
}: InterestsBrowseScreenProps) {
  if (state.isCatalogLoading) {
    return <InterestsCatalogSkeleton />;
  }

  if (state.catalogError) {
    return (
      <InterestsCatalogState
        title="Couldn’t load interests"
        body="The interest catalog didn’t come through. Try again."
        visual={
          <ErrorOnboardingCatalogVisual className="mb-1 h-28 w-auto text-foreground" />
        }
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              void state.retryCatalog();
            }}
          >
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <InterestsBrowse
      categories={state.categories}
      leafById={state.leafById}
      selectedIds={state.selectedIds}
      searchQuery={state.searchQuery}
      searchResults={state.searchResults}
      personalityType={state.personalityType}
      suggestedTags={state.suggestedTags}
      youMightAlsoLike={state.youMightAlsoLike}
      showBalanceNudge={state.showBalanceNudge}
      isAtMax={state.isAtMax}
      collapsedCategories={state.collapsedCategories}
      expandedSubcategories={state.expandedSubcategories}
      onToggle={state.toggle}
      onReject={state.reject}
      onToggleCategory={state.toggleCategory}
      onToggleSubcategory={state.toggleSubcategory}
      onRegisterCategory={state.registerCategoryElement}
      hideContextLabel={isEditMode}
    />
  );
}
