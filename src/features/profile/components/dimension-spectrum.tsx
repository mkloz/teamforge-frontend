import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { getBorderlineExplanation } from "@/features/profile/lib/narrative-generator";
import type { DimensionScore } from "@/shared/types/psychometrics";

interface DimensionSpectrumProps {
  score: DimensionScore;
}

const DIMENSION_LABELS: Record<
  string,
  { name: string; left: string; right: string }
> = {
  EI: { name: "Introversion", left: "E", right: "I" },
  SN: { name: "Intuition", left: "S", right: "N" },
  TF: { name: "Feeling", left: "T", right: "F" },
  JP: { name: "Perceiving", left: "J", right: "P" },
};

export function DimensionSpectrum({ score }: DimensionSpectrumProps) {
  const labels = DIMENSION_LABELS[score.dimension];
  const markerPosition = score.score;
  const isLeftSide = markerPosition < 50;

  return (
    <div className="flex flex-col gap-2">
      {/* Label & Percentage Row */}
      <div className="flex items-center justify-between px-1">
        <span className="text-micro font-black text-slate-muted uppercase tracking-widest">
          {labels.name}
        </span>
        <span
          className={cn(
            "text-micro font-black uppercase tracking-widest transition-colors",
            score.isBorderline ? "text-spark-amber" : "text-forge-teal",
          )}
        >
          {score.score}%
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Left letter */}
        <span
          className={cn(
            "text-xs font-black w-4 flex justify-center transition-colors",
            isLeftSide ? "text-forge-teal" : "text-slate-muted/50",
          )}
        >
          {labels.left}
        </span>

        {/* Spectrum track */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative flex-1 h-2 rounded-full bg-slate-muted/10 cursor-help border border-border/10">
              {/* Gradient fill based on position */}
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-colors duration-700 ease-out",
                  score.isBorderline
                    ? "bg-linear-to-r from-spark-amber/30 to-spark-amber/60"
                    : "bg-linear-to-r from-forge-teal/30 to-forge-teal/60",
                )}
                style={{ width: `${markerPosition}%` }}
              />

              {/* Marker */}
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.12)] border-2 z-20 transition duration-700 ease-out",
                  score.isBorderline
                    ? "border-spark-amber ring-2 ring-spark-amber/10"
                    : "border-forge-teal ring-2 ring-forge-teal/10",
                  "hover:scale-110",
                )}
                style={{
                  left: `calc(${markerPosition}% - 7px)`,
                }}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-70 p-4 bg-popover text-popover-foreground rounded-xl border border-border shadow-2xl z-100"
          >
            <p className="text-sm font-medium leading-relaxed">
              {getBorderlineExplanation(score.dimension, score.score)}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Right letter */}
        <span
          className={cn(
            "text-xs font-black w-4 flex justify-center transition-colors",
            !isLeftSide ? "text-forge-teal" : "text-slate-muted/50",
          )}
        >
          {labels.right}
        </span>
      </div>
    </div>
  );
}
