import { ThemeStyle } from "@/shared/constants/theme-preferences";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { usePrefersReducedMotion } from "@/shared/hooks/use-prefers-reduced-motion";
import { useThemeStore } from "@/shared/store/theme.store";

const DESKTOP_VORONOI_QUERY = "(min-width: 1024px)";

export function useVoronoiVisualEnabled() {
  const isDesktop = useMediaQuery(DESKTOP_VORONOI_QUERY);
  const prefersReducedMotion = usePrefersReducedMotion();
  const themeStyle = useThemeStore((state) => state.themeStyle);

  return isDesktop && !prefersReducedMotion && themeStyle !== ThemeStyle.GLASS;
}
