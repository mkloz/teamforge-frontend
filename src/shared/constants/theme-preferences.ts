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
