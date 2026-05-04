import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { cn } from "@/shared/lib/utils";

interface LikertScaleProps {
  value: 1 | 2 | 3 | 4 | 5 | undefined;
  onChange: (val: 1 | 2 | 3 | 4 | 5) => void;
}

const POINTS = [1, 2, 3, 4, 5] as const;

const LABELS: Record<number, string> = {
  1: "Strongly disagree",
  2: "",
  3: "Neutral",
  4: "",
  5: "Strongly agree",
};

export function LikertScale({ value, onChange }: LikertScaleProps) {
  return (
    <div className="flex flex-col w-full select-none -mt-3 sm:-mt-4">
      <RadioGroup
        value={value ? value.toString() : ""}
        onValueChange={(val) => onChange(Number(val) as 1 | 2 | 3 | 4 | 5)}
        className="relative grid grid-cols-5 w-full h-14 sm:h-16 items-center focus-visible:outline-none"
        aria-label="Rate your agreement"
      >
        {/* Connecting line */}
        <div
          className="pointer-events-none absolute left-[10%] right-[10%] top-1/2 z-0 h-0.5 -translate-y-1/2 bg-slate-100 dark:bg-white/10"
          aria-hidden="true"
        />

        {POINTS.map((point) => {
          const selected = value === point;
          return (
            <RadioGroupItem
              key={point}
              value={point.toString()}
              id={`point-${point}`}
              aria-label={LABELS[point]}
              className="group/likert relative z-10 flex !h-full !w-full cursor-pointer !appearance-none items-center justify-center !rounded-none !border-0 !bg-transparent !p-0 !text-inherit !shadow-none !outline-none !ring-0 !ring-offset-0 transition-none hover:!bg-transparent focus-visible:!border-transparent focus-visible:!ring-0 focus-visible:!ring-offset-0 data-[state=checked]:!bg-transparent dark:!bg-transparent"
            >
              <div
                className={cn(
                  "relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-card transition duration-200 pointer-events-none sm:h-6 sm:w-6 group-focus-visible/likert:ring-2 group-focus-visible/likert:ring-ring group-focus-visible/likert:ring-offset-2 dark:bg-card",
                  selected
                    ? "bg-forge-teal border-forge-teal scale-[1.1] shadow-xs dark:bg-forge-teal sm:scale-[1.15]"
                    : "border-slate-200 dark:border-white/12 group-hover/likert:border-slate-300 dark:group-hover/likert:border-white/18 group-hover/likert:scale-[1.05] group-active/likert:scale-[0.95]",
                )}
              >
                {selected && (
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white dark:bg-background" />
                )}
              </div>
            </RadioGroupItem>
          );
        })}
      </RadioGroup>

      {/* Per-dot labels */}
      <div className="grid grid-cols-5 w-full -mt-2 sm:-mt-3">
        {POINTS.map((point) => (
          <div
            key={`label-${point}`}
            className="flex justify-center text-center px-0.5"
          >
            {LABELS[point] && (
              <span
                className={cn(
                  "text-xs transition-colors duration-200 max-w-full",
                  value === point
                    ? "text-forge-teal font-bold"
                    : "text-muted-foreground font-semibold",
                )}
              >
                {LABELS[point]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
