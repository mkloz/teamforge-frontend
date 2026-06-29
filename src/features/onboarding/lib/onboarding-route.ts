import type { SettingsSection } from "@/shared/navigation/settings-navigation";

const onboardingRoutePaths = [
  "/onboarding/profile",
  "/onboarding/personality",
  "/onboarding/interests",
] as const;

export const onboardingModeValues = ["edit"] as const;

export const onboardingReturnTargets = [
  "/home",
  "/explore",
  "/activity",
  "/profile",
  "/settings",
  "/forge",
] as const;

type OnboardingRoutePath = (typeof onboardingRoutePaths)[number];
export type OnboardingReturnTarget = (typeof onboardingReturnTargets)[number];

interface OnboardingEditOptions {
  returnTo: OnboardingReturnTarget;
  returnSearch?: string | null;
  returnSection?: SettingsSection | null;
  mbti?: string | null;
}

function buildOnboardingEditSearch({
  returnTo,
  returnSearch,
  returnSection,
  mbti,
}: OnboardingEditOptions) {
  return {
    mode: "edit" as const,
    returnTo,
    ...(returnSearch ? { returnSearch } : {}),
    ...(returnTo === "/settings" && returnSection ? { returnSection } : {}),
    ...(mbti ? { mbti } : {}),
  };
}

function buildOnboardingEditNavigation(
  to: OnboardingRoutePath,
  options: OnboardingEditOptions,
) {
  return {
    to,
    search: buildOnboardingEditSearch(options),
  } as const;
}

export function buildPersonalityEditNavigation(
  options: Omit<OnboardingEditOptions, "mbti">,
) {
  return buildOnboardingEditNavigation("/onboarding/personality", options);
}

export function buildInterestsEditNavigation(options: OnboardingEditOptions) {
  return buildOnboardingEditNavigation("/onboarding/interests", options);
}
