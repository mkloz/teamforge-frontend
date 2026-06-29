"use client";

import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import type React from "react";

import { cn } from "@/shared/lib/utils";

type ContextMenuItemProps = React.ComponentPropsWithRef<
  typeof ContextMenuPrimitive.Item
> & {
  inset?: boolean;
};

function ContextMenuItem({
  className,
  inset,
  ref,
  ...props
}: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex min-h-9 cursor-pointer select-none items-center rounded-lg px-2.5 py-1.5 text-sm outline-none transition-colors focus:bg-accent/12 focus:text-accent data-[disabled]:cursor-not-allowed data-[highlighted]:bg-accent/12 data-[highlighted]:text-accent data-[disabled]:opacity-50",
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  );
}
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

export { ContextMenuItem };
