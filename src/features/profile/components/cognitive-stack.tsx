import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import type { CognitiveFunction } from "../types/profile.types";
import { getFunctionStrength } from "../lib/cognitive-functions";

interface CognitiveStackProps {
  stack: CognitiveFunction[];
}

const ROLE_OPACITY: Record<string, string> = {
  dominant: "opacity-100",
  auxiliary: "opacity-75",
  tertiary: "opacity-50",
  inferior: "opacity-30",
};

export function CognitiveStack({ stack }: CognitiveStackProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Cognitive Functions
        </h4>
        
        <div className="space-y-2">
          {stack.map((fn) => {
            const strength = getFunctionStrength(fn.role);
            
            return (
              <Tooltip key={fn.code}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 cursor-help">
                    {/* Function code */}
                    <span className="text-xs font-mono font-semibold text-primary w-6">
                      {fn.code}
                    </span>
                    
                    {/* Progress bar */}
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full bg-primary rounded-full transition-all duration-500",
                          ROLE_OPACITY[fn.role]
                        )}
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                    
                    {/* Short name */}
                    <span className="text-xs text-muted-foreground w-20">
                      {fn.shortName}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[280px]">
                  <p className="font-semibold">{fn.name}</p>
                  <p className="text-xs mt-1 opacity-90">{fn.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
