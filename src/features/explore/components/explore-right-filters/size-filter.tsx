import * as RadixSlider from "@radix-ui/react-slider";
import { FILTER_BOUNDARIES } from "../../constants/explore.constants";
import { useExploreStore } from "../../store/use-explore-store";

export function SizeFilter() {
  const { sizeRange, setSizeRange } = useExploreStore();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-foreground">Group Size</h4>
        <span className="text-[10px] font-black text-accent tabular-nums bg-accent/10 px-2 py-0.5 rounded-md uppercase">
          {sizeRange[0]}–{sizeRange[1]}
        </span>
      </div>

      <div className="px-1 pt-1">
        <RadixSlider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={sizeRange}
          onValueChange={(val) => setSizeRange(val as [number, number])}
          max={FILTER_BOUNDARIES.size.max}
          min={FILTER_BOUNDARIES.size.min}
          step={1}
          minStepsBetweenThumbs={1}
        >
          <RadixSlider.Track className="bg-muted/60 relative grow rounded-full h-2 ring-1 ring-border/10 ring-inset overflow-hidden">
            <RadixSlider.Range className="absolute bg-accent rounded-full h-full" />
          </RadixSlider.Track>
          <RadixSlider.Thumb className="block w-5 h-5 bg-background border-thick border-accent rounded-full shadow-sm ring-offset-background transition-transform hover:scale-110 active:scale-95 outline-none focus-visible:ring-thick focus-visible:ring-accent cursor-grab active:cursor-grabbing" />
          <RadixSlider.Thumb className="block w-5 h-5 bg-background border-thick border-accent rounded-full shadow-sm ring-offset-background transition-transform hover:scale-110 active:scale-95 outline-none focus-visible:ring-thick focus-visible:ring-accent cursor-grab active:cursor-grabbing" />
        </RadixSlider.Root>
        <div className="flex justify-between text-[10px] font-bold text-muted-foreground/50 mt-3 uppercase tracking-widest">
          <span>Intimate</span>
          <span>Massive</span>
        </div>
      </div>
    </section>
  );
}
