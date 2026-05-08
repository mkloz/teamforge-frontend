import { ChevronDown } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import { WeightSlider } from "./weight-slider";

interface AlgorithmTuningSectionProps {
  algorithmsExpanded: boolean;
  compatibilityWeight: number;
  diversityWeight: number;
  onAlgorithmsExpandedChange: (value: boolean) => void;
  onCompatibilityWeightChange: (v: number) => void;
  onDiversityWeightChange: (v: number) => void;
}

export function AlgorithmTuningSection({
  algorithmsExpanded,
  compatibilityWeight,
  diversityWeight,
  onAlgorithmsExpandedChange,
  onCompatibilityWeightChange,
  onDiversityWeightChange,
}: AlgorithmTuningSectionProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/35 bg-card/65">
      <Button
        variant="ghost"
        type="button"
        onClick={() => onAlgorithmsExpandedChange(!algorithmsExpanded)}
        className="flex h-auto w-full items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-forge-teal/5"
        contentClassName="justify-between"
      >
        <div className="space-y-0.5 text-left">
          <p className="font-semibold text-foreground text-xs">
            Algorithm tuning
          </p>
          <p className="text-muted-foreground/70 text-xs">
            Match: {compatibilityWeight}% · Diversity: {diversityWeight}%
          </p>
        </div>
        <ChevronDown
          size={15}
          className={cn(
            "text-muted-foreground/40 transition-transform duration-300",
            algorithmsExpanded ? "rotate-180" : "",
          )}
        />
      </Button>

      {algorithmsExpanded && (
        <div className="fade-in slide-in-from-top-2 animate-in space-y-5 border-muted/15 border-t px-4 pt-4 pb-4 duration-300">
          <WeightSlider
            label="Matching level"
            subLabel="Prioritize behavioral compatibility"
            value={compatibilityWeight}
            onChange={onCompatibilityWeightChange}
            min={20}
            max={100}
            step={5}
          />
          <WeightSlider
            label="Diversity focus"
            subLabel="Encourage unique cognitive backgrounds"
            value={diversityWeight}
            onChange={onDiversityWeightChange}
            min={0}
            max={100}
            step={5}
            warning={
              diversityWeight > 80
                ? "High diversity values may take longer to match"
                : undefined
            }
          />
        </div>
      )}
    </div>
  );
}
