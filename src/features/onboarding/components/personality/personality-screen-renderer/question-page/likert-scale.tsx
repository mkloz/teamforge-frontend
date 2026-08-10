import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { cn } from "@/shared/lib/utils";

interface LikertScaleProps {
  labelledBy: string;
  value: 1 | 2 | 3 | 4 | 5 | undefined;
  onChange: (val: 1 | 2 | 3 | 4 | 5) => void;
}

const POINTS = [1, 2, 3, 4, 5] as const;
type LikertPoint = (typeof POINTS)[number];

const LABELS: Record<LikertPoint, string> = {
  1: "Strongly disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly agree",
};

const POINT_POSITION_CLASSES: Record<LikertPoint, string> = {
  1: "left-[10%]",
  2: "left-[30%]",
  3: "left-1/2",
  4: "left-[70%]",
  5: "left-[90%]",
};

function getLabelAlignmentClass(point: LikertPoint) {
  if (point === 1) {
    return "justify-start";
  }

  if (point === 5) {
    return "justify-end";
  }

  return "justify-center";
}

export function LikertScale({ labelledBy, value, onChange }: LikertScaleProps) {
  const handleValueChange = (nextValue: string) => {
    const nextPoint = POINTS.find((point) => point.toString() === nextValue);

    if (nextPoint) {
      onChange(nextPoint);
    }
  };

  return (
    <div className="flex w-full select-none flex-col gap-1.5">
      <RadioGroup
        value={value ? value.toString() : ""}
        onValueChange={handleValueChange}
        className="relative h-8 w-full focus-visible:outline-none sm:h-9"
        aria-labelledby={labelledBy}
      >
        <div
          className="pointer-events-none absolute top-1/2 right-[10%] left-[10%] z-0 h-0.5 -translate-y-1/2 bg-muted dark:bg-white/10"
          aria-hidden="true"
        />

        {POINTS.map((point) => {
          const selected = value === point;
          return (
            <RadioGroupItem
              key={point}
              value={point.toString()}
              id={`${labelledBy}-point-${point}`}
              aria-label={LABELS[point]}
              className={cn(
                "group/likert appearance-none! absolute top-1/2 z-10 flex h-24! w-1/5! -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full! border-0! bg-transparent! p-0! text-inherit! shadow-none! outline-none! ring-0! ring-offset-0! transition-none focus-visible:border-transparent! sm:h-28!",
                POINT_POSITION_CLASSES[point],
              )}
            >
              <div
                className={cn(
                  "pointer-events-none relative z-10 flex size-5 items-center justify-center rounded-full border-2 bg-card transition duration-200 group-focus-visible/likert:ring-2 group-focus-visible/likert:ring-ring group-focus-visible/likert:ring-offset-2 sm:h-6 sm:w-6",
                  selected
                    ? "scale-110 border-brand-teal bg-brand-teal shadow-xs"
                    : "border-border group-hover/likert:scale-105 group-hover/likert:border-slate-muted/35 group-active/likert:scale-95 dark:border-white/12 dark:group-hover/likert:border-white/18",
                )}
              >
                {selected && (
                  <span className="size-2 rounded-full bg-white sm:h-2.5 sm:w-2.5 dark:bg-background" />
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
              getLabelAlignmentClass(point),
            )}
          >
            {LABELS[point] && (
              <span
                className={cn(
                  "max-w-full text-xs leading-4 transition-colors duration-200 motion-reduce:transition-none",
                  value === point
                    ? "font-bold text-foreground"
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
