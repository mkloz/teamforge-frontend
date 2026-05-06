import { FILTER_BOUNDARIES } from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { Slider } from "@/shared/components/ui/slider";

export function SizeFilter() {
  const { sizeRange, setSizeRange } = useExploreRouteState();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-bold text-foreground">Room size</h4>
        <span className="rounded-full bg-muted/35 px-2.5 py-1 text-sm font-bold tabular-nums text-muted-foreground">
          {sizeRange[0]}–{sizeRange[1]}
        </span>
      </div>

      <div className="px-1 pt-1">
        <Slider
          className="h-5"
          value={sizeRange}
          onValueChange={(val) => setSizeRange(val as [number, number])}
          max={FILTER_BOUNDARIES.size.max}
          min={FILTER_BOUNDARIES.size.min}
          step={1}
          minStepsBetweenThumbs={1}
          aria-label="Group size range"
        />
        <div className="mt-3 flex justify-between text-sm font-semibold text-muted-foreground/70">
          <span>Small</span>
          <span>Larger</span>
        </div>
      </div>
    </section>
  );
}
