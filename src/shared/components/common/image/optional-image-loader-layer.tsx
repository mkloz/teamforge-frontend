import { cn } from "@/shared/lib/utils";

import type { OptionalImageLoaderLayerProps } from "./types";

export function OptionalImageLoaderLayer({
  className,
  loadingClassName,
  loadingComponent,
  showLoader,
}: OptionalImageLoaderLayerProps) {
  if (!showLoader) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-background/20",
        className,
        loadingClassName,
      )}
    >
      {loadingComponent}
    </div>
  );
}
