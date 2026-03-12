import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import type { MBTIType, DimensionScore } from "../types/profile.types";
import { getTypeTitle } from "../lib/archetypes";
import { getBorderlineExplanation } from "../lib/narrative-generator";

interface TypeHeaderProps {
  type: MBTIType;
  dimensionScores: DimensionScore[];
}

const DIMENSION_ORDER: Array<"EI" | "SN" | "TF" | "JP"> = ["EI", "SN", "TF", "JP"];

export function TypeHeader({ type, dimensionScores }: TypeHeaderProps) {
  const typeTitle = getTypeTitle(type);
  const letters = type.split("");
  
  // Map dimension scores by key for quick lookup
  const scoreMap = new Map(dimensionScores.map(d => [d.dimension, d]));
  
  return (
    <div className="flex flex-col items-center">
      {/* Type letters */}
      <TooltipProvider delayDuration={200}>
        <div className="flex items-center gap-1 mb-1">
          {letters.map((letter, index) => {
            const dimension = DIMENSION_ORDER[index];
            const score = scoreMap.get(dimension);
            const isBorderline = score?.isBorderline ?? false;
            
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "text-4xl font-bold tracking-widest cursor-help transition-colors",
                      isBorderline 
                        ? "text-foreground/60 underline decoration-dashed underline-offset-4 decoration-muted-foreground/50" 
                        : "text-foreground"
                    )}
                  >
                    {letter}
                  </span>
                </TooltipTrigger>
                <TooltipContent 
                  side="bottom" 
                  className="max-w-[250px] text-center"
                >
                  {isBorderline && score ? (
                    <p>{getBorderlineExplanation(dimension, score.score)}</p>
                  ) : (
                    <p>Strong preference ({score ? Math.abs(50 - score.score) + 50 : 0}%)</p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
      
      {/* Type title */}
      <p className="text-sm text-muted-foreground">{typeTitle}</p>
    </div>
  );
}
