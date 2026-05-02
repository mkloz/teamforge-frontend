import * as RadixSlider from "@radix-ui/react-slider";

import { cn } from "@/shared/lib/utils";

import { AlgorithmTuningSection } from "./algorithm-tuning-section";
import type { AutoGroupDetailsProps } from "./types";

export function AutoGroupDetails({
  algorithmsExpanded,
  autoMaxSize,
  autoMinSize,
  compatibilityWeight,
  diversityWeight,
  fixedSize,
  groupSizeMode,
  onAlgorithmsExpandedChange,
  onAutoMaxSizeChange,
  onAutoMinSizeChange,
  onCompatibilityWeightChange,
  onDiversityWeightChange,
  onFixedSizeChange,
  onGroupSizeModeChange,
}: AutoGroupDetailsProps) {
  return (
    <div className="space-y-5 animate-in fade-in zoom-in-95 duration-500">
      <div className="px-0.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground/50 tracking-wide">
            Capacity
          </span>
          <div className="flex items-center gap-0 p-0.5 rounded-lg bg-muted/30 border border-border/40">
            {(["range", "fixed"] as const).map((mode) => {
              const nextMode = mode === "range" ? "RANGE" : "FIXED";
              const active = groupSizeMode === nextMode;
              const badge =
                mode === "range"
                  ? `${autoMinSize}–${autoMaxSize}`
                  : `${fixedSize}`;

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onGroupSizeModeChange(nextMode)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-micro font-bold transition-colors duration-200 min-w-16 justify-center",
                    active
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground/50 hover:text-muted-foreground",
                  )}
                >
                  {mode === "range" ? "Range" : "Fixed"}
                  <span
                    className={cn(
                      "tabular-nums font-black transition-colors",
                      active
                        ? mode === "range"
                          ? "text-primary"
                          : "text-accent"
                        : "text-muted-foreground/30",
                    )}
                  >
                    {badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-18 flex flex-col justify-center">
          {groupSizeMode === "RANGE" ? (
            <div className="space-y-1 animate-in fade-in duration-200">
              <div className="py-1">
                <RadixSlider.Root
                  className="relative flex items-center select-none touch-none w-full h-10"
                  value={[autoMinSize, autoMaxSize]}
                  onValueChange={([min, max]) => {
                    onAutoMinSizeChange(min);
                    onAutoMaxSizeChange(max);
                  }}
                  min={2}
                  max={8}
                  step={1}
                  minStepsBetweenThumbs={1}
                >
                  <RadixSlider.Track className="bg-muted relative grow rounded-full h-1.5">
                    <RadixSlider.Range className="absolute bg-primary rounded-full h-full" />
                  </RadixSlider.Track>
                  <RadixSlider.Thumb
                    className="block w-6 h-6 bg-background border-2 border-primary rounded-full shadow-md shadow-primary/20 hover:scale-110 active:scale-95 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 cursor-grab active:cursor-grabbing"
                    aria-label="Minimum members"
                  />
                  <RadixSlider.Thumb
                    className="block w-6 h-6 bg-background border-2 border-primary rounded-full shadow-md shadow-primary/20 hover:scale-110 active:scale-95 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 cursor-grab active:cursor-grabbing"
                    aria-label="Maximum members"
                  />
                </RadixSlider.Root>
              </div>
              <div className="flex justify-between px-0.5">
                <span className="text-micro text-muted-foreground/40">
                  2 min
                </span>
                <span className="text-micro text-muted-foreground/40">
                  8 max
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1 animate-in fade-in duration-200">
              <div className="py-1">
                <RadixSlider.Root
                  className="relative flex items-center select-none touch-none w-full h-10"
                  value={[fixedSize]}
                  onValueChange={([v]) => onFixedSizeChange(v)}
                  min={2}
                  max={8}
                  step={1}
                >
                  <RadixSlider.Track className="bg-muted relative grow rounded-full h-1.5">
                    <RadixSlider.Range className="absolute bg-accent rounded-full h-full" />
                  </RadixSlider.Track>
                  <RadixSlider.Thumb
                    className="block w-6 h-6 bg-background border-2 border-accent rounded-full shadow-md shadow-accent/20 hover:scale-110 active:scale-95 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 cursor-grab active:cursor-grabbing"
                    aria-label="Fixed capacity"
                  />
                </RadixSlider.Root>
              </div>
              <div className="flex justify-between px-0.5">
                <span className="text-micro text-muted-foreground/40">
                  2 min
                </span>
                <span className="text-micro text-muted-foreground/40">
                  8 max
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlgorithmTuningSection
        algorithmsExpanded={algorithmsExpanded}
        onAlgorithmsExpandedChange={onAlgorithmsExpandedChange}
        compatibilityWeight={compatibilityWeight}
        onCompatibilityWeightChange={onCompatibilityWeightChange}
        diversityWeight={diversityWeight}
        onDiversityWeightChange={onDiversityWeightChange}
      />
    </div>
  );
}
