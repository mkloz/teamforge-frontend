import {
  buildSettingsNavigation,
  type SettingsSection,
} from "@/shared/navigation/settings-navigation";

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
  "/invite",
] as const;

type OnboardingRoutePath = (typeof onboardingRoutePaths)[number];
export type OnboardingReturnTarget = (typeof onboardingReturnTargets)[number];

export interface OnboardingEditOptions {
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

function buildOnboardingReturnNavigation(
  returnTo: OnboardingReturnTarget | null,
  returnSearch: string | null,
  returnSection: SettingsSection | null,
) {
  if (!returnTo) {
    return null;
  }

  const normalizedSearch = getOnboardingReturnSearch({
    returnSearch,
    returnSection,
    returnTo,
  });

  return {
    to: returnTo,
    search: getOnboardingReturnSearchObject(normalizedSearch),
  } as const;
}

function getOnboardingReturnSearch({
  returnSearch,
  returnSection,
  returnTo,
}: {
  returnSearch: string | null;
  returnSection: SettingsSection | null;
  returnTo: OnboardingReturnTarget;
}) {
  return returnSearch ?? getSettingsReturnSearch(returnTo, returnSection);
}

function getSettingsReturnSearch(
  returnTo: OnboardingReturnTarget,
  returnSection: SettingsSection | null,
) {
  return returnTo === "/settings" && returnSection
    ? new URLSearchParams({ section: returnSection }).toString()
    : null;
}

function getOnboardingReturnSearchObject(normalizedSearch: string | null) {
  return normalizedSearch
    ? Object.fromEntries(new URLSearchParams(normalizedSearch).entries())
    : undefined;
}

export function resolveOnboardingExitNavigation(
  returnTo: OnboardingReturnTarget | null,
  returnSearch: string | null,
  returnSection: SettingsSection | null,
  fallback: "home" | "settings",
) {
  return (
    buildOnboardingReturnNavigation(returnTo, returnSearch, returnSection) ??
    getOnboardingFallbackNavigation(fallback, returnSection)
  );
}

function getOnboardingFallbackNavigation(
  fallback: "home" | "settings",
  returnSection: SettingsSection | null,
) {
  return fallback === "home"
    ? ({ to: "/home" } as const)
    : buildSettingsNavigation(returnSection);
}
