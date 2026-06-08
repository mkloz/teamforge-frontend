import { Image } from "lucide-react";
import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

interface ImagePlaceholderProps extends HTMLAttributes<HTMLDivElement> {
  patternDensity?: "low" | "medium" | "high";
}

const densityClassName = {
  high: "bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-ink)_3%,transparent)_1px,transparent_2px)] bg-[position:0_0] bg-[length:12px_12px]",
  low: "bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-ink)_3%,transparent)_1px,transparent_2px)] bg-[position:0_0] bg-[length:30px_30px]",
  medium:
    "bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-ink)_3%,transparent)_1px,transparent_2px)] bg-[position:0_0] bg-[length:20px_20px]",
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
        <div className="absolute top-0 left-0 m-3 size-1/6 border-t-thick border-l-thick" />

        <div className="absolute top-0 right-0 m-3 size-1/6 border-t-thick border-r-thick" />

        <div className="absolute bottom-0 left-0 m-3 size-1/6 border-b-thick border-l-thick" />

        <div className="absolute right-0 bottom-0 m-3 size-1/6 border-r-thick border-b-thick" />
      </div>

      <div className="relative flex size-1/4 max-h-16 min-h-8 min-w-8 max-w-16 items-center justify-center rounded-full bg-background/50 backdrop-blur-subtle">
        <Image className="text-border" />
      </div>
    </div>
  );
}
