import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";
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
  locationType,
  maxDistanceKm,
  onAlgorithmsExpandedChange,
  onAutoSizeRangeChange,
  onCompatibilityWeightChange,
  onDiversityWeightChange,
  onFixedSizeChange,
  onGroupSizeModeChange,
  onMaxDistanceKmChange,
  onNetworkReachWeightChange,
  networkReachWeight,
}: AutoGroupDetailsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border/35 bg-card/65 px-3 py-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-muted-foreground/50 text-xs tracking-wide">
            Capacity
          </span>
          <div className="flex items-center gap-0 rounded-lg border border-border/40 bg-background/60 p-0.5">
            {(["range", "fixed"] as const).map((mode) => {
              const nextMode = mode === "range" ? "RANGE" : "FIXED";
              const active = groupSizeMode === nextMode;
              const badge =
                mode === "range"
                  ? `${autoMinSize}–${autoMaxSize}`
                  : `${fixedSize}`;

              return (
                <Button
                  key={mode}
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => onGroupSizeModeChange(nextMode)}
                  className={cn(
                    "h-auto min-w-16 rounded-md px-2.5 py-1 text-micro transition-colors duration-200",
                    active
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground/50 hover:text-muted-foreground",
                  )}
                >
                  {mode === "range" ? "Range" : "Fixed"}
                  <span
                    className={cn(
                      "font-black tabular-nums transition-colors",
                      active
                        ? mode === "range"
                          ? "text-forge-teal"
                          : "text-spark-amber"
                        : "text-muted-foreground/30",
                    )}
                  >
                    {badge}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-18 flex-col justify-center">
          {groupSizeMode === "RANGE" ? (
            <div className="flex flex-col gap-1">
              <div className="py-1">
                <Slider
                  className="h-10"
                  value={[autoMinSize, autoMaxSize]}
                  onValueChange={(value) => {
                    onAutoSizeRangeChange(
                      value[0] ?? autoMinSize,
                      value[1] ?? autoMaxSize,
                    );
                  }}
                  min={2}
                  max={8}
                  step={1}
                  minStepsBetweenThumbs={1}
                  aria-label="Group size range"
                />
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
            <div className="flex flex-col gap-1">
              <div className="py-1">
                <Slider
                  className="h-10"
                  value={[fixedSize]}
                  onValueChange={(value) =>
                    onFixedSizeChange(value[0] ?? fixedSize)
                  }
                  min={2}
                  max={8}
                  step={1}
                  aria-label="Fixed capacity"
                />
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
        locationType={locationType}
        maxDistanceKm={maxDistanceKm}
        onMaxDistanceKmChange={onMaxDistanceKmChange}
        networkReachWeight={networkReachWeight}
        onNetworkReachWeightChange={onNetworkReachWeightChange}
      />
    </div>
  );
}
