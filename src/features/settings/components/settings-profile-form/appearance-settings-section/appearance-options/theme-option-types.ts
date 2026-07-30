import type { APPEARANCE_OPTIONS } from "@/features/settings/components/settings-profile-form/appearance-settings-section/appearance-options/appearance-mode-options";
import type { COLOR_OPTIONS } from "@/features/settings/components/settings-profile-form/appearance-settings-section/appearance-options/color-options";
import type { STYLE_OPTIONS } from "@/features/settings/components/settings-profile-form/appearance-settings-section/appearance-options/style-options";
import type { NotificationPreferences } from "@/shared/schemas";

export type ThemePreferenceValues = Pick<
  NotificationPreferences,
  "themeAppearance" | "themeStyle" | "themeColor"
>;
export type ThemePreferenceKey = keyof ThemePreferenceValues;

export interface ThemeSelectionState extends ThemePreferenceValues {
  selectedAppearanceOption: (typeof APPEARANCE_OPTIONS)[number];
  selectedStyleOption: (typeof STYLE_OPTIONS)[number];
  selectedColorOption: (typeof COLOR_OPTIONS)[number];
  isDefaultTheme: boolean;
}

export interface ThemeSavingState {
  isSavingAppearance: boolean;
  isSavingStyle: boolean;
  isSavingColor: boolean;
}
