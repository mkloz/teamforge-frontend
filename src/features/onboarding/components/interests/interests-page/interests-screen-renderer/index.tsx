import { RefreshCw } from "lucide-react";
import { lazy, Suspense } from "react";

import { ErrorOnboardingCatalogVisual } from "@/features/onboarding/assets/error-onboarding-catalog";
import type { UseInterestsReturn } from "@/features/onboarding/hooks/use-interests";
import { Button } from "@/shared/components/ui/button";
import { InterestsCatalogSkeleton } from "./interests-catalog-skeleton";
import { InterestsCatalogState } from "./interests-catalog-state";
import { InterestsIntro } from "./interests-intro";

const InterestsBrowse = lazy(() =>
  import("@/features/onboarding/components/interests/interests-browse").then(
    (module) => ({ default: module.InterestsBrowse }),
  ),
);
const InterestsReview = lazy(() =>
  import("@/features/onboarding/components/interests/interests-review").then(
    (module) => ({ default: module.InterestsReview }),
  ),
);

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
  if (state.screen === "intro") {
    return (
      <InterestsIntro
        backLabel={backLabel}
        onBack={onBack}
        onStart={() => state.setScreen("browse")}
      />
    );
  }

  if (state.screen === "browse") {
    return (
      <Suspense fallback={<InterestsCatalogSkeleton />}>
        <div>
          <InterestsBrowseScreen state={state} isEditMode={isEditMode} />
        </div>
      </Suspense>
    );
  }

  if (state.screen === "review") {
    return (
      <Suspense fallback={null}>
        <div>
          <InterestsReview
            categories={state.categories}
            leafById={state.leafById}
            selectedIds={state.selectedIds}
            onRemove={state.toggle}
          />
        </div>
      </Suspense>
    );
  }

  return null;
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
            <RefreshCw className="size-4" aria-hidden="true" />
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
