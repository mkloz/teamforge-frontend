import { cn } from "@/shared/lib/utils";
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
          {markerPosition}%
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={cn(
            "text-xs font-black w-4 flex justify-center transition-colors",
            isLeftSide ? "text-forge-teal" : "text-slate-muted/50",
          )}
        >
          {labels.left}
        </span>

        <div className="relative flex-1 h-2 rounded-full bg-slate-muted/10 border border-border/10">
          <SpectrumTrack
            markerPosition={markerPosition}
            isBorderline={score.isBorderline}
          />
        </div>

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

interface SpectrumTrackProps {
  isBorderline: boolean;
  markerPosition: number;
}

function SpectrumTrack({ isBorderline, markerPosition }: SpectrumTrackProps) {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-visible">
      <div
        className={cn(
          "h-full rounded-full",
          isBorderline ? "bg-spark-amber/45" : "bg-forge-teal/45",
        )}
        style={{ width: `${markerPosition}%` }}
      />
      <span
        className={cn(
          "absolute top-1/2 block size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white",
          isBorderline
            ? "border-spark-amber shadow-[0_0_4px_rgba(245,158,11,0.18)]"
            : "border-forge-teal shadow-[0_0_4px_rgba(13,148,136,0.18)]",
        )}
        style={{
          left: `${markerPosition}%`,
        }}
      />
    </div>
  );
}
