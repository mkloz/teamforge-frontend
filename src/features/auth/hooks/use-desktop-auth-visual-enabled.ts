import { useMediaQuery } from "@/shared/hooks/use-media-query";

const DESKTOP_AUTH_VISUAL_QUERY = "(min-width: 1024px)";

export function useDesktopAuthVisualEnabled() {
  return useMediaQuery(DESKTOP_AUTH_VISUAL_QUERY);
}
