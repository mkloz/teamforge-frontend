import { Slider as SliderPrimitive } from "radix-ui";
import React from "react";

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

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );
  const thumbKeys = React.useMemo(
    () => getThumbKeys(values.length),
    [values.length],
  );

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
      {thumbKeys.map((thumbKey) => (
        <SliderPrimitive.Thumb
          key={`slider-thumb-${thumbKey}`}
          data-slot="slider-thumb"
          className="block size-5 shrink-0 cursor-grab rounded-full border border-primary bg-background shadow-sm ring-ring/50 transition-all hover:ring-4 focus-visible:outline-none focus-visible:ring-4 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
