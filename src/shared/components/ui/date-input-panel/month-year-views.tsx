import { Button } from "@/shared/components/ui/button";
import {
  getCalendarMonthButtonViewState,
  getCalendarOptionButtonClassName,
  getCalendarYearButtonViewState,
  monthNames,
} from "@/shared/components/ui/date-input-utils";

interface DateInputMonthsViewProps {
  max?: string;
  min?: string;
  onSelectMonth: (month: number) => void;
  visibleMonth: Date;
}

interface DateInputYearsViewProps {
  max?: string;
  min?: string;
  onSelectYear: (year: number) => void;
  visibleMonth: Date;
  years: number[];
}

export function DateInputMonthsView({
  max,
  min,
  onSelectMonth,
  visibleMonth,
}: DateInputMonthsViewProps) {
  return (
    <div className="grid min-h-72 grid-cols-3 content-center gap-2">
      {monthNames.map((month, monthIndex) => {
        const monthState = getCalendarMonthButtonViewState({
          max,
          min,
          monthIndex,
          visibleMonth,
        });

        return (
          <Button
            key={month}
            type="button"
            variant="ghost"
            size="sm"
            disabled={monthState.disabled}
            aria-pressed={monthState.selected}
            className={getCalendarOptionButtonClassName({
              baseClassName: "h-10 rounded-lg text-xs",
              selected: monthState.selected,
            })}
            onClick={() => onSelectMonth(monthIndex)}
          >
            {month}
          </Button>
        );
      })}
    </div>
  );
}

export function DateInputYearsView({
  max,
  min,
  onSelectYear,
  visibleMonth,
  years,
}: DateInputYearsViewProps) {
  return (
    <div className="grid min-h-72 grid-cols-3 content-center gap-2">
      {years.map((year) => {
        const yearState = getCalendarYearButtonViewState({
          max,
          min,
          visibleMonth,
          year,
        });

        return (
          <Button
            key={year}
            type="button"
            variant="ghost"
            size="sm"
            disabled={yearState.disabled}
            aria-pressed={yearState.selected}
            className={getCalendarOptionButtonClassName({
              baseClassName: "h-10 rounded-lg text-xs tabular-nums",
              selected: yearState.selected,
            })}
            onClick={() => onSelectYear(year)}
          >
            {year}
          </Button>
        );
      })}
    </div>
  );
}
