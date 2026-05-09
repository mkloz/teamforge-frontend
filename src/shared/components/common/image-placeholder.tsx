import { Image } from "lucide-react";
import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

interface ImagePlaceholderProps extends HTMLAttributes<HTMLDivElement> {
  patternDensity?: "low" | "medium" | "high";
}

const densityClassName = {
  high: "image-placeholder-grid-high",
  low: "image-placeholder-grid-low",
  medium: "image-placeholder-grid-medium",
};

export function ImagePlaceholder({
  className,
  patternDensity = "medium",
  ...props
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "relative flex size-full items-center justify-center overflow-hidden rounded-md bg-muted",
        densityClassName[patternDensity],
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="image-placeholder-corner top-0 left-0 border-t-thick border-l-thick" />

        <div className="image-placeholder-corner top-0 right-0 border-t-thick border-r-thick" />

        <div className="image-placeholder-corner bottom-0 left-0 border-b-thick border-l-thick" />

        <div className="image-placeholder-corner right-0 bottom-0 border-r-thick border-b-thick" />
      </div>

      <div className="relative flex size-1/4 max-h-16 min-h-8 min-w-8 max-w-16 items-center justify-center rounded-full bg-background/50 backdrop-blur-subtle">
        <Image className="text-border" />
      </div>
    </div>
  );
}
