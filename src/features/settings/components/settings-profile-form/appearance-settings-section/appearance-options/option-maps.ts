import { APPEARANCE_OPTIONS } from "@/features/settings/components/settings-profile-form/appearance-settings-section/appearance-options/appearance-mode-options";
import { COLOR_OPTIONS } from "@/features/settings/components/settings-profile-form/appearance-settings-section/appearance-options/color-options";
import { STYLE_OPTIONS } from "@/features/settings/components/settings-profile-form/appearance-settings-section/appearance-options/style-options";

export const APPEARANCE_OPTION_BY_ID = new Map(
  APPEARANCE_OPTIONS.map((option) => [option.id, option]),
);
export const STYLE_OPTION_BY_VALUE = new Map(
  STYLE_OPTIONS.map((option) => [option.value, option]),
);
export const COLOR_OPTION_BY_VALUE = new Map(
  COLOR_OPTIONS.map((option) => [option.value, option]),
);
