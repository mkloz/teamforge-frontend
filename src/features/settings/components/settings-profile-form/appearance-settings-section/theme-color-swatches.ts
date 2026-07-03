import type { ColorOption } from "./appearance-options";

export function getThemeColorSwatches(option: ColorOption, isDark: boolean) {
  return option.swatches[isDark ? "dark" : "light"];
}
