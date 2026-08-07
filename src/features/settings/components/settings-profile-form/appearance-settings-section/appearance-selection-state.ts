import {
  DEFAULT_THEME_APPEARANCE,
  DEFAULT_THEME_COLOR,
  DEFAULT_THEME_STYLE,
  normalizeThemePreferences,
  type ThemeAppearance as ThemeAppearanceValue,
  type ThemeStyle as ThemeStyleValue,
} from "@/shared/constants/theme-preferences";
import type { NotificationPreferences } from "@/shared/schemas";
import {
  APPEARANCE_OPTION_BY_ID,
  APPEARANCE_OPTIONS,
  COLOR_OPTIONS,
  STYLE_OPTION_BY_VALUE,
  STYLE_OPTIONS,
  type ThemePreferenceKey,
  type ThemePreferenceValues,
  type ThemeSelectionState,
} from "./appearance-options";

export function getThemeSelectionState(
  notificationPreferences: NotificationPreferences | null,
  fallback: ThemePreferenceValues,
): ThemeSelectionState {
  const selectedValues = normalizeThemePreferences(
    getSelectedThemeValues(notificationPreferences, fallback),
  );

  return {
    ...selectedValues,
    selectedAppearanceOption: getSelectedAppearanceOption(
      selectedValues.themeAppearance,
    ),
    selectedStyleOption: getSelectedStyleOption(selectedValues.themeStyle),
    selectedColorOption: getSelectedColorOption(selectedValues.themeColor),
    isDefaultTheme: getIsDefaultTheme(selectedValues),
  };
}

function getSelectedThemeValues(
  notificationPreferences: NotificationPreferences | null,
  fallback: ThemePreferenceValues,
): ThemePreferenceValues {
  return {
    themeAppearance: getThemePreferenceValue(
      notificationPreferences,
      fallback,
      "themeAppearance",
    ),
    themeStyle: getThemePreferenceValue(
      notificationPreferences,
      fallback,
      "themeStyle",
    ),
    themeColor: getThemePreferenceValue(
      notificationPreferences,
      fallback,
      "themeColor",
    ),
  };
}

function getThemePreferenceValue<Key extends ThemePreferenceKey>(
  notificationPreferences: NotificationPreferences | null,
  fallback: ThemePreferenceValues,
  key: Key,
) {
  return notificationPreferences?.[key] ?? fallback[key];
}

function getSelectedAppearanceOption(themeAppearance: ThemeAppearanceValue) {
  return APPEARANCE_OPTION_BY_ID.get(themeAppearance) ?? APPEARANCE_OPTIONS[0];
}

function getSelectedStyleOption(themeStyle: ThemeStyleValue) {
  return STYLE_OPTION_BY_VALUE.get(themeStyle) ?? STYLE_OPTIONS[0];
}

function getSelectedColorOption(
  themeColor: ReturnType<typeof normalizeThemePreferences>["themeColor"],
) {
  return (
    COLOR_OPTIONS.find((option) => option.value === themeColor) ??
    COLOR_OPTIONS[0]
  );
}

function getIsDefaultTheme({
  themeAppearance,
  themeColor,
  themeStyle,
}: ThemePreferenceValues) {
  return (
    themeAppearance === DEFAULT_THEME_APPEARANCE &&
    themeStyle === DEFAULT_THEME_STYLE &&
    themeColor === DEFAULT_THEME_COLOR
  );
}
