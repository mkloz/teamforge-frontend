import { cn } from "@/shared/lib/utils";
import * as RadixSlider from "@radix-ui/react-slider";
import { Globe, Laptop, MapPin, Route } from "lucide-react";
import { FILTER_BOUNDARIES } from "../constants/explore.constants";
import { useExploreStore } from "../store/use-explore-store";

export function LocationFilter() {
  const { locationMode, setLocationMode, distance, setDistance } =
    useExploreStore();

  return (
    <section className="space-y-2">
      <h4 className="text-sm font-bold text-foreground tracking-tight pl-1">
        Location
      </h4>
      <div className="flex p-1 bg-muted/20 rounded-xl border border-border/40 relative gap-1">
        {(
          [
            { id: "Any", label: "Any", icon: Globe },
            { id: "In-Person", label: "Local", icon: MapPin },
            { id: "Online", label: "Online", icon: Laptop },
          ] as const
        ).map((opt) => {
          const active = locationMode === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => setLocationMode(opt.id)}
              className={cn(
                "relative z-10 flex-1 flex flex-row items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                active
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/20 scale-100"
                  : "text-muted-foreground/60 hover:bg-muted/40 hover:text-foreground active:scale-95",
              )}
            >
              <Icon
                className={cn(
                  "size-3.5 transition-colors shrink-0",
                  active ? "text-primary" : "opacity-70",
                )}
              />
              <span className="tracking-tight whitespace-nowrap">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {locationMode !== "Online" && (
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
          <RadixSlider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[distance]}
            onValueChange={([val]) => setDistance(val)}
            max={FILTER_BOUNDARIES.distance.max}
            min={FILTER_BOUNDARIES.distance.min}
            step={1}
          >
            <RadixSlider.Track className="bg-muted/60 relative grow rounded-full h-2 ring-1 ring-border/10 ring-inset overflow-hidden">
              <RadixSlider.Range className="absolute bg-primary rounded-full h-full" />
            </RadixSlider.Track>
            <RadixSlider.Thumb className="block w-5 h-5 bg-background border-thick border-primary rounded-full shadow-sm ring-offset-background transition-transform hover:scale-110 active:scale-95 outline-none focus-visible:ring-thick focus-visible:ring-primary cursor-grab active:cursor-grabbing" />
          </RadixSlider.Root>
        </div>
      )}
    </section>
  );
}
