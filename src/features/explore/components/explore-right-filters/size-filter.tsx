import { FILTER_BOUNDARIES } from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { Slider } from "@/shared/components/ui/slider";

export function SizeFilter() {
  const { sizeRange, setSizeRange } = useExploreRouteState();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-foreground">Group Size</h4>
        <span className="text-[10px] font-black text-accent tabular-nums bg-accent/10 px-2 py-0.5 rounded-md uppercase">
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
        <div className="flex justify-between text-[10px] font-bold text-muted-foreground/50 mt-3 uppercase tracking-widest">
          <span>Intimate</span>
          <span>Massive</span>
        </div>
      </div>
    </section>
  );
}
