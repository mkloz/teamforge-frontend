import { Route } from "lucide-react";
import {
  FILTER_BOUNDARIES,
  LOCATION_FILTER_OPTIONS,
} from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { Slider } from "@/shared/components/ui/slider";
import { SegmentedFilterTabs } from "./segmented-filter-tabs";

export function LocationFilter() {
  const { locationMode, setLocationMode, distance, setDistance } =
    useExploreRouteState();

  return (
    <section className="space-y-2">
      <h4 className="text-sm font-bold text-foreground tracking-tight pl-1">
        Location
      </h4>
      <SegmentedFilterTabs
        options={LOCATION_FILTER_OPTIONS}
        value={locationMode}
        onChange={setLocationMode}
      />

      {locationMode !== "ONLINE" && (
        <div className="space-y-4 pt-2 px-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Route className="size-3.5" />
              Max Distance
            </span>
            <span className="text-xs font-black text-primary tabular-nums tracking-tight">
              {distance} km
            </span>
          </div>
          <Slider
            className="h-5"
            value={[distance]}
            onValueChange={(value) => setDistance(value[0] ?? distance)}
            max={FILTER_BOUNDARIES.distance.max}
            min={FILTER_BOUNDARIES.distance.min}
            step={1}
            aria-label="Maximum distance"
          />
        </div>
      )}
    </section>
  );
}
