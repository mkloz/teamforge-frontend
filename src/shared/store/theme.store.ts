import { useEffect } from "react";
import { create } from "zustand";
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
    const mediaQuery = getBrowserMediaQuery("(prefers-color-scheme: dark)");

    if (!mediaQuery) {
      return;
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
      return;
    }

    let firstFrame: ScheduledAnimationFrameHandle | null = null;
    let secondFrame: ScheduledAnimationFrameHandle | null = null;

    root.classList.add("disable-transitions");
    root.dataset.theme = theme;
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
