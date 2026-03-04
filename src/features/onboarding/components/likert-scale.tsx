import { cn } from "@/shared/lib/utils";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

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
    <div className="flex flex-col w-full select-none -mt-4">
      <RadioGroupPrimitive.Root
        value={value ? value.toString() : ""}
        onValueChange={(val) => onChange(Number(val) as 1 | 2 | 3 | 4 | 5)}
        className="relative grid grid-cols-5 w-full h-16 items-center focus-visible:outline-none"
        aria-label="Rate your agreement"
      >
        {/* Connecting line */}
        <div
          className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-px bg-slate-200 pointer-events-none"
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
                  "transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] rounded-full border-[1.5px] flex items-center justify-center pointer-events-none group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2",
                  selected
                    ? "bg-forge-teal border-forge-teal scale-[1.35] drop-shadow-[0_4px_12px_rgba(13,148,136,0.3)]"
                    : "bg-white border-slate-200 group-hover:bg-slate-50 group-hover:scale-[1.15] group-hover:border-slate-300 group-active:scale-[0.95]",
                )}
                style={{ width: 20, height: 20 }}
              >
                <RadioGroupPrimitive.Indicator className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </RadioGroupPrimitive.Item>
          );
        })}
      </RadioGroupPrimitive.Root>

      {/* Per-dot labels */}
      <div className="grid grid-cols-5 w-full -mt-3">
        {POINTS.map((point) => (
          <div
            key={`label-${point}`}
            className="flex justify-center text-center px-1"
          >
            {LABELS[point] && (
              <span
                className={cn(
                  "font-sans leading-[1.2] text-[10px] transition-colors duration-200 max-w-30",
                  value === point
                    ? "text-forge-teal font-semibold"
                    : "text-slate-400 font-medium",
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
