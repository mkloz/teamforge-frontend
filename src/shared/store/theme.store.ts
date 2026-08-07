import { useEffect } from "react";
import { z } from "zod";
import { create } from "zustand";
import {
  normalizeThemePreferences,
  THEME_PREFERENCE_STORAGE_KEY,
  THEME_PREFERENCE_VERSION,
  ThemeAppearance,
  type ThemeAppearance as ThemeAppearanceValue,
  type ThemeColor as ThemeColorValue,
  type ThemeStyle as ThemeStyleValue,
} from "@/shared/constants/theme-preferences";
import {
  getBrowserComputedStyle,
  getBrowserDocument,
  getBrowserDocumentElement,
  getBrowserLocalStorageItem,
  getBrowserMediaQuery,
  setBrowserLocalStorageItem,
} from "@/shared/lib/browser-environment";
import type { ScheduledAnimationFrameHandle } from "@/shared/lib/browser-scheduling";
import {
  cancelScheduledAnimationFrame,
  scheduleAnimationFrame,
} from "@/shared/lib/browser-scheduling";

const Theme = {
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

function getInitialThemePreferences() {
  const root = getBrowserDocumentElement();
  const storedPreferences = getStoredThemePreferences();

  return normalizeThemePreferences({
    themeAppearance:
      root?.dataset.themeAppearance ?? storedPreferences?.themeAppearance,
    themeColor: root?.dataset.themeColor ?? storedPreferences?.themeColor,
    themeStyle: root?.dataset.themeStyle ?? storedPreferences?.themeStyle,
  });
}

function getStoredThemePreferences() {
  const storedValue = getBrowserLocalStorageItem(THEME_PREFERENCE_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsed = z
      .record(z.string(), z.unknown())
      .safeParse(JSON.parse(storedValue));
    return parsed.success ? parsed.data : null;
  } catch (error) {
    void error;
    return null;
  }
}

function persistThemePreferences(preferences: {
  themeAppearance: ThemeAppearanceValue;
  themeColor: ThemeColorValue;
  themeStyle: ThemeStyleValue;
}) {
  setBrowserLocalStorageItem(
    THEME_PREFERENCE_STORAGE_KEY,
    JSON.stringify({ version: THEME_PREFERENCE_VERSION, ...preferences }),
  );
}

const initialThemePreferences = getInitialThemePreferences();

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: resolveThemeAppearance(initialThemePreferences.themeAppearance),
  appearance: initialThemePreferences.themeAppearance,
  themeStyle: initialThemePreferences.themeStyle,
  themeColor: initialThemePreferences.themeColor,
  setAppearance: (appearance) => {
    const nextPreferences = normalizeThemePreferences({
      themeAppearance: appearance,
      themeColor: get().themeColor,
      themeStyle: get().themeStyle,
    });
    persistThemePreferences(nextPreferences);
    set({
      appearance: nextPreferences.themeAppearance,
      theme: resolveThemeAppearance(nextPreferences.themeAppearance),
    });
  },
  setTheme: (theme) =>
    set(() => {
      persistThemePreferences({
        themeAppearance: theme,
        themeColor: get().themeColor,
        themeStyle: get().themeStyle,
      });
      return {
        appearance: theme,
        theme,
      };
    }),
  setThemeStyle: (themeStyle) => {
    const normalizedThemeStyle = normalizeThemePreferences({
      themeAppearance: get().appearance,
      themeColor: get().themeColor,
      themeStyle,
    }).themeStyle;
    persistThemePreferences({
      themeAppearance: get().appearance,
      themeColor: get().themeColor,
      themeStyle: normalizedThemeStyle,
    });
    set({ themeStyle: normalizedThemeStyle });
  },
  setThemeColor: (themeColor) => {
    const normalizedThemeColor = normalizeThemePreferences({
      themeAppearance: get().appearance,
      themeColor,
      themeStyle: get().themeStyle,
    }).themeColor;
    persistThemePreferences({
      themeAppearance: get().appearance,
      themeColor: normalizedThemeColor,
      themeStyle: get().themeStyle,
    });
    set({ themeColor: normalizedThemeColor });
  },
  setThemePreferences: ({ themeAppearance, themeStyle, themeColor }) =>
    set((state) => {
      const nextPreferences = normalizeThemePreferences({
        themeAppearance: themeAppearance ?? state.appearance,
        themeColor: themeColor ?? state.themeColor,
        themeStyle: themeStyle ?? state.themeStyle,
      });
      persistThemePreferences(nextPreferences);

      return {
        appearance: nextPreferences.themeAppearance,
        theme: resolveThemeAppearance(nextPreferences.themeAppearance),
        themeStyle: nextPreferences.themeStyle,
        themeColor: nextPreferences.themeColor,
      };
    }),
  syncWithSystem: (theme) =>
    set((state) =>
      state.appearance === ThemeAppearance.SYSTEM ? { theme } : state,
    ),
  inverse: () => {
    const nextTheme = get().theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
    persistThemePreferences({
      themeAppearance: nextTheme,
      themeColor: get().themeColor,
      themeStyle: get().themeStyle,
    });
    set({
      appearance: nextTheme,
      theme: nextTheme,
    });
  },
}));

export function useInitializeTheme() {
  const theme = useThemeStore((state) => state.theme);
  const appearance = useThemeStore((state) => state.appearance);
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
    root.dataset.themeAppearance = appearance;
    root.dataset.themeStyle = themeStyle;
    root.dataset.themeColor = themeColor;
    root.classList.remove(Theme.LIGHT, Theme.DARK);
    root.classList.add(theme);
    root.style.colorScheme = theme;
    getBrowserDocument()
      ?.querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === Theme.DARK ? "#000000" : "#F4F4F2");
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
  }, [appearance, theme, themeStyle, themeColor]);
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
