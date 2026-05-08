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
  const valueLabel = value === 0 ? "Open" : `${value}%`;

  return (
    <div className="border-border border-b py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-ink text-sm">
            Minimum compatibility
          </p>
          <p className="mt-1 text-slate-muted text-xs leading-relaxed">
            Raise this to make automatic group forming stricter. Very high
            limits can slow things down.
          </p>
        </div>
        <div className="rounded-full border border-forge-teal/20 bg-forge-teal/8 px-3 py-1 font-bold text-forge-teal text-sm">
          {valueLabel}
        </div>
      </div>

      <Slider
        min={0}
        max={95}
        step={5}
        value={[value]}
        disabled={disabled}
        aria-label="Minimum compatibility score"
        onValueChange={(nextValue) => onChange(nextValue[0] ?? value)}
        className="mt-5"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {MATCHING_THRESHOLD_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            type="button"
            variant={value === preset.value ? "primary" : "outline"}
            size="sm"
            disabled={disabled}
            onClick={() => onChange(preset.value)}
          >
            {preset.label}
            {preset.value > 0 ? ` ${preset.value}%` : ""}
          </Button>
        ))}
      </div>
    </div>
  );
}
