import { Tooltip as TooltipPrimitive } from "radix-ui";
import type React from "react";

import { cn } from "@/shared/lib/utils";

function TooltipProvider({
  delayDuration = 400,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) animate-in rounded-lg border-2 border-white/20 bg-forge-teal px-2.5 py-1.5 font-medium font-sans text-micro text-white shadow-teal-glow data-[state=closed]:animate-out",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow asChild>
          <div className="z-50 size-1 -translate-y-1/2 rotate-45 border-white/20 border-r-2 border-b-2 bg-forge-teal transition-none" />
        </TooltipPrimitive.Arrow>
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
