import { Slider as SliderPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/utils";

function getThumbKeys(count: number) {
  if (count <= 1) {
    return ["single"];
  }

  if (count === 2) {
    return ["lower", "upper"];
  }

  return Array.from(
    { length: count },
    (_, position) => `position-${position + 1}`,
  );
}

interface SliderProps
  extends Omit<ComponentProps<typeof SliderPrimitive.Root>, "aria-label"> {
  "aria-label"?: string;
  thumbAriaLabels?: readonly string[];
}

function Slider({
  "aria-label": ariaLabel,
  className,
  defaultValue,
  thumbAriaLabels,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderProps) {
  const values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max];
  const thumbKeys = getThumbKeys(values.length);

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full cursor-pointer touch-none select-none items-center data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute h-full bg-primary"
        />
      </SliderPrimitive.Track>
      {thumbKeys.map((thumbKey, index) => (
        <SliderPrimitive.Thumb
          key={`slider-thumb-${thumbKey}`}
          aria-label={getThumbAriaLabel({
            ariaLabel,
            index,
            thumbAriaLabels,
            thumbCount: thumbKeys.length,
          })}
          data-slot="slider-thumb"
          className="block size-5 shrink-0 cursor-grab rounded-full border border-primary bg-background shadow-sm ring-ring/50 transition-all hover:ring-4 focus-visible:outline-none focus-visible:ring-4 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

function getThumbAriaLabel({
  ariaLabel,
  index,
  thumbAriaLabels,
  thumbCount,
}: {
  ariaLabel?: string;
  index: number;
  thumbAriaLabels?: readonly string[];
  thumbCount: number;
}) {
  const explicitLabel = thumbAriaLabels?.[index];

  if (explicitLabel) {
    return explicitLabel;
  }

  if (!ariaLabel || thumbCount === 1) {
    return ariaLabel;
  }

  if (index === 0) {
    return `${ariaLabel} minimum`;
  }

  if (index === thumbCount - 1) {
    return `${ariaLabel} maximum`;
  }

  return `${ariaLabel} value ${index + 1}`;
}

export { Slider };
