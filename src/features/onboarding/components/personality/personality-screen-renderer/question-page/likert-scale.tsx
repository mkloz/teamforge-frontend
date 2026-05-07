import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { cn } from "@/shared/lib/utils";

interface LikertScaleProps {
  value: 1 | 2 | 3 | 4 | 5 | undefined;
  onChange: (val: 1 | 2 | 3 | 4 | 5) => void;
}

const POINTS = [1, 2, 3, 4, 5] as const;
type LikertPoint = (typeof POINTS)[number];

const LABELS: Record<LikertPoint, string> = {
  1: "Strongly disagree",
  2: "",
  3: "Neutral",
  4: "",
  5: "Strongly agree",
};

const POINT_POSITION_CLASSES: Record<(typeof POINTS)[number], string> = {
  1: "left-[10%]",
  2: "left-[30%]",
  3: "left-1/2",
  4: "left-[70%]",
  5: "left-[90%]",
};

export function LikertScale({ value, onChange }: LikertScaleProps) {
  const handleValueChange = (nextValue: string) => {
    const nextPoint = POINTS.find((point) => point.toString() === nextValue);

    if (nextPoint) {
      onChange(nextPoint);
    }
  };

  return (
    <div className="flex w-full flex-col gap-1.5 select-none">
      <RadioGroup
        value={value ? value.toString() : ""}
        onValueChange={handleValueChange}
        className="relative h-8 w-full focus-visible:outline-none sm:h-9"
        aria-label="Rate your agreement"
      >
        <div
          className="pointer-events-none absolute top-1/2 right-[10%] left-[10%] z-0 h-0.5 -translate-y-1/2 bg-slate-100 dark:bg-white/10"
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
              className={cn(
                "group/likert absolute top-1/2 z-10 flex !h-24 !w-[20%] -translate-x-1/2 -translate-y-1/2 cursor-pointer !appearance-none items-center justify-center !rounded-none !border-0 !bg-transparent !p-0 !text-inherit !shadow-none !ring-0 !ring-offset-0 transition-none !outline-none hover:!bg-transparent focus-visible:!border-transparent focus-visible:!ring-0 focus-visible:!ring-offset-0 data-[state=checked]:!bg-transparent sm:!h-28 dark:!bg-transparent",
                POINT_POSITION_CLASSES[point],
              )}
            >
              <div
                className={cn(
                  "pointer-events-none relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-card transition duration-200 group-focus-visible/likert:ring-2 group-focus-visible/likert:ring-ring group-focus-visible/likert:ring-offset-2 sm:h-6 sm:w-6 dark:bg-card",
                  selected
                    ? "scale-[1.1] border-forge-teal bg-forge-teal shadow-xs sm:scale-[1.15] dark:bg-forge-teal"
                    : "border-slate-200 group-hover/likert:scale-[1.05] group-hover/likert:border-slate-300 group-active/likert:scale-[0.95] dark:border-white/12 dark:group-hover/likert:border-white/18",
                )}
              >
                {selected && (
                  <span className="h-2 w-2 rounded-full bg-white sm:h-2.5 sm:w-2.5 dark:bg-background" />
                )}
              </div>
            </RadioGroupItem>
          );
        })}
      </RadioGroup>

      <div className="grid w-full grid-cols-5">
        {POINTS.map((point) => (
          <div
            key={`label-${point}`}
            className={cn(
              "flex min-h-5 px-0.5 text-center",
              point === 1
                ? "justify-start"
                : point === 5
                  ? "justify-end"
                  : "justify-center",
            )}
          >
            {LABELS[point] && (
              <span
                className={cn(
                  "max-w-full text-[11px] leading-4 transition-colors duration-200 sm:text-xs",
                  value === point
                    ? "font-bold text-forge-teal"
                    : "font-semibold text-muted-foreground",
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
