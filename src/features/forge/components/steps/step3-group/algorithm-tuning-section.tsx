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
    <div className="rounded-xl border overflow-hidden">
      <Button
        variant="ghost"
        asChild
        className="w-full h-auto flex items-center justify-between px-4 py-3 rounded-none hover:bg-muted/10 transition-colors"
      >
        <button
          type="button"
          onClick={() => onAlgorithmsExpandedChange(!algorithmsExpanded)}
        >
          <div className="text-left space-y-0.5">
            <p className="text-xs font-semibold text-foreground">
              Algorithm tuning
            </p>
            <p className="text-xs text-muted-foreground/70">
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
        </button>
      </Button>

      {algorithmsExpanded && (
        <div className="px-4 pb-4 space-y-5 border-t border-muted/15 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
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
