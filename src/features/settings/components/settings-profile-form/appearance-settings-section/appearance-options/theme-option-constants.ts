import type {
  GridOptionBoundaryState,
  ThemePreferenceValues,
} from "@/features/settings/components/settings-profile-form/appearance-settings-section/appearance-options/theme-option-types";
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

export const GRID_OPTION_BOUNDARY_CLASS_RULES = [
  {
    className: "md:border-r md:pr-5",
    isActive: ({ isFirstColumnOnDesktop }) => isFirstColumnOnDesktop,
  },
  {
    className: "md:pl-5",
    isActive: ({ isFirstColumnOnDesktop }) => !isFirstColumnOnDesktop,
  },
  {
    className: "border-b-0",
    isActive: ({ isLastInGroup }) => isLastInGroup,
  },
  {
    className: "md:border-b-0",
    isActive: ({ isLastRowOnDesktop }) => isLastRowOnDesktop,
  },
] as const satisfies readonly {
  className: string;
  isActive: (state: GridOptionBoundaryState) => boolean;
}[];
