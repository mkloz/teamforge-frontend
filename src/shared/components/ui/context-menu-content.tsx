"use client";

import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import type React from "react";

import { cn } from "@/shared/lib/utils";

function ContextMenuContent({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        ref={ref}
        className={cn(
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 min-w-32 overflow-hidden rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-[0_1px_5px_color-mix(in_srgb,var(--color-ink)_6%,transparent)] data-[state=closed]:animate-out data-[state=open]:animate-in",
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

export { ContextMenuContent };
