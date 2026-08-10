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
        data-slot="context-menu-content"
        ref={ref}
        className={cn(
          "motion-anchored-content data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50 min-w-32 overflow-hidden rounded-xl bg-popover p-1.5 text-popover-foreground shadow-soft-md data-[state=closed]:animate-out data-[state=open]:animate-in motion-reduce:animate-none",
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

export { ContextMenuContent };
