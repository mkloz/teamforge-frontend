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
  segments?: number;
  thumbAriaLabels?: readonly string[];
}

function Slider({
  "aria-label": ariaLabel,
  className,
  defaultValue,
  segments,
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
  const segmentCount =
    segments && Number.isFinite(segments) ? Math.max(1, segments) : 0;
  const selectedMinimum = values.length === 1 ? min : Math.min(...values);
  const selectedMaximum = Math.max(...values);

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
        className={cn(
          "relative h-2 w-full grow overflow-hidden rounded-full",
          segmentCount ? "bg-transparent" : "bg-muted",
        )}
      >
        {segmentCount > 0 ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${segmentCount}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: segmentCount }, (_, index) => {
              const segmentStart = min + ((max - min) * index) / segmentCount;
              const segmentEnd =
                min + ((max - min) * (index + 1)) / segmentCount;
              const isSelected =
                segmentStart >= selectedMinimum &&
                segmentEnd <= selectedMaximum;

              return (
                <span
                  key={`slider-segment-${segmentStart}`}
                  className={cn(
                    "h-full rounded-full transition-colors",
                    isSelected ? "bg-primary" : "bg-muted",
                  )}
                />
              );
            })}
          </span>
        ) : null}
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute h-full",
            segmentCount ? "bg-transparent" : "bg-primary",
          )}
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
          className="block size-5 shrink-0 cursor-grab rounded-full border-2 border-primary bg-background outline-none transition-[background-color,border-color,box-shadow] duration-150 hover:bg-primary/10 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:cursor-grabbing active:bg-primary/16 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
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
