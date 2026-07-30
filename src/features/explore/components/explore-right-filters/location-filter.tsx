import { Route } from "lucide-react";
import { FILTER_BOUNDARIES } from "@/features/explore/constants/explore.constants";
import { LOCATION_FILTER_OPTIONS } from "@/features/explore/constants/explore-filter-options";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Slider } from "@/shared/components/ui/slider";
import { cn } from "@/shared/lib/utils";

export function LocationFilter() {
  const { locationMode, setLocationMode, distance, setDistance } =
    useExploreRouteState();

  function handlePlaceChange(value: string) {
    const nextPlace = LOCATION_FILTER_OPTIONS.find(
      (option) => option.id === value,
    );

    if (nextPlace) {
      setLocationMode(nextPlace.id);
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <h4 className="pl-1 font-bold text-foreground text-sm tracking-tight">
        Place
      </h4>
      <RadioGroup
        aria-label="Filter groups by place"
        className="gap-0 overflow-hidden rounded-2xl border border-border/55 bg-card"
        value={locationMode}
        onValueChange={handlePlaceChange}
      >
        {LOCATION_FILTER_OPTIONS.map((option, index) => {
          const Icon = option.icon;
          const isSelected = option.id === locationMode;
          const inputId = `explore-place-${option.id.toLowerCase()}`;

          return (
            <label
              key={option.id}
              htmlFor={inputId}
              className={cn(
                "flex min-h-12 cursor-pointer items-center gap-3 px-3.5 py-2.5 transition-colors",
                index > 0 && "border-border/55 border-t",
                isSelected
                  ? "bg-forge-teal/8 text-ink"
                  : "text-slate-muted hover:bg-muted/25 hover:text-ink",
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  isSelected && "text-forge-teal",
                )}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 font-bold text-sm">
                {option.label}
              </span>
              <RadioGroupItem
                id={inputId}
                value={option.id}
                aria-label={option.label}
              />
            </label>
          );
        })}
      </RadioGroup>

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
            segments={5}
            aria-label="Maximum distance"
          />
        </div>
      )}
    </section>
  );
}
