import {
  Brush,
  Frame,
  Layers2,
  Monitor,
  Moon,
  PenLine,
  Sun,
} from "lucide-react";
import type { SegmentedTabOption } from "@/shared/components/ui/segmented-tabs";
import {
  DEFAULT_THEME_APPEARANCE,
  DEFAULT_THEME_COLOR,
  DEFAULT_THEME_STYLE,
  ThemeAppearance,
  type ThemeAppearance as ThemeAppearanceValue,
  ThemeColor,
  ThemeStyle,
} from "@/shared/constants/theme-preferences";
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

export interface GridOptionBoundaryState {
  isFirstColumnOnDesktop: boolean;
  isLastInGroup: boolean;
  isLastRowOnDesktop: boolean;
}

export interface ThemeOptionStatus {
  selected: boolean;
  isDefault: boolean;
  disabled: boolean;
}

export interface GridOptionBoundaryClassRule {
  className: string;
  isActive: (state: GridOptionBoundaryState) => boolean;
}

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
] as const satisfies readonly GridOptionBoundaryClassRule[];

export const APPEARANCE_OPTIONS = [
  {
    id: ThemeAppearance.SYSTEM,
    label: "System",
    shortLabel: "Auto",
    icon: Monitor,
  },
  {
    id: ThemeAppearance.LIGHT,
    label: "Light",
    icon: Sun,
  },
  {
    id: ThemeAppearance.DARK,
    label: "Dark",
    icon: Moon,
  },
] as const satisfies ReadonlyArray<SegmentedTabOption<ThemeAppearanceValue>>;

export const STYLE_OPTIONS = [
  {
    value: ThemeStyle.CLASSIC,
    label: "Classic",
    description: "Default material.",
    icon: Layers2,
  },
  {
    value: ThemeStyle.GLASS,
    label: "Glass",
    description: "Soft translucent panels.",
    icon: Brush,
  },
  {
    value: ThemeStyle.INK,
    label: "Ink",
    description: "Denser, tighter surfaces.",
    icon: PenLine,
  },
  {
    value: ThemeStyle.POSTER,
    label: "Poster",
    description: "Bolder graphic borders.",
    icon: Frame,
  },
] as const;

export const COLOR_OPTIONS = [
  {
    value: ThemeColor.GRAPHITE,
    label: "Graphite",
    description: "Dense neutral default.",
    tag: "Core",
    swatches: {
      light: [
        "bg-[#F2F2EF]",
        "bg-[#F9F9F4]",
        "bg-[#E9E9E3]",
        "bg-[#0F766E]",
        "bg-[#D98F00]",
      ],
      dark: [
        "bg-[#070908]",
        "bg-[#0E1110]",
        "bg-[#202522]",
        "bg-[#12A096]",
        "bg-[#FFBF00]",
      ],
    },
  },
  {
    value: ThemeColor.FORGE,
    label: "Ash",
    description: "Soft neutral surface.",
    tag: "Core",
    swatches: {
      light: [
        "bg-[#F3F3F0]",
        "bg-[#FAFAF5]",
        "bg-[#E7E9E4]",
        "bg-[#0F766E]",
        "bg-[#E49A00]",
      ],
      dark: [
        "bg-[#090B0A]",
        "bg-[#111412]",
        "bg-[#222722]",
        "bg-[#12A096]",
        "bg-[#FFBF00]",
      ],
    },
  },
  {
    value: ThemeColor.HARBOR,
    label: "Steel",
    description: "Cool graphite focus.",
    tag: "Core",
    swatches: {
      light: [
        "bg-[#EDF1F2]",
        "bg-[#F7FAF9]",
        "bg-[#E4EAEA]",
        "bg-[#0E7F76]",
        "bg-[#E99900]",
      ],
      dark: [
        "bg-[#071011]",
        "bg-[#0E1718]",
        "bg-[#1D2B2C]",
        "bg-[#14A397]",
        "bg-[#FFBF00]",
      ],
    },
  },
  {
    value: ThemeColor.EMBER,
    label: "Copper",
    description: "Warm graphite energy.",
    tag: "Core",
    swatches: {
      light: [
        "bg-[#F4F1ED]",
        "bg-[#FAF7F1]",
        "bg-[#ECE7DF]",
        "bg-[#0F766E]",
        "bg-[#E89400]",
      ],
      dark: [
        "bg-[#100E0B]",
        "bg-[#181512]",
        "bg-[#2A251F]",
        "bg-[#14A394]",
        "bg-[#FFBF00]",
      ],
    },
  },
  {
    value: ThemeColor.SPRUCE,
    label: "Sage",
    description: "Muted green-neutral.",
    tag: "Core",
    swatches: {
      light: [
        "bg-[#EEF3ED]",
        "bg-[#F7FAF4]",
        "bg-[#E6EDE4]",
        "bg-[#0E7A68]",
        "bg-[#DC9400]",
      ],
      dark: [
        "bg-[#0A100C]",
        "bg-[#101813]",
        "bg-[#222B22]",
        "bg-[#18A27F]",
        "bg-[#FFBF00]",
      ],
    },
  },
  {
    value: ThemeColor.PAPER,
    label: "Chalk",
    description: "Clean bright neutral.",
    tag: "Core",
    swatches: {
      light: [
        "bg-[#F7F7F2]",
        "bg-[#FCFCF7]",
        "bg-[#ECEEE8]",
        "bg-[#0F766E]",
        "bg-[#E99900]",
      ],
      dark: [
        "bg-[#101110]",
        "bg-[#171A17]",
        "bg-[#292D28]",
        "bg-[#14A194]",
        "bg-[#FFBF00]",
      ],
    },
  },
  {
    value: ThemeColor.ULTRAVIOLET,
    label: "Ultraviolet",
    description: "Violet with aqua contrast.",
    tag: "Experimental",
    swatches: {
      light: [
        "bg-[#F4F0FA]",
        "bg-[#FAF7FF]",
        "bg-[#ECE6F6]",
        "bg-[#6D3FD9]",
        "bg-[#009F95]",
      ],
      dark: [
        "bg-[#0E0A16]",
        "bg-[#15101F]",
        "bg-[#2B223A]",
        "bg-[#A78BFA]",
        "bg-[#2DD4BF]",
      ],
    },
  },
  {
    value: ThemeColor.COBALT,
    label: "Cobalt",
    description: "Blue with orange heat.",
    tag: "Experimental",
    swatches: {
      light: [
        "bg-[#EEF3FB]",
        "bg-[#F7FAFF]",
        "bg-[#E4ECF7]",
        "bg-[#2563EB]",
        "bg-[#EA580C]",
      ],
      dark: [
        "bg-[#07111F]",
        "bg-[#0D1A2C]",
        "bg-[#1E304A]",
        "bg-[#60A5FA]",
        "bg-[#FB923C]",
      ],
    },
  },
  {
    value: ThemeColor.CORAL,
    label: "Coral",
    description: "Warm with mint lift.",
    tag: "Experimental",
    swatches: {
      light: [
        "bg-[#FFF1EE]",
        "bg-[#FFF8F5]",
        "bg-[#F4E2DC]",
        "bg-[#C2410C]",
        "bg-[#0F9488]",
      ],
      dark: [
        "bg-[#160D0B]",
        "bg-[#201311]",
        "bg-[#34231F]",
        "bg-[#FB7185]",
        "bg-[#2DD4BF]",
      ],
    },
  },
  {
    value: ThemeColor.ACID,
    label: "Acid",
    description: "Vivid lime oddity.",
    tag: "Experimental",
    swatches: {
      light: [
        "bg-[#F5F9E8]",
        "bg-[#FCFFF1]",
        "bg-[#EAF2C8]",
        "bg-[#4D7C0F]",
        "bg-[#7C3AED]",
      ],
      dark: [
        "bg-[#0E1206]",
        "bg-[#151B0B]",
        "bg-[#2A3318]",
        "bg-[#A3E635]",
        "bg-[#C084FC]",
      ],
    },
  },
  {
    value: ThemeColor.MONO,
    label: "Mono",
    description: "Near-colorless focus.",
    tag: "Experimental",
    swatches: {
      light: [
        "bg-[#F4F4F2]",
        "bg-[#FAFAF7]",
        "bg-[#E9E9E6]",
        "bg-[#262626]",
        "bg-[#52525B]",
      ],
      dark: [
        "bg-[#050505]",
        "bg-[#101010]",
        "bg-[#262626]",
        "bg-[#E5E5E5]",
        "bg-[#A3A3A3]",
      ],
    },
  },
] as const;

export const APPEARANCE_OPTION_BY_ID = new Map(
  APPEARANCE_OPTIONS.map((option) => [option.id, option]),
);
export const STYLE_OPTION_BY_VALUE = new Map(
  STYLE_OPTIONS.map((option) => [option.value, option]),
);
export const COLOR_OPTION_BY_VALUE = new Map(
  COLOR_OPTIONS.map((option) => [option.value, option]),
);

export type ColorOption = (typeof COLOR_OPTIONS)[number];
