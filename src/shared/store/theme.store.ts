import { useEffect } from "react";
import { create } from "zustand";

export const Theme = {
  LIGHT: "light",
  DARK: "dark",
} as const;

type Theme = (typeof Theme)[keyof typeof Theme];
type ThemeSource = "system" | "manual";

interface ThemeStore {
  theme: Theme;
  source: ThemeSource;
  setTheme: (theme: Theme) => void;
  syncWithSystem: (theme: Theme) => void;
  inverse: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: Theme.DARK,
  source: "system",
  setTheme: (theme) => set({ theme, source: "manual" }),
  syncWithSystem: (theme) =>
    set((state) =>
      state.source === "manual" ? state : { theme, source: "system" },
    ),
  inverse: () => {
    const nextTheme = get().theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
    set({ theme: nextTheme, source: "manual" });
  },
}));

export function useInitializeTheme() {
  const theme = useThemeStore((state) => state.theme);
  const syncWithSystem = useThemeStore((state) => state.syncWithSystem);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

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
    const root = document.documentElement;
    let firstFrame = 0;
    let secondFrame = 0;

    root.classList.add("disable-transitions");
    root.dataset.theme = theme;
    root.classList.remove(Theme.LIGHT, Theme.DARK);
    root.classList.add(theme);
    void window.getComputedStyle(root).opacity;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        root.classList.remove("disable-transitions");
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      root.classList.remove("disable-transitions");
    };
  }, [theme]);
}

export const useTheme = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const inverse = useThemeStore((state) => state.inverse);

  return {
    theme,
    setTheme,
    inverse,
    isDark: theme === Theme.DARK,
    isLight: theme === Theme.LIGHT,
  };
};
