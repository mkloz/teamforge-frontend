import {
  buildGroupPlanDetailNavigation,
  validateGroupPlanDetailSearch,
} from "@/shared/navigation/group-navigation";
import {
  buildSettingsNavigation,
  type SettingsSection,
} from "@/shared/navigation/settings-navigation";

const onboardingRoutePaths = [
  "/onboarding/profile",
  "/onboarding/intent",
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
  "/plans/new",
  "/invite",
  "/groups/$groupId",
] as const;

type OnboardingRoutePath = (typeof onboardingRoutePaths)[number];
export type OnboardingReturnTarget = (typeof onboardingReturnTargets)[number];

export interface OnboardingEditOptions {
  returnTo: OnboardingReturnTarget;
  returnSearch?: string | null;
  returnSection?: SettingsSection | null;
  returnGroupId?: string | null;
  mbti?: string | null;
}

function buildOnboardingEditSearch({
  returnTo,
  returnSearch,
  returnSection,
  returnGroupId,
  mbti,
}: OnboardingEditOptions) {
  return {
    mode: "edit" as const,
    returnTo,
    ...(returnSearch ? { returnSearch } : {}),
    ...(returnTo === "/settings" && returnSection ? { returnSection } : {}),
    ...(returnTo === "/groups/$groupId" && returnGroupId
      ? { returnGroupId }
      : {}),
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

export function buildProfileBasicsContinuationNavigation(
  options: Omit<OnboardingEditOptions, "mbti">,
) {
  return {
    to: "/onboarding/profile" as const,
    search: buildOnboardingEditSearch(options),
  };
}

export function buildInterestsContinuationNavigation(
  options: OnboardingEditOptions,
) {
  const { mode: _mode, ...search } = buildOnboardingEditSearch(options);
  return { to: "/onboarding/interests" as const, search };
}

export function buildPersonalityContinuationNavigation(
  options: Omit<OnboardingEditOptions, "mbti">,
) {
  const { mode: _mode, ...search } = buildOnboardingEditSearch(options);
  return { to: "/onboarding/personality" as const, search };
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
  returnGroupId: string | null,
) {
  if (!returnTo) {
    return null;
  }

  const normalizedSearch = getOnboardingReturnSearch({
    returnSearch,
    returnSection,
    returnTo,
  });

  if (returnTo === "/groups/$groupId") {
    return returnGroupId
      ? buildGroupPlanDetailNavigation(
          returnGroupId,
          validateGroupPlanDetailSearch(
            getOnboardingReturnSearchObject(normalizedSearch) ?? {},
          ),
        )
      : null;
  }

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
  returnGroupId: string | null = null,
) {
  return (
    buildOnboardingReturnNavigation(
      returnTo,
      returnSearch,
      returnSection,
      returnGroupId,
    ) ?? getOnboardingFallbackNavigation(fallback, returnSection)
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
