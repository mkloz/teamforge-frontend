import { cn } from "@/shared/lib/utils";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

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
      <RadioGroupPrimitive.Root
        value={value ? value.toString() : ""}
        onValueChange={(val) => onChange(Number(val) as 1 | 2 | 3 | 4 | 5)}
        className="relative grid grid-cols-5 w-full h-14 sm:h-16 items-center focus-visible:outline-none"
        aria-label="Rate your agreement"
      >
        {/* Connecting line */}
        <div
          className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 pointer-events-none"
          aria-hidden="true"
        />

        {POINTS.map((point) => {
          const selected = value === point;
          return (
            <RadioGroupPrimitive.Item
              key={point}
              value={point.toString()}
              id={`point-${point}`}
              aria-label={LABELS[point]}
              className="group relative flex items-center justify-center w-full h-full focus-visible:outline-none cursor-pointer"
            >
              <div
                className={cn(
                  "w-5 h-5 sm:w-6 sm:h-6 transition duration-200 rounded-full border-2 flex items-center justify-center pointer-events-none group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2",
                  selected
                    ? "bg-forge-teal border-forge-teal scale-[1.1] sm:scale-[1.15] shadow-xs"
                    : "bg-white border-slate-200 group-hover:border-slate-300 group-hover:bg-slate-50 group-hover:scale-[1.05] group-active:scale-[0.95]",
                )}
              >
                <RadioGroupPrimitive.Indicator className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white" />
              </div>
            </RadioGroupPrimitive.Item>
          );
        })}
      </RadioGroupPrimitive.Root>

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
                    : "text-slate-500 font-semibold",
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
