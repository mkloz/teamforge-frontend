import { MIN_INTERESTS } from "@/features/onboarding/data/interests-data";
import { resolveOnboardingExitNavigation } from "@/features/onboarding/lib/onboarding-exit-route";
import { buildOnboardingReturnSearch } from "@/features/onboarding/lib/onboarding-flow-state";
import type { OnboardingReturnTarget } from "@/features/onboarding/lib/onboarding-route";
import type { SettingsSection } from "@/features/settings/lib/settings-route";
import type { PersonalityType } from "@/shared/schemas";

interface InterestsFlowSearchParams {
  returnTo: OnboardingReturnTarget | null;
  returnSearch: string | null;
  returnSection: SettingsSection | null;
  mbti: PersonalityType | null;
}

export function buildInterestsFlowSearch({
  returnTo,
  returnSearch,
  returnSection,
  mbti,
}: InterestsFlowSearchParams) {
  return {
    ...buildOnboardingReturnSearch({ returnTo, returnSearch, returnSection }),
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
  );
}
