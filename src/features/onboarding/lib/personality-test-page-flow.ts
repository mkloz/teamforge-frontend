import type { SettingsSection } from "@/features/settings/lib/settings-route";
import { resolveOnboardingExitNavigation } from "@/features/onboarding/lib/onboarding-exit-route";
import type { OnboardingReturnTarget } from "@/features/onboarding/lib/onboarding-route";
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
  return {
    ...(returnTo ? { returnTo } : {}),
    ...(returnSearch ? { returnSearch } : {}),
    ...(returnSection ? { returnSection } : {}),
  };
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
