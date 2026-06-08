import { useEffect } from "react";
import { create } from "zustand";
import {
  DEFAULT_THEME_APPEARANCE,
  DEFAULT_THEME_COLOR,
  DEFAULT_THEME_STYLE,
  ThemeAppearance,
  type ThemeAppearance as ThemeAppearanceValue,
  type ThemeColor as ThemeColorValue,
  type ThemeStyle as ThemeStyleValue,
} from "@/shared/constants/theme-preferences";
import {
  getBrowserComputedStyle,
  getBrowserDocumentElement,
  getBrowserMediaQuery,
} from "@/shared/lib/browser-environment";
import type { ScheduledAnimationFrameHandle } from "@/shared/lib/browser-scheduling";
import {
  cancelScheduledAnimationFrame,
  scheduleAnimationFrame,
} from "@/shared/lib/browser-scheduling";

export const Theme = {
  LIGHT: "light",
  DARK: "dark",
} as const;

type Theme = (typeof Theme)[keyof typeof Theme];

interface ThemeStore {
  theme: Theme;
  appearance: ThemeAppearanceValue;
  themeStyle: ThemeStyleValue;
  themeColor: ThemeColorValue;
  setAppearance: (appearance: ThemeAppearanceValue) => void;
  setTheme: (theme: Theme) => void;
  setThemeStyle: (themeStyle: ThemeStyleValue) => void;
  setThemeColor: (themeColor: ThemeColorValue) => void;
  setThemePreferences: (preferences: {
    themeAppearance?: ThemeAppearanceValue;
    themeStyle?: ThemeStyleValue;
    themeColor?: ThemeColorValue;
  }) => void;
  syncWithSystem: (theme: Theme) => void;
  inverse: () => void;
}

function getResolvedSystemTheme() {
  const mediaQuery = getBrowserMediaQuery("(prefers-color-scheme: dark)");

  return mediaQuery?.matches ? Theme.DARK : Theme.LIGHT;
}

function resolveThemeAppearance(appearance: ThemeAppearanceValue) {
  return appearance === ThemeAppearance.SYSTEM
    ? getResolvedSystemTheme()
    : appearance;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: Theme.DARK,
  appearance: DEFAULT_THEME_APPEARANCE,
  themeStyle: DEFAULT_THEME_STYLE,
  themeColor: DEFAULT_THEME_COLOR,
  setAppearance: (appearance) =>
    set({
      appearance,
      theme: resolveThemeAppearance(appearance),
    }),
  setTheme: (theme) =>
    set({
      appearance: theme,
      theme,
    }),
  setThemeStyle: (themeStyle) => set({ themeStyle }),
  setThemeColor: (themeColor) => set({ themeColor }),
  setThemePreferences: ({ themeAppearance, themeStyle, themeColor }) =>
    set((state) => {
      const nextAppearance = themeAppearance ?? state.appearance;

      return {
        appearance: nextAppearance,
        theme: resolveThemeAppearance(nextAppearance),
        themeStyle: themeStyle ?? state.themeStyle,
        themeColor: themeColor ?? state.themeColor,
      };
    }),
  syncWithSystem: (theme) =>
    set((state) =>
      state.appearance === ThemeAppearance.SYSTEM ? { theme } : state,
    ),
  inverse: () => {
    const nextTheme = get().theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
    set({
      appearance: nextTheme,
      theme: nextTheme,
    });
  },
}));

export function useInitializeTheme() {
  const theme = useThemeStore((state) => state.theme);
  const themeStyle = useThemeStore((state) => state.themeStyle);
  const themeColor = useThemeStore((state) => state.themeColor);
  const syncWithSystem = useThemeStore((state) => state.syncWithSystem);

  useEffect(() => {
    const mediaQuery = getBrowserMediaQuery("(prefers-color-scheme: dark)");

    if (!mediaQuery) {
      return undefined;
    }

    syncWithSystem(mediaQuery.matches ? Theme.DARK : Theme.LIGHT);

    const handleChange = (event: MediaQueryListEvent) => {
      syncWithSystem(event.matches ? Theme.DARK : Theme.LIGHT);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [syncWithSystem]);

  useEffect(() => {
    const root = getBrowserDocumentElement();

    if (!root) {
      return undefined;
    }

    let firstFrame: ScheduledAnimationFrameHandle | null = null;
    let secondFrame: ScheduledAnimationFrameHandle | null = null;

    root.classList.add("disable-transitions");
    root.dataset.theme = theme;
    root.dataset.themeStyle = themeStyle;
    root.dataset.themeColor = themeColor;
    root.classList.remove(Theme.LIGHT, Theme.DARK);
    root.classList.add(theme);
    void getBrowserComputedStyle(root)?.opacity;

    firstFrame = scheduleAnimationFrame(() => {
      secondFrame = scheduleAnimationFrame(() => {
        root.classList.remove("disable-transitions");
      });
    });

    return () => {
      if (firstFrame) {
        cancelScheduledAnimationFrame(firstFrame);
      }

      if (secondFrame) {
        cancelScheduledAnimationFrame(secondFrame);
      }

      root.classList.remove("disable-transitions");
    };
  }, [theme, themeStyle, themeColor]);
}

export const useTheme = () => {
  const theme = useThemeStore((state) => state.theme);
  const appearance = useThemeStore((state) => state.appearance);
  const themeStyle = useThemeStore((state) => state.themeStyle);
  const themeColor = useThemeStore((state) => state.themeColor);
  const setAppearance = useThemeStore((state) => state.setAppearance);
  const setTheme = useThemeStore((state) => state.setTheme);
  const setThemeStyle = useThemeStore((state) => state.setThemeStyle);
  const setThemeColor = useThemeStore((state) => state.setThemeColor);
  const setThemePreferences = useThemeStore(
    (state) => state.setThemePreferences,
  );
  const inverse = useThemeStore((state) => state.inverse);

  return {
    theme,
    appearance,
    themeStyle,
    themeColor,
    setAppearance,
    setTheme,
    setThemeStyle,
    setThemeColor,
    setThemePreferences,
    inverse,
    isDark: theme === Theme.DARK,
    isLight: theme === Theme.LIGHT,
    isSystem: appearance === ThemeAppearance.SYSTEM,
  };
};
