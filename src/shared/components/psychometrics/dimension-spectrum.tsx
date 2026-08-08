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
        <span className="font-bold text-slate-muted text-xs">
          {labels.name}
        </span>
        <span
          className={cn(
            "font-black text-xs transition-colors",
            score.isBorderline ? "text-spark-amber" : "text-foreground",
          )}
        >
          {markerPosition}%
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex w-4 justify-center font-black text-xs transition-colors",
            isLeftSide ? "text-foreground" : "text-slate-muted/50",
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
            !isLeftSide ? "text-foreground" : "text-slate-muted/50",
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
          "h-full w-(--spectrum-position) rounded-full",
          isBorderline ? "bg-spark-amber/45" : "bg-forge-teal/45",
        )}
        style={spectrumStyle}
      />
      <span
        className={cn(
          "absolute top-1/2 left-(--spectrum-position) block size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white",
          isBorderline
            ? "border-spark-amber shadow-[0_0_4px_color-mix(in_srgb,var(--color-spark-amber)_18%,transparent)]"
            : "border-forge-teal shadow-[0_0_4px_color-mix(in_srgb,var(--color-forge-teal)_18%,transparent)]",
        )}
        style={spectrumStyle}
      />
    </div>
  );
}
