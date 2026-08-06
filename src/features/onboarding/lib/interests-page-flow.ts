import { MIN_INTERESTS } from "@/features/onboarding/data/interests-data";
import { buildOnboardingReturnSearch } from "@/features/onboarding/lib/onboarding-flow-state";
import {
  type OnboardingReturnTarget,
  resolveOnboardingExitNavigation,
  type SettingsSection,
} from "@/shared/navigation";
import type { PersonalityType } from "@/shared/schemas";

interface InterestsFlowSearchParams {
  returnTo: OnboardingReturnTarget | null;
  returnSearch: string | null;
  returnSection: SettingsSection | null;
  returnGroupId: string | null;
  mbti: PersonalityType | null;
}

export function buildInterestsFlowSearch({
  returnTo,
  returnSearch,
  returnSection,
  returnGroupId,
  mbti,
}: InterestsFlowSearchParams) {
  return {
    ...buildOnboardingReturnSearch({
      returnTo,
      returnSearch,
      returnSection,
      returnGroupId,
    }),
    ...(mbti ? { mbti } : {}),
  };
}

export function getInterestsProgress(selectedCount: number) {
  return Math.min(selectedCount / MIN_INTERESTS, 1);
}

export function resolveInterestsExitNavigation(
  flowSearch: Omit<InterestsFlowSearchParams, "mbti">,
  fallback: "home" | "settings",
) {
  return resolveOnboardingExitNavigation(
    flowSearch.returnTo,
    flowSearch.returnSearch,
    flowSearch.returnSection,
    fallback,
    flowSearch.returnGroupId,
  );
}
