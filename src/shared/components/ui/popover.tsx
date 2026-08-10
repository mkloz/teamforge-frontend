"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import type React from "react";

import { cn } from "@/shared/lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

function PopoverContent({
  align = "center",
  className,
  ref,
  sideOffset = 4,
  ...props
}: React.ComponentPropsWithRef<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "motion-anchored-content data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50 rounded-xl bg-popover text-popover-foreground shadow-soft-md outline-none data-[state=closed]:animate-out data-[state=open]:animate-in motion-reduce:animate-none",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverContent, PopoverTrigger };
