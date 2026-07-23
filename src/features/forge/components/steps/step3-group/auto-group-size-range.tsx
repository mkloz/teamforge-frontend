import { Slider } from "@/shared/components/ui/slider";

interface AutoGroupSizeRangeProps {
  maximumGroupSize: number;
  minimumGroupSize: number;
  onRangeChange: (minimumGroupSize: number, maximumGroupSize: number) => void;
}

export function AutoGroupSizeRange({
  maximumGroupSize,
  minimumGroupSize,
  onRangeChange,
}: AutoGroupSizeRangeProps) {
  return (
    <fieldset className="grid gap-5 px-0.5">
      <legend className="sr-only">Automatic group size</legend>

      <div className="grid grid-cols-2 gap-4">
        <GroupSizeValue label="Minimum needed" value={minimumGroupSize} />
        <GroupSizeValue label="Maximum preferred" value={maximumGroupSize} />
      </div>

      <Slider
        aria-label="Group size range"
        min={3}
        max={8}
        step={1}
        minStepsBetweenThumbs={0}
        value={[minimumGroupSize, maximumGroupSize]}
        thumbAriaLabels={["Minimum group size", "Maximum preferred group size"]}
        onValueChange={(value) => {
          const nextMinimum = value[0] ?? minimumGroupSize;
          const nextMaximum = value[1] ?? maximumGroupSize;
          onRangeChange(nextMinimum, nextMaximum);
        }}
      />

      <p className="text-muted-foreground text-xs leading-relaxed">
        These totals include you, the organizer. We’ll try to find up to your
        preferred maximum. The group can go ahead when enough people accept to
        meet your minimum.
      </p>
    </fieldset>
  );
}

function GroupSizeValue({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid gap-1">
      <span className="font-medium text-muted-foreground text-xs">{label}</span>
      <span className="font-semibold text-foreground text-lg tabular-nums">
        {value} people
      </span>
    </div>
  );
}
