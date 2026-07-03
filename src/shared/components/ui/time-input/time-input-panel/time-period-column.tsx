import { Button } from "@/shared/components/ui/button";
import {
  handleColumnKeyDown,
  TIME_PERIODS,
} from "@/shared/components/ui/time-input/panel-state";
import type { TimePeriod } from "@/shared/components/ui/time-input/types";
import { cn } from "@/shared/lib/utils";

interface TimePeriodColumnProps {
  activeRef: (node: HTMLButtonElement | null) => void;
  onSelect: (period: TimePeriod) => void;
  selectedPeriod: TimePeriod;
}

export function TimePeriodColumn({
  activeRef,
  onSelect,
  selectedPeriod,
}: TimePeriodColumnProps) {
  return (
    <fieldset
      aria-label="Choose period"
      className="m-0 flex min-w-0 flex-col border-0 px-1.5 py-0"
    >
      <legend className="w-full px-0 pb-2 text-center font-semibold text-slate-muted text-xs">
        Period
      </legend>
      <div className="flex min-h-56 flex-1 flex-col justify-center gap-1">
        {TIME_PERIODS.map((period) => {
          const selected = selectedPeriod === period;

          return (
            <Button
              key={period}
              ref={(node) => {
                if (selected) {
                  activeRef(node);
                }
              }}
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={selected}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "mx-auto h-8 w-full max-w-14 rounded-full text-xs",
                selected && "border-primary bg-primary text-primary-foreground",
              )}
              onKeyDown={(event) =>
                handleColumnKeyDown(
                  TIME_PERIODS,
                  selectedPeriod,
                  event,
                  onSelect,
                )
              }
              onClick={() => onSelect(period)}
            >
              {period}
            </Button>
          );
        })}
      </div>
    </fieldset>
  );
}
