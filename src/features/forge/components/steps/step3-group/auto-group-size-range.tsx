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
    <fieldset className="grid gap-5">
      <legend className="sr-only">Automatic group size</legend>

      <div className="grid grid-cols-2 border-border/35 border-y">
        <GroupSizeValue label="Minimum needed" value={minimumGroupSize} />
        <GroupSizeValue
          className="border-border/35 border-l pl-5"
          label="Preferred size"
          value={maximumGroupSize}
        />
      </div>

      <div className="grid gap-2 px-0.5">
        <Slider
          aria-label="Group size range"
          className="h-9"
          min={3}
          max={8}
          segments={5}
          step={1}
          minStepsBetweenThumbs={0}
          value={[minimumGroupSize, maximumGroupSize]}
          thumbAriaLabels={[
            "Minimum group size",
            "Maximum preferred group size",
          ]}
          onValueChange={(value) => {
            const nextMinimum = value[0] ?? minimumGroupSize;
            const nextMaximum = value[1] ?? maximumGroupSize;
            onRangeChange(nextMinimum, nextMaximum);
          }}
        />
        <div className="flex justify-between text-muted-foreground/60 text-xs tabular-nums">
          <span>3</span>
          <span>8</span>
        </div>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-2 px-0.5">
        <p className="font-semibold text-foreground text-sm">
          Ready at {minimumGroupSize}
          <span className="mx-2 text-muted-foreground/35">—</span>
          aiming for {maximumGroupSize}
        </p>
        <p className="text-muted-foreground text-xs">Includes you</p>
      </div>
    </fieldset>
  );
}

function GroupSizeValue({
  className,
  label,
  value,
}: {
  className?: string;
  label: string;
  value: number;
}) {
  return (
    <div className={`grid gap-1 py-4 ${className ?? ""}`}>
      <span className="font-semibold text-muted-foreground text-xs">
        {label}
      </span>
      <span className="flex items-baseline gap-1.5">
        <strong className="font-black text-3xl text-foreground tabular-nums tracking-tight">
          {value}
        </strong>
        <span className="font-medium text-muted-foreground text-xs">
          people
        </span>
      </span>
    </div>
  );
}
