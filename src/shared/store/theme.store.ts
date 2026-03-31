import { useEffect } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const Theme = {
  LIGHT: "light",
  DARK: "dark",
} as const;

type Theme = (typeof Theme)[keyof typeof Theme];

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  inverse: () => void;
}

export const useThemeStore = create(
  persist<ThemeStore>(
    (set, get) => ({
      theme: Theme.DARK,
      setTheme: (theme) => set({ theme }),
      inverse: () => {
        const newTheme = get().theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
        set({ theme: newTheme });
      },
    }),
    { name: "theme", storage: createJSONStorage(() => localStorage) },
  ),
);

export const useTheme = () => {
  const { theme, setTheme, inverse } = useThemeStore((state) => state);
  const root = document.documentElement;

  useEffect(() => {
    // 1. Temporarily disable all CSS transitions
    root.classList.add("disable-transitions");

    // 2. Apply the new theme classes
    root.dataset.theme = theme;
    root.classList.remove(Theme.LIGHT, Theme.DARK);
    root.classList.add(theme);

    // 3. Force a synchronous browser reflow/layout calculation
    // This makes sure the new theme styles apply instantly without animating
    void window.getComputedStyle(root).opacity;

    // 4. Restore CSS transitions for normal hover effects
    root.classList.remove("disable-transitions");
  }, [theme, root]);

  useEffect(() => {
    window.matchMedia("(prefers-color-scheme: dark)").onchange = (event) => {
      const newColorScheme = event.matches ? Theme.DARK : Theme.LIGHT;
      setTheme(newColorScheme);
    };

    return () => {
      window.matchMedia("(prefers-color-scheme: dark)").onchange = null;
    };
  }, [setTheme]);

  return {
    theme,
    setTheme,
    inverse,
    isDark: theme === Theme.DARK,
    isLight: theme === Theme.LIGHT,
  };
};
