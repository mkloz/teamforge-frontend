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

const DIMENSION_ORDER: Array<"EI" | "SN" | "TF" | "JP"> = [
  "EI",
  "SN",
  "TF",
  "JP",
];

export function TypeHeader({ type, dimensionScores }: TypeHeaderProps) {
  const typeTitle = getTypeTitle(type);
  const letters = type.split("");

  // Map dimension scores by key for quick lookup
  const scoreMap = new Map(dimensionScores.map((d) => [d.dimension, d]));

  return (
    <div className="flex flex-col items-center">
      {/* Type letters */}
      <TooltipProvider delayDuration={200}>
        <div className="flex items-center gap-2 mb-2">
          {letters.map((letter, index) => {
            const dimension = DIMENSION_ORDER[index];
            const score = scoreMap.get(dimension);
            const isBorderline = score?.isBorderline ?? false;

            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div className="relative group">
                    <span
                      className={cn(
                        "text-4xl md:text-5xl font-black tracking-tighter cursor-help transition-all duration-300 select-none block",
                        isBorderline
                          ? "text-ink/40 hover:text-ink/60"
                          : "text-ink hover:text-forge-teal hover:scale-105",
                      )}
                    >
                      {letter}
                    </span>
                    {isBorderline && (
                      <div className="absolute -bottom-1 left-0 right-0 h-1 bg-spark-amber/40 blur-[1px] rounded-full" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-70 text-center p-3.5 bg-popover text-popover-foreground rounded-xl shadow-xl border border-border z-100"
                >
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-forge-teal">
                      {DIMENSION_ORDER[index]} Dimension
                    </p>
                    {isBorderline && score ? (
                      <p className="text-sm font-medium text-white">
                        {getBorderlineExplanation(dimension, score.score)}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-white">
                        Strong Preference (
                        {score ? Math.abs(50 - score.score) + 50 : 0}%)
                      </p>
                    )}
                  </div>
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
