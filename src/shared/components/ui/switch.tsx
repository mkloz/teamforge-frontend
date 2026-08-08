import { Switch as SwitchPrimitive } from "radix-ui";
import type React from "react";

import { cn } from "@/shared/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group/switch peer relative inline-flex h-11 w-12 shrink-0 cursor-pointer items-center rounded-full outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 [@media(pointer:fine)]:h-7",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 h-7 -translate-y-1/2 rounded-full border border-control-border shadow-field transition-[background-color,box-shadow] duration-150 group-data-[state=checked]/switch:bg-primary group-data-[state=unchecked]/switch:bg-input group-data-[state=checked]/switch:shadow-soft-sm motion-reduce:transition-none dark:group-data-[state=unchecked]/switch:bg-input/80"
      />
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none relative block size-6 rounded-full bg-background shadow-soft-sm ring-0 transition-transform duration-150 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 motion-reduce:transition-none",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
