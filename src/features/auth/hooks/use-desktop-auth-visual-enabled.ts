import { useEffect, useState } from "react";

const DESKTOP_AUTH_VISUAL_QUERY = "(min-width: 1024px)";

function matchesDesktopAuthVisualViewport() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }

  return window.matchMedia(DESKTOP_AUTH_VISUAL_QUERY).matches;
}

export function useDesktopAuthVisualEnabled() {
  const [isEnabled, setIsEnabled] = useState(matchesDesktopAuthVisualViewport);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return undefined;
    }

    const mediaQuery = window.matchMedia(DESKTOP_AUTH_VISUAL_QUERY);
    const syncViewport = () => setIsEnabled(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  return isEnabled;
}
