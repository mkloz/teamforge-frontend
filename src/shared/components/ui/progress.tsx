import { Progress as ProgressPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/shared/lib/utils";

interface ProgressProps
  extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
}

function Progress({
  className,
  indicatorClassName,
  value,
  ...props
}: ProgressProps) {
  const boundedValue = Math.min(100, Math.max(0, value ?? 0));

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className,
      )}
      value={boundedValue}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "size-full flex-1 bg-primary transition-transform duration-300 motion-reduce:transition-none",
          indicatorClassName,
        )}
        style={{ transform: `translateX(-${100 - boundedValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
