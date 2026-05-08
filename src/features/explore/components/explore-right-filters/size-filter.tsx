import { FILTER_BOUNDARIES } from "@/features/explore/constants/explore.constants";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { Slider } from "@/shared/components/ui/slider";

export function SizeFilter() {
  const { sizeRange, setSizeRange } = useExploreRouteState();
  const handleSizeRangeChange = (value: number[]) => {
    const nextRange = toSizeRange(value);

    if (nextRange) {
      setSizeRange(nextRange);
    }
  };

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-foreground text-sm">Room size</h4>
        <span className="rounded-full bg-muted/35 px-2 py-0.5 font-bold text-muted-foreground text-xs tabular-nums">
          {sizeRange[0]}–{sizeRange[1]}
        </span>
      </div>

      <div className="px-1 pt-0.5">
        <Slider
          className="h-4"
          value={sizeRange}
          onValueChange={handleSizeRangeChange}
          max={FILTER_BOUNDARIES.size.max}
          min={FILTER_BOUNDARIES.size.min}
          step={1}
          minStepsBetweenThumbs={1}
          aria-label="Group size range"
        />
        <div className="mt-2 flex justify-between font-semibold text-muted-foreground/70 text-xs">
          <span>Small</span>
          <span>Larger</span>
        </div>
      </div>
    </section>
  );
}

function toSizeRange(value: number[]): [number, number] | null {
  const [min, max] = value;

  return typeof min === "number" && typeof max === "number" ? [min, max] : null;
}
