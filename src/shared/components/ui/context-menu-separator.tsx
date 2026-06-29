"use client";

import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import type React from "react";

import { cn } from "@/shared/lib/utils";

function ContextMenuSeparator({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  );
}
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

export { ContextMenuSeparator };
