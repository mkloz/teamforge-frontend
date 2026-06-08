import type { GroupSizeMode } from "@/features/forge/lib/forge-contract";
import {
  type SegmentedTabOption,
  SegmentedTabs,
} from "@/shared/components/ui/segmented-tabs";
import { Slider } from "@/shared/components/ui/slider";

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
  const groupSizeModeTabs = [
    {
      id: "RANGE",
      label: `Range ${autoMinSize}-${autoMaxSize}`,
    },
    {
      id: "FIXED",
      label: `Fixed ${fixedSize}`,
    },
  ] satisfies ReadonlyArray<SegmentedTabOption<GroupSizeMode>>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border/35 bg-card/65 px-3 py-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-muted-foreground/50 text-xs tracking-wide">
            Capacity
          </span>
          <SegmentedTabs
            ariaLabel="Group size mode"
            options={groupSizeModeTabs}
            size="sm"
            value={groupSizeMode}
            onChange={onGroupSizeModeChange}
          />
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
