import { APPEARANCE_OPTIONS } from "@/features/settings/components/settings-profile-form/appearance-settings-section/appearance-options/appearance-mode-options";
import { COLOR_OPTIONS } from "@/features/settings/components/settings-profile-form/appearance-settings-section/appearance-options/color-options";
import { STYLE_OPTIONS } from "@/features/settings/components/settings-profile-form/appearance-settings-section/appearance-options/style-options";

export {
  APPEARANCE_OPTION_BY_ID,
  COLOR_OPTION_BY_VALUE,
  STYLE_OPTION_BY_VALUE,
} from "@/features/settings/components/settings-profile-form/appearance-settings-section/appearance-options/option-maps";
export {
  DEFAULT_THEME_PREFERENCES,
  GRID_OPTION_BOUNDARY_CLASS_RULES,
} from "@/features/settings/components/settings-profile-form/appearance-settings-section/appearance-options/theme-option-constants";
export type {
  GridOptionBoundaryState,
  ThemeOptionStatus,
  ThemePreferenceKey,
  ThemePreferenceValues,
  ThemeSavingState,
  ThemeSelectionState,
} from "@/features/settings/components/settings-profile-form/appearance-settings-section/appearance-options/theme-option-types";
export { APPEARANCE_OPTIONS, COLOR_OPTIONS, STYLE_OPTIONS };

export type ColorOption = (typeof COLOR_OPTIONS)[number];
