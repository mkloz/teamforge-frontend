export const themeAppearanceValues = ["system", "light", "dark"] as const;
export const themeStyleValues = ["classic", "glass", "ink", "poster"] as const;
export const themeColorValues = [
  "graphite",
  "forge",
  "harbor",
  "ember",
  "spruce",
  "paper",
  "ultraviolet",
  "cobalt",
  "coral",
  "acid",
  "mono",
] as const;

export type ThemeAppearance = (typeof themeAppearanceValues)[number];
export type ThemeStyle = (typeof themeStyleValues)[number];
export type ThemeColor = (typeof themeColorValues)[number];

export const ThemeAppearance = {
  SYSTEM: "system",
  LIGHT: "light",
  DARK: "dark",
} as const satisfies Record<string, ThemeAppearance>;

export const ThemeStyle = {
  CLASSIC: "classic",
  GLASS: "glass",
  INK: "ink",
  POSTER: "poster",
} as const satisfies Record<string, ThemeStyle>;

export const ThemeColor = {
  GRAPHITE: "graphite",
  FORGE: "forge",
  HARBOR: "harbor",
  EMBER: "ember",
  SPRUCE: "spruce",
  PAPER: "paper",
  ULTRAVIOLET: "ultraviolet",
  COBALT: "cobalt",
  CORAL: "coral",
  ACID: "acid",
  MONO: "mono",
} as const satisfies Record<string, ThemeColor>;

export const DEFAULT_THEME_APPEARANCE = ThemeAppearance.SYSTEM;
export const DEFAULT_THEME_STYLE = ThemeStyle.CLASSIC;
export const DEFAULT_THEME_COLOR = ThemeColor.GRAPHITE;

export const THEME_PREFERENCE_STORAGE_KEY = "teamforge:appearance:v2";
export const THEME_PREFERENCE_VERSION = 2;

export interface ThemePreferenceSnapshot {
  themeAppearance: ThemeAppearance;
  themeColor: ThemeColor;
  themeStyle: ThemeStyle;
}

const LEGACY_THEME_COLOR_MIGRATION: Readonly<
  Partial<Record<ThemeColor, ThemeColor>>
> = {
  acid: ThemeColor.MONO,
  cobalt: ThemeColor.MONO,
  coral: ThemeColor.EMBER,
  paper: ThemeColor.GRAPHITE,
  spruce: ThemeColor.FORGE,
  ultraviolet: ThemeColor.MONO,
};

export const PURPOSE_THEME_COLORS = [
  ThemeColor.GRAPHITE,
  ThemeColor.FORGE,
  ThemeColor.EMBER,
  ThemeColor.MONO,
  ThemeColor.HARBOR,
] as const;

export function normalizeThemeAppearance(value: unknown): ThemeAppearance {
  switch (value) {
    case ThemeAppearance.SYSTEM:
    case ThemeAppearance.LIGHT:
    case ThemeAppearance.DARK:
      return value;
    default:
      return DEFAULT_THEME_APPEARANCE;
  }
}

export function normalizeThemeStyle(value: unknown): ThemeStyle {
  switch (value) {
    case ThemeStyle.CLASSIC:
    case ThemeStyle.GLASS:
    case ThemeStyle.INK:
    case ThemeStyle.POSTER:
      return value;
    default:
      return DEFAULT_THEME_STYLE;
  }
}

export function normalizeThemeColor(value: unknown): ThemeColor {
  switch (value) {
    case ThemeColor.GRAPHITE:
    case ThemeColor.FORGE:
    case ThemeColor.EMBER:
    case ThemeColor.MONO:
    case ThemeColor.HARBOR:
      return value;
    case ThemeColor.ACID:
    case ThemeColor.COBALT:
    case ThemeColor.CORAL:
    case ThemeColor.PAPER:
    case ThemeColor.SPRUCE:
    case ThemeColor.ULTRAVIOLET:
      return LEGACY_THEME_COLOR_MIGRATION[value] ?? DEFAULT_THEME_COLOR;
    default:
      return DEFAULT_THEME_COLOR;
  }
}

export function normalizeThemePreferences(value: {
  themeAppearance?: unknown;
  themeColor?: unknown;
  themeStyle?: unknown;
}): ThemePreferenceSnapshot {
  return {
    themeAppearance: normalizeThemeAppearance(value.themeAppearance),
    themeColor: normalizeThemeColor(value.themeColor),
    themeStyle: normalizeThemeStyle(value.themeStyle),
  };
}
