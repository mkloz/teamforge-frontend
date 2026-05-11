import { zodResolver } from "@hookform/resolvers/zod";
import type { FormEventHandler } from "react";
import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { InterestsFooter } from "@/features/onboarding/components/interests/interests-page/interests-footer";
import { InterestsPersistentHeader } from "@/features/onboarding/components/interests/interests-page/interests-persistent-header";
import { InterestsProgressDecoration } from "@/features/onboarding/components/interests/interests-page/interests-progress-decoration";
import { InterestsScreenRenderer } from "@/features/onboarding/components/interests/interests-page/interests-screen-renderer";
import {
  interestsCatalogFixtureCategories,
  interestsCatalogFixtureExpandedSubcategories,
  interestsCatalogFixtureLeafById,
  interestsCatalogFixtureRelatedTags,
  interestsCatalogFixtureSelectedIds,
  interestsCatalogFixtureSuggestedTags,
} from "@/features/onboarding/components/interests/interests-page/interests-screen-renderer/interests-catalog-fixture";
import { LengthSelector } from "@/features/onboarding/components/personality/personality-screen-renderer/length-selector";
import { ProfileBasicsCard } from "@/features/onboarding/components/profile-basics";
import type { UseInterestsReturn } from "@/features/onboarding/hooks/use-interests";
import {
  getProfileBasicsProgress,
  PROFILE_BASICS_DEFAULT_VALUES,
} from "@/features/onboarding/lib/profile-basics-form-model";
import {
  InterestsPageContent,
  PersonalityPageContent,
  ProfileBasicsPageContent,
} from "@/features/onboarding/onboarding-page-content";
import {
  type ProfileBasicsValues,
  profileBasicsSchema,
} from "@/features/onboarding/schemas/profile-basics.schema";
import {
  GeneratedPageLoading,
  type PageLoadingProps,
} from "@/shared/components/loading/page-loading";

type OnboardingLoadingStep = "interests" | "personality" | "profile";

interface OnboardingPageLoadingProps extends PageLoadingProps {
  step: OnboardingLoadingStep;
}

const ONBOARDING_LOADING_NAMES = {
  interests: "onboarding.interests-page",
  personality: "onboarding.personality-page",
  profile: "onboarding.profile-page",
} satisfies Record<OnboardingLoadingStep, string>;

const noop = () => {};

const asyncNoop = async () => {};

const preventFixtureSubmit: FormEventHandler<HTMLFormElement> = (event) => {
  event.preventDefault();
};

export function OnboardingPageLoading({ step }: OnboardingPageLoadingProps) {
  const fixture = <OnboardingPageLoadingFixture step={step} />;

  return (
    <GeneratedPageLoading
      name={ONBOARDING_LOADING_NAMES[step]}
      fixture={fixture}
    >
      {fixture}
    </GeneratedPageLoading>
  );
}

export function OnboardingPageLoadingFixture({
  step,
}: Pick<OnboardingPageLoadingProps, "step">) {
  if (step === "profile") {
    return <ProfileBasicsLoadingFixture />;
  }

  if (step === "personality") {
    return <PersonalityLoadingFixture />;
  }

  return <InterestsLoadingFixture />;
}

function ProfileBasicsLoadingFixture() {
  const form = useForm<ProfileBasicsValues>({
    resolver: zodResolver(profileBasicsSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: PROFILE_BASICS_DEFAULT_VALUES,
  });
  const watchedValues = form.watch();

  return (
    <ProfileBasicsPageContent
      progress={getProfileBasicsProgress(watchedValues)}
      onInput={noop}
    >
      <ProfileBasicsCard
        form={form}
        watchedValues={watchedValues}
        saveError={null}
        isSaving={false}
        onSubmit={preventFixtureSubmit}
      />
    </ProfileBasicsPageContent>
  );
}

function PersonalityLoadingFixture() {
  return (
    <PersonalityPageContent
      catalystProgress={0.5}
      displayProgress={0.5}
      hasTopPadding
      showHomeLink
    >
      <LengthSelector
        initialLength={50}
        onBack={noop}
        onBegin={noop}
        onSelectionChange={noop}
      />
    </PersonalityPageContent>
  );
}

function InterestsLoadingFixture() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const state = useMemo(() => buildInterestsFixtureState(), []);
  const progress = state.selectedCount / 15;

  return (
    <InterestsPageContent
      progress={progress}
      scrollContainerRef={scrollContainerRef}
      header={
        <>
          <InterestsProgressDecoration progress={progress} />
          <InterestsPersistentHeader
            state={state}
            scrollRef={scrollContainerRef}
          />
        </>
      }
      footer={
        <InterestsFooter
          state={state}
          backLabel="Back to personality"
          isEditMode={false}
          onBack={noop}
        />
      }
    >
      <InterestsScreenRenderer
        state={state}
        backLabel="Back to personality"
        onBack={noop}
        isEditMode={false}
      />
    </InterestsPageContent>
  );
}

function buildInterestsFixtureState(): UseInterestsReturn {
  return {
    screen: "browse",
    personalityType: "ENFP",
    categories: interestsCatalogFixtureCategories,
    leafById: interestsCatalogFixtureLeafById,
    searchQuery: "",
    collapsedCategories: new Set<string>(),
    expandedSubcategories: interestsCatalogFixtureExpandedSubcategories,
    selectedIds: interestsCatalogFixtureSelectedIds,
    selectedCount: interestsCatalogFixtureSelectedIds.size,
    canContinue: false,
    isAtMax: false,
    suggestedTags: interestsCatalogFixtureSuggestedTags,
    searchResults: {
      tags: [],
      subcategories: [],
    },
    youMightAlsoLike: interestsCatalogFixtureRelatedTags,
    showBalanceNudge: false,
    isCatalogLoading: false,
    catalogError: null,
    isSaving: false,
    saveErrorMessage: null,
    setSearchQuery: noop,
    toggleCategory: noop,
    expandCategoryOnly: noop,
    jumpToCategory: noop,
    registerCategoryElement: noop,
    toggleSubcategory: noop,
    goToReview: noop,
    goToBrowse: noop,
    setScreen: noop,
    toggle: noop,
    reject: noop,
    finalize: asyncNoop,
    retryCatalog: async () => {
      throw new Error("Fixture retry is unavailable.");
    },
    isPending: false,
    reset: noop,
  };
}
