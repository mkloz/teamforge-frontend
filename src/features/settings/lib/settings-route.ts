export const settingsSectionValues = [
  "account",
  "appearance",
  "matching",
  "privacy",
  "security",
  "safety",
  "notifications",
] as const;

export type SettingsSection = (typeof settingsSectionValues)[number];

export function normalizeSettingsSection(
  value: string | null | undefined,
): SettingsSection | null {
  if (!value) {
    return null;
  }

  return settingsSectionValues.includes(value as SettingsSection)
    ? (value as SettingsSection)
    : null;
}

export function buildSettingsSearch(section?: SettingsSection | null) {
  if (!section || section === "account") {
    return undefined;
  }

  return {
    section,
  } as const;
}

export function buildSettingsNavigation(section?: SettingsSection | null) {
  return {
    to: "/settings",
    search: buildSettingsSearch(section),
  } as const;
}
