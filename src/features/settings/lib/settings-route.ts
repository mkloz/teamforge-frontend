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

export interface SettingsRouteSearch {
  section?: SettingsSection;
}

export function normalizeSettingsSection(
  value: string | null | undefined,
): SettingsSection | null {
  if (!value) {
    return null;
  }

  return settingsSectionValues.find((section) => section === value) ?? null;
}

export function validateSettingsRouteSearch(
  search: Record<string, unknown>,
): SettingsRouteSearch {
  return {
    section:
      typeof search.section === "string"
        ? (normalizeSettingsSection(search.section) ?? undefined)
        : undefined,
  };
}

function buildSettingsSearch(section?: SettingsSection | null) {
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
