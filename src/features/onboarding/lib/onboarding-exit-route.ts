import type { OnboardingReturnTarget } from "@/features/onboarding/lib/onboarding-route";
import {
  buildSettingsNavigation,
  type SettingsSection,
} from "@/features/settings/lib/settings-route";

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
