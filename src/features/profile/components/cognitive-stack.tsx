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
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground">
          Cognitive Functions
        </h4>
        
        <div className="space-y-2.5">
          {stack.map((fn) => {
            const strength = getFunctionStrength(fn.role);
            
            return (
              <Tooltip key={fn.code}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 cursor-help group">
                    {/* Function code */}
                    <span className="text-xs font-mono font-bold text-primary w-6">
                      {fn.code}
                    </span>
                    
                    {/* Progress bar */}
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500 group-hover:opacity-100",
                          ROLE_OPACITY[fn.role]
                        )}
                        style={{ 
                          width: `${strength}%`,
                          background: "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.6) 100%)"
                        }}
                      />
                    </div>
                    
                    {/* Short name */}
                    <span className="text-xs text-muted-foreground w-20 truncate">
                      {fn.shortName}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[280px]">
                  <p className="font-semibold text-foreground">{fn.name}</p>
                  <p className="text-xs mt-1 text-muted-foreground">{fn.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
