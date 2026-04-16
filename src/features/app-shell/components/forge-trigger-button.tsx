import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Zap } from "lucide-react";

interface ForgeTriggerButtonProps {
  /** "sidebar" = full-width pill with label; "tab" = circular icon-only raised button */
  variant: "sidebar" | "tab";
  onClick?: () => void;
  className?: string;
}

export function ForgeTriggerButton({
  variant,
  onClick,
  className,
}: ForgeTriggerButtonProps) {
  if (variant === "tab") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              onClick={onClick}
              aria-label="Forge a new group"
              className={cn(
                // Floating amber circle with flagship mechanical physics
                "h-14 w-14 rounded-full shadow-amber-glow",
                "motion-safe:animate-[pulse-glow-amber_2.5s_ease-in-out_1]",
                "hover:shadow-[0_8px_32px_rgba(245,158,11,0.65)]",
                className,
              )}
            >
              <Zap
                size={22}
                aria-hidden="true"
                className="fill-current relative z-10"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Forge a new group</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Sidebar variant — flagship secondary button
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            onClick={onClick}
            aria-label="Forge a new group"
            className={cn(
              "w-full h-auto py-3 px-4 rounded-xl shadow-amber-glow",
              "motion-safe:animate-[pulse-glow-amber_2.5s_ease-in-out_1]",
              "hover:shadow-[0_8px_24px_rgba(245,158,11,0.45)]",
              className,
            )}
          >
            <Zap
              size={16}
              aria-hidden="true"
              className="fill-current shrink-0 relative z-10"
            />
            <span className="relative z-10">Forge My Group</span>
          </Button>
        </TooltipTrigger>
        {/* Only show tooltip in collapsed (icon-only) sidebar; visible text makes it redundant on desktop */}
        <TooltipContent side="right" className="lg:hidden">
          Forge a new group
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
