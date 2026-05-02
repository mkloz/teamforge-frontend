import * as RadixSlider from "@radix-ui/react-slider";
import { AlertCircle } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import type { WeightSliderProps } from "./types";

export function WeightSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  warning,
  subLabel,
}: WeightSliderProps) {
  const isHighDiversity =
    label.toLowerCase().includes("diversity") && value > 75;
  const semanticLabels =
    label.toLowerCase().includes("personality") ||
    label.toLowerCase().includes("matching")
      ? { min: "Broad", max: "Exact" }
      : { min: "Homogeneous", max: "Diverse" };
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          {subLabel && (
            <p className="text-xs text-muted-foreground/60 leading-snug">
              {subLabel}
            </p>
          )}
        </div>
        <div
          className={cn(
            "text-sm font-black italic tabular-nums transition-colors duration-300 shrink-0",
            isHighDiversity ? "text-spark-amber" : "text-forge-teal",
          )}
        >
          {value}%
        </div>
      </div>

      <RadixSlider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      >
        <RadixSlider.Track className="bg-muted relative grow rounded-full h-1.5">
          <RadixSlider.Range
            className={cn(
              "absolute rounded-full h-full",
              isHighDiversity ? "bg-spark-amber" : "bg-forge-teal",
            )}
          />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          className={cn(
            "block w-5 h-5 bg-background border-2 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform outline-none cursor-grab active:cursor-grabbing",
            isHighDiversity
              ? "border-spark-amber shadow-spark-amber/20 focus-visible:ring-spark-amber/50"
              : "border-forge-teal shadow-forge-teal/20 focus-visible:ring-forge-teal/50",
          )}
          aria-label={label}
        />
      </RadixSlider.Root>

      <div className="flex justify-between items-center gap-1 px-0.5 -mt-1.5">
        {Array.from({ length: 15 }).map((_, i) => {
          const dotPct = (i / 14) * 100;
          const active = pct >= dotPct;

          return (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-500",
                active
                  ? isHighDiversity
                    ? "bg-spark-amber/40"
                    : "bg-forge-teal/40"
                  : "bg-muted/20",
              )}
            />
          );
        })}
      </div>

      <div className="flex justify-between text-micro font-medium text-muted-foreground/50 -mt-1">
        <span>{semanticLabels.min}</span>
        <span>{semanticLabels.max}</span>
      </div>

      {warning && (
        <div className="flex items-center gap-2 px-1 text-micro font-bold text-spark-amber/80 tracking-tight animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={12} />
          {warning}
        </div>
      )}
    </div>
  );
}
