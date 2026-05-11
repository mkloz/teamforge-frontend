import { InterestsBrowse } from "@/features/onboarding/components/interests/interests-browse";
import { GeneratedSkeleton } from "@/shared/components/loading/generated-skeleton";
import {
  interestsCatalogFixtureCategories,
  interestsCatalogFixtureExpandedSubcategories,
  interestsCatalogFixtureLeafById,
  interestsCatalogFixtureRelatedTags,
  interestsCatalogFixtureSelectedIds,
  interestsCatalogFixtureSuggestedTags,
} from "./interests-catalog-fixture";

export const INTERESTS_CATALOG_SKELETON_NAME = "onboarding.interests-catalog";

const noop = () => {};

export function InterestsCatalogSkeleton() {
  const fixture = <InterestsCatalogSkeletonFixture />;

  return (
    <GeneratedSkeleton
      name={INTERESTS_CATALOG_SKELETON_NAME}
      loading
      fixture={fixture}
      fallback={null}
    >
      {fixture}
    </GeneratedSkeleton>
  );
}

export function InterestsCatalogSkeletonFixture() {
  return (
    <div aria-busy="true" aria-label="Loading interests" role="status">
      <span className="sr-only">Loading interests</span>
      <InterestsBrowse
        categories={interestsCatalogFixtureCategories}
        leafById={interestsCatalogFixtureLeafById}
        selectedIds={interestsCatalogFixtureSelectedIds}
        searchQuery=""
        searchResults={{ tags: [], subcategories: [] }}
        personalityType="ENFP"
        suggestedTags={interestsCatalogFixtureSuggestedTags}
        youMightAlsoLike={interestsCatalogFixtureRelatedTags}
        showBalanceNudge={false}
        isAtMax={false}
        collapsedCategories={new Set<string>()}
        expandedSubcategories={interestsCatalogFixtureExpandedSubcategories}
        onToggle={noop}
        onReject={noop}
        onToggleCategory={noop}
        onToggleSubcategory={noop}
        onRegisterCategory={noop}
      />
    </div>
  );
}
