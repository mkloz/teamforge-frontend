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

const DIMENSION_LABELS: Record<string, { name: string; left: string; right: string }> = {
  EI: { name: "Mind", left: "E", right: "I" },
  SN: { name: "Energy", left: "S", right: "N" },
  TF: { name: "Nature", left: "T", right: "F" },
  JP: { name: "Tactics", left: "J", right: "P" },
};

export function DimensionSpectrum({ score }: DimensionSpectrumProps) {
  const labels = DIMENSION_LABELS[score.dimension];
  const markerPosition = score.score;
  const isLeftSide = markerPosition < 50;
  
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-3">
        {/* Dimension name */}
        <span className="text-xs font-medium text-muted-foreground w-12 text-right">
          {labels.name}
        </span>
        
        {/* Left letter */}
        <span className={cn(
          "text-xs font-bold w-4 transition-colors",
          isLeftSide ? "text-primary" : "text-muted-foreground"
        )}>
          {labels.left}
        </span>
        
        {/* Spectrum track */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative flex-1 h-2.5 rounded-full bg-muted cursor-help overflow-hidden">
              {/* Gradient fill based on position */}
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/80 to-primary/40 rounded-full transition-all duration-300"
                style={{ width: `${markerPosition}%` }}
              />
              
              {/* Borderline zone indicator (center 10%) */}
              <div className="absolute left-[45%] w-[10%] h-full border-l border-r border-dashed border-foreground/10" />
              
              {/* Marker */}
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background shadow-md border-2 border-primary transition-all",
                  score.isBorderline && "ring-2 ring-accent/50 ring-offset-1 ring-offset-background"
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
        <span className={cn(
          "text-xs font-bold w-4 transition-colors",
          !isLeftSide ? "text-primary" : "text-muted-foreground"
        )}>
          {labels.right}
        </span>
        
        {/* Percentage */}
        <span className="text-xs text-muted-foreground w-10 tabular-nums text-right">
          {score.score}%
        </span>
      </div>
    </TooltipProvider>
  );
}
