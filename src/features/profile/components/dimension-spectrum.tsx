import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import type { DimensionScore } from "../types/profile.types";
import { getBorderlineExplanation } from "../lib/narrative-generator";

interface DimensionSpectrumProps {
  score: DimensionScore;
}

const DIMENSION_LABELS: Record<string, { name: string; left: string; right: string; leftColor: string; rightColor: string }> = {
  EI: { 
    name: "Mind", 
    left: "E", 
    right: "I",
    leftColor: "text-amber-500",
    rightColor: "text-blue-500",
  },
  SN: { 
    name: "Energy", 
    left: "S", 
    right: "N",
    leftColor: "text-green-500",
    rightColor: "text-purple-500",
  },
  TF: { 
    name: "Nature", 
    left: "T", 
    right: "F",
    leftColor: "text-slate-500",
    rightColor: "text-rose-500",
  },
  JP: { 
    name: "Tactics", 
    left: "J", 
    right: "P",
    leftColor: "text-orange-500",
    rightColor: "text-cyan-500",
  },
};

export function DimensionSpectrum({ score }: DimensionSpectrumProps) {
  const labels = DIMENSION_LABELS[score.dimension];
  
  // Position is 0-100 where 0 = left, 100 = right
  const markerPosition = score.score;
  
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-3">
        {/* Dimension name */}
        <span className="text-xs font-medium text-muted-foreground w-14 text-right">
          {labels.name}
        </span>
        
        {/* Left letter */}
        <span className={cn("text-xs font-bold w-4", labels.leftColor)}>
          {labels.left}
        </span>
        
        {/* Spectrum track */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative flex-1 h-2 rounded-full bg-gradient-to-r from-muted via-muted to-muted cursor-help">
              {/* Background gradient hint */}
              <div 
                className="absolute inset-0 rounded-full opacity-30"
                style={{
                  background: `linear-gradient(to right, var(--amber-500), var(--blue-500))`,
                }}
              />
              
              {/* Borderline zone indicator (center 10%) */}
              <div className="absolute left-[45%] w-[10%] h-full border-l border-r border-dashed border-muted-foreground/30" />
              
              {/* Marker */}
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md border-2 border-primary transition-all",
                  score.isBorderline && "ring-2 ring-primary/30 ring-offset-1 ring-offset-background animate-pulse"
                )}
                style={{ left: `calc(${markerPosition}% - 8px)` }}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[280px]">
            <p>{getBorderlineExplanation(score.dimension, score.score)}</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Right letter */}
        <span className={cn("text-xs font-bold w-4", labels.rightColor)}>
          {labels.right}
        </span>
        
        {/* Percentage */}
        <span className="text-xs text-muted-foreground w-10 tabular-nums">
          {score.score}%
        </span>
      </div>
    </TooltipProvider>
  );
}
