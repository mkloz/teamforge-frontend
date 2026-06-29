import { useMediaQuery } from "@/shared/hooks/use-media-query";

const DESKTOP_ONBOARDING_VISUAL_QUERY = "(min-width: 1024px)";

export function useDesktopOnboardingVisualEnabled() {
  return useMediaQuery(DESKTOP_ONBOARDING_VISUAL_QUERY);
}
