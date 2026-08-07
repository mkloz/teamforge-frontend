import { ChevronDownIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/shared/lib/utils";

interface NativeSelectProps
  extends Omit<React.ComponentProps<"select">, "size"> {
  size?: "sm" | "default";
  wrapperClassName?: string;
}

function NativeSelect({
  className,
  size = "default",
  wrapperClassName,
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        "group/native-select relative w-full has-[select:disabled]:opacity-50",
        wrapperClassName,
      )}
      data-slot="native-select-wrapper"
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(
          "h-(--control-height) w-full min-w-0 appearance-none rounded-lg border border-input-border bg-input px-3.5 py-2 pr-10 font-medium font-sans text-ink text-sm outline-none transition-[background-color,border-color,box-shadow,color] duration-150 ease-out selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/70 disabled:text-slate-muted disabled:opacity-70 data-[size=sm]:h-9! data-[size=sm]:py-1",
          "hover:border-foreground/35 focus-visible:border-foreground/70 focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "aria-invalid:border-destructive focus-visible:aria-invalid:ring-destructive",
          "motion-reduce:transition-none",
          className,
        )}
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 select-none text-muted-foreground opacity-50"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
