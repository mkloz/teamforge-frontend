import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";
import { StatusPill } from "@/shared/components/ui/status-pill";

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
  const valueLabel = draftValue === 0 ? "Open" : `${draftValue}%`;

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
    <div className="border-border border-b py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-ink text-sm">Minimum group fit</p>
          <p className="mt-1 text-slate-muted text-xs leading-relaxed">
            Raise this to ask for a higher group-fit score before TeamForge
            shows you a proposal. Higher settings can mean fewer proposals.
          </p>
        </div>
        <StatusPill
          size="md"
          tone="teal"
          surface="soft"
          className="px-3 py-1 text-sm"
        >
          {valueLabel}
        </StatusPill>
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
        className="mt-5"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {MATCHING_THRESHOLD_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            type="button"
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
    </div>
  );
}
