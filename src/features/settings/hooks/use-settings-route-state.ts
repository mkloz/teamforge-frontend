import { parseAsStringLiteral, useQueryState } from "nuqs";

import {
  normalizeSettingsSection,
  type SettingsSection,
  settingsSectionValues,
} from "@/shared/navigation/settings-navigation";

const DEFAULT_SETTINGS_SECTION: SettingsSection = "account";

export function useSettingsRouteState() {
  const [section, setSection] = useQueryState(
    "section",
    parseAsStringLiteral(settingsSectionValues).withOptions({
      history: "push",
      scroll: true,
    }),
  );

  const activeSection =
    normalizeSettingsSection(section) ?? DEFAULT_SETTINGS_SECTION;

  function setActiveSection(
    nextSection: SettingsSection,
    options?: { history?: "push" | "replace" },
  ) {
    void setSection(nextSection, {
      history: options?.history ?? "push",
      scroll: true,
    });
  }

  return {
    activeSection,
    explicitSection: section,
    setActiveSection,
  };
}
