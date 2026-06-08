import { ChevronDown } from "lucide-react";

import type { LocationType } from "@/features/forge/lib/forge-contract";
import { cn } from "@/shared/lib/utils";

import { WeightSlider } from "./weight-slider";

interface AlgorithmTuningSectionProps {
  algorithmsExpanded: boolean;
  compatibilityWeight: number;
  diversityWeight: number;
  locationType: LocationType;
  maxDistanceKm: number;
  networkReachWeight: number;
  onAlgorithmsExpandedChange: (value: boolean) => void;
  onCompatibilityWeightChange: (v: number) => void;
  onDiversityWeightChange: (v: number) => void;
  onMaxDistanceKmChange: (v: number) => void;
  onNetworkReachWeightChange: (v: number) => void;
}

export function AlgorithmTuningSection({
  algorithmsExpanded,
  compatibilityWeight,
  diversityWeight,
  locationType,
  maxDistanceKm,
  networkReachWeight,
  onAlgorithmsExpandedChange,
  onCompatibilityWeightChange,
  onDiversityWeightChange,
  onMaxDistanceKmChange,
  onNetworkReachWeightChange,
}: AlgorithmTuningSectionProps) {
  const usesDistancePreference = locationType === "IN_PERSON";
  const isCustomised =
    compatibilityWeight !== 60 ||
    diversityWeight !== 30 ||
    networkReachWeight !== 10 ||
    (usesDistancePreference && maxDistanceKm !== 30);
  const summary = isCustomised ? "Customised" : "Default settings";

  return (
    <div className="overflow-hidden rounded-lg border border-border/35 bg-card/65">
      <button
        type="button"
        onClick={() => onAlgorithmsExpandedChange(!algorithmsExpanded)}
        aria-expanded={algorithmsExpanded}
        className="group flex w-full items-center justify-between gap-3 rounded-lg bg-transparent px-3 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="flex flex-col gap-0.5 text-left">
          <p className="font-semibold text-foreground text-xs transition-colors group-hover:text-forge-teal">
            Selection preferences
          </p>
          <p className="text-muted-foreground/70 text-xs transition-colors group-hover:text-muted-foreground">
            {summary}
          </p>
        </div>
        <ChevronDown
          size={15}
          className={cn(
            "text-muted-foreground/40 transition-all duration-300 group-hover:text-forge-teal",
            algorithmsExpanded ? "rotate-180" : "",
          )}
        />
      </button>

      {algorithmsExpanded && (
        <div className="fade-in slide-in-from-top-2 flex animate-in flex-col gap-5 border-muted/15 border-t px-4 py-4 duration-300">
          <WeightSlider
            label="Shared ground"
            subLabel="Prioritize people with clear overlap"
            value={compatibilityWeight}
            onChange={onCompatibilityWeightChange}
            min={20}
            max={100}
            step={5}
            minLabel="Flexible"
            maxLabel="Very aligned"
          />
          <WeightSlider
            label="Fresh perspectives"
            subLabel="Leave room for different angles"
            value={diversityWeight}
            onChange={onDiversityWeightChange}
            min={0}
            max={100}
            step={5}
            minLabel="Familiar"
            maxLabel="Mixed"
          />
          <WeightSlider
            label="Network reach"
            subLabel="Decide how far beyond familiar circles to look"
            value={networkReachWeight}
            onChange={onNetworkReachWeightChange}
            min={0}
            max={100}
            step={5}
            minLabel="Friends-first"
            maxLabel="New circles"
          />
          {usesDistancePreference && (
            <WeightSlider
              label="Search radius"
              subLabel="Maximum distance from the plan location"
              value={maxDistanceKm}
              onChange={onMaxDistanceKmChange}
              min={15}
              max={80}
              step={5}
              minLabel="15 km"
              maxLabel="80 km"
              formatValue={(value) => `${value} km`}
              warning={
                maxDistanceKm > 60
                  ? "A wider area may include longer travel"
                  : undefined
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
