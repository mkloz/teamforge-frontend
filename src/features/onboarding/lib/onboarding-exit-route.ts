import type { OnboardingReturnTarget } from "@/features/onboarding/lib/onboarding-route";
import {
  buildSettingsNavigation,
  type SettingsSection,
} from "@/features/settings/lib/settings-route";

export function buildOnboardingReturnNavigation(
  returnTo: OnboardingReturnTarget | null,
  returnSearch: string | null,
  returnSection: SettingsSection | null,
) {
  if (!returnTo) {
    return null;
  }

  const normalizedSearch =
    returnSearch ??
    (returnTo === "/settings" && returnSection
      ? new URLSearchParams({ section: returnSection }).toString()
      : null);

  return {
    to: returnTo,
    search: normalizedSearch
      ? Object.fromEntries(new URLSearchParams(normalizedSearch).entries())
      : undefined,
  } as const;
}

export function resolveOnboardingExitNavigation(
  returnTo: OnboardingReturnTarget | null,
  returnSearch: string | null,
  returnSection: SettingsSection | null,
  fallback: "home" | "settings",
) {
  return (
    buildOnboardingReturnNavigation(returnTo, returnSearch, returnSection) ??
    (fallback === "home"
      ? ({ to: "/home" } as const)
      : buildSettingsNavigation(returnSection))
  );
}
