import { Route } from "lucide-react";
import { FILTER_BOUNDARIES } from "@/features/explore/constants/explore.constants";
import { LOCATION_FILTER_OPTIONS } from "@/features/explore/constants/explore-filter-options";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { SegmentedTabs } from "@/shared/components/ui/segmented-tabs";
import { Slider } from "@/shared/components/ui/slider";

export function LocationFilter() {
  const { locationMode, setLocationMode, distance, setDistance } =
    useExploreRouteState();

  return (
    <section className="flex flex-col gap-2">
      <h4 className="pl-1 font-bold text-foreground text-sm tracking-tight">
        Place
      </h4>
      <SegmentedTabs
        ariaLabel="Filter groups by place"
        fill
        options={LOCATION_FILTER_OPTIONS}
        value={locationMode}
        onChange={setLocationMode}
      />

      {locationMode !== "ONLINE" && (
        <div className="flex flex-col gap-3 px-1 pt-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-muted-foreground text-xs">
              <Route className="size-3.5" aria-hidden="true" />
              Distance
            </span>
            <span className="font-black text-muted-foreground text-xs tabular-nums tracking-tight">
              {distance} km
            </span>
          </div>
          <Slider
            className="h-4"
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
