import type { ThemePreferenceValues } from "@/features/settings/components/settings-profile-form/appearance-settings-section/appearance-options/theme-option-types";
import {
  DEFAULT_THEME_APPEARANCE,
  DEFAULT_THEME_COLOR,
  DEFAULT_THEME_STYLE,
} from "@/shared/constants/theme-preferences";

export const DEFAULT_THEME_PREFERENCES = {
  themeAppearance: DEFAULT_THEME_APPEARANCE,
  themeStyle: DEFAULT_THEME_STYLE,
  themeColor: DEFAULT_THEME_COLOR,
} satisfies ThemePreferenceValues;
