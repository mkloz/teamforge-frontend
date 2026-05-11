import { Tooltip as TooltipPrimitive } from "radix-ui";
import type React from "react";

function TooltipProvider({
  delayDuration = 250,
  skipDelayDuration = 100,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
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

type TooltipContentProps = Omit<
  React.ComponentProps<typeof TooltipPrimitive.Content>,
  "className"
>;

function TooltipContent({
  sideOffset = 10,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className="group fade-in-0 data-[state=closed]:fade-out-0 relative isolate z-50 max-w-80 animate-in outline-none data-[state=closed]:animate-out"
        {...props}
      >
        <div
          data-slot="tooltip-panel"
          className="relative z-10 rounded-md border-2 border-popover-foreground bg-popover px-3 py-1.5 font-semibold text-popover-foreground text-xs leading-snug shadow-lg"
        >
          {children}
        </div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-0 hidden size-2 rotate-45 border-2 border-popover-foreground bg-popover transition-none group-data-[side=bottom]:-top-1 group-data-[side=left]:top-1/2 group-data-[side=right]:top-1/2 group-data-[side=left]:-right-1 group-data-[side=top]:-bottom-1 group-data-[side=bottom]:left-1/2 group-data-[side=right]:-left-1 group-data-[side=top]:left-1/2 group-data-[side=bottom]:block group-data-[side=left]:block group-data-[side=right]:block group-data-[side=top]:block group-data-[side=bottom]:-translate-x-1/2 group-data-[side=top]:-translate-x-1/2 group-data-[side=left]:-translate-y-1/2 group-data-[side=right]:-translate-y-1/2"
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
