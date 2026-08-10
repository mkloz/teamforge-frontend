import { SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";

const MATCHING_THRESHOLD_PRESETS = [
  { value: 0, label: "Open" },
  { value: 70, label: "Balanced" },
  { value: 80, label: "Strong" },
  { value: 90, label: "Strict" },
] as const;

interface MatchingThresholdControlProps {
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}

export function MatchingThresholdControl({
  value,
  disabled,
  onChange,
}: MatchingThresholdControlProps) {
  const [draftValue, setDraftValue] = useState(value);
  const selectedPreset = getClosestPreset(draftValue);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  function commitValue(nextValue: number) {
    setDraftValue(nextValue);

    if (nextValue !== value) {
      onChange(nextValue);
    }
  }

  return (
    <section className="rounded-2xl bg-card p-3 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-bold text-base text-ink">
            <SlidersHorizontal
              className="size-4 text-foreground"
              aria-hidden="true"
            />
            Compatibility filter
          </h3>
          <p className="mt-1 max-w-md text-slate-muted text-sm leading-relaxed">
            Set the minimum group fit before Findafew shows you a proposal.
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-bold text-2xl text-foreground leading-none">
            {draftValue === 0 ? "Open" : `${draftValue}%`}
          </p>
          <p className="mt-1 text-slate-muted text-xs">
            {selectedPreset.label}
          </p>
        </div>
      </div>

      <Slider
        min={0}
        max={95}
        step={5}
        value={[draftValue]}
        disabled={disabled}
        aria-label="Minimum group-fit score"
        onValueChange={(nextValue) => setDraftValue(nextValue[0] ?? draftValue)}
        onValueCommit={(nextValue) => commitValue(nextValue[0] ?? draftValue)}
        className="mt-4 sm:mt-6"
      />

      <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
        {MATCHING_THRESHOLD_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            type="button"
            aria-pressed={draftValue === preset.value}
            variant={draftValue === preset.value ? "primary" : "outline"}
            size="sm"
            disabled={disabled}
            onClick={() => commitValue(preset.value)}
          >
            {preset.label}
            {preset.value > 0 ? ` ${preset.value}%` : ""}
          </Button>
        ))}
      </div>

      <p className="mt-4 text-slate-muted text-xs leading-relaxed">
        {getThresholdGuidance(draftValue)}
      </p>
    </section>
  );
}

function getClosestPreset(value: number) {
  return MATCHING_THRESHOLD_PRESETS.reduce((closest, preset) =>
    Math.abs(preset.value - value) < Math.abs(closest.value - value)
      ? preset
      : closest,
  );
}

function getThresholdGuidance(value: number) {
  if (value === 0) {
    return "You may see a wider range of groups, including exploratory options.";
  }

  if (value < 80) {
    return "A balanced filter keeps variety while removing weaker-fit groups.";
  }

  if (value < 90) {
    return "You will see fewer proposals, focused on stronger compatibility.";
  }

  return "Only the closest-fit groups will pass this filter, so proposals may be rare.";
}
