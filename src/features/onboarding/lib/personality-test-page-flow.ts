import { resolveOnboardingExitNavigation } from "@/features/onboarding/lib/onboarding-exit-route";
import { buildOnboardingReturnSearch } from "@/features/onboarding/lib/onboarding-flow-state";
import type { OnboardingReturnTarget } from "@/features/onboarding/public/onboarding-navigation";
import type { SettingsSection } from "@/shared/navigation/settings-navigation";
import type { PersonalityType } from "@/shared/schemas";

interface PersonalityFlowSearchParams {
  returnTo: OnboardingReturnTarget | null;
  returnSearch: string | null;
  returnSection: SettingsSection | null;
}

interface PersonalityNextSearchParams extends PersonalityFlowSearchParams {
  mbti: PersonalityType | null;
}

export function buildPersonalityPreviousSearch({
  returnTo,
  returnSearch,
  returnSection,
}: PersonalityFlowSearchParams) {
  return buildOnboardingReturnSearch({ returnTo, returnSearch, returnSection });
}

export function buildPersonalityNextSearch({
  mbti,
  returnTo,
  returnSearch,
  returnSection,
}: PersonalityNextSearchParams) {
  return {
    ...(mbti ? { mbti } : {}),
    ...buildPersonalityPreviousSearch({
      returnTo,
      returnSearch,
      returnSection,
    }),
  };
}

export function resolvePersonalityExitNavigation(
  flowSearch: PersonalityFlowSearchParams,
) {
  return resolveOnboardingExitNavigation(
    flowSearch.returnTo,
    flowSearch.returnSearch,
    flowSearch.returnSection,
    "settings",
  );
}
