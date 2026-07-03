import { cn } from "@/shared/lib/utils";

import type { OptionalImageFallbackLayerProps } from "./types";

export function OptionalImageFallbackLayer({
  className,
  fallbackComponent,
  fallbackFailed,
  noImageComponent,
  showFallback,
  showNoImage,
}: OptionalImageFallbackLayerProps) {
  if (!showFallback) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center",
        className,
      )}
    >
      {fallbackFailed
        ? fallbackComponent
        : showNoImage
          ? noImageComponent
          : null}
    </div>
  );
}
