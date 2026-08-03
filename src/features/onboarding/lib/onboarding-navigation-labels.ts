import type {
  OnboardingReturnTarget,
  SettingsSection,
} from "@/shared/navigation";

const returnTargetLabels: Record<OnboardingReturnTarget, string> = {
  "/activity": "activity",
  "/explore": "explore",
  "/forge": "forge",
  "/home": "home",
  "/invite": "your invitation",
  "/profile": "profile",
  "/settings": "settings",
};

const settingsSectionLabels: Record<SettingsSection, string> = {
  account: "account settings",
  appearance: "appearance settings",
  matching: "group fit settings",
  notifications: "notification settings",
  privacy: "privacy settings",
  safety: "safety settings",
  security: "security settings",
};

export function getOnboardingReturnDestinationLabel(
  returnTo: OnboardingReturnTarget | null,
  returnSection: SettingsSection | null,
  fallback: string,
) {
  if (returnTo === "/settings" && returnSection) {
    return settingsSectionLabels[returnSection];
  }

  if (returnTo) {
    return returnTargetLabels[returnTo];
  }

  return fallback;
}

export function buildBackToLabel(destination: string) {
  return `Back to ${destination}`;
}
