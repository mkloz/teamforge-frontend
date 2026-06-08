import { useEffect, useState } from "react";

const DESKTOP_ONBOARDING_VISUAL_QUERY = "(min-width: 1024px)";

function matchesDesktopOnboardingVisualViewport() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }

  return window.matchMedia(DESKTOP_ONBOARDING_VISUAL_QUERY).matches;
}

export function useDesktopOnboardingVisualEnabled() {
  const [isEnabled, setIsEnabled] = useState(
    matchesDesktopOnboardingVisualViewport,
  );

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return undefined;
    }

    const mediaQuery = window.matchMedia(DESKTOP_ONBOARDING_VISUAL_QUERY);
    const syncViewport = () => setIsEnabled(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  return isEnabled;
}
