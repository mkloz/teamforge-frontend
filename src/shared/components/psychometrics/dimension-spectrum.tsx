import type { CSSProperties } from "react";
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

type SpectrumStyle = CSSProperties & {
  "--spectrum-position": string;
};

function getSpectrumStyle(markerPosition: number): SpectrumStyle {
  return {
    "--spectrum-position": `${markerPosition}%`,
  };
}

export function DimensionSpectrum({ score }: DimensionSpectrumProps) {
  const labels = DIMENSION_LABELS[score.dimension];
  const markerPosition = score.score;
  const isLeftSide = markerPosition < 50;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="font-black text-micro text-slate-muted uppercase tracking-widest">
          {labels.name}
        </span>
        <span
          className={cn(
            "font-black text-micro uppercase tracking-widest transition-colors",
            score.isBorderline ? "text-spark-amber" : "text-forge-teal",
          )}
        >
          {markerPosition}%
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex w-4 justify-center font-black text-xs transition-colors",
            isLeftSide ? "text-forge-teal" : "text-slate-muted/50",
          )}
        >
          {labels.left}
        </span>

        <div className="relative h-2 flex-1 rounded-full border border-border/10 bg-slate-muted/10">
          <SpectrumTrack
            markerPosition={markerPosition}
            isBorderline={score.isBorderline}
          />
        </div>

        <span
          className={cn(
            "flex w-4 justify-center font-black text-xs transition-colors",
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
  const spectrumStyle = getSpectrumStyle(markerPosition);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-visible">
      <div
        className={cn(
          "spectrum-progress h-full rounded-full",
          isBorderline ? "bg-spark-amber/45" : "bg-forge-teal/45",
        )}
        style={spectrumStyle}
      />
      <span
        className={cn(
          "spectrum-marker absolute top-1/2 block size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white",
          isBorderline ? "spectrum-marker-amber" : "spectrum-marker-teal",
        )}
        style={spectrumStyle}
      />
    </div>
  );
}
