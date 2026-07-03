import { Button } from "@/shared/components/ui/button";
import {
  getCalendarDayButtonClassName,
  getCalendarDayButtonViewState,
  toDateValue,
  weekdays,
} from "@/shared/components/ui/date-input-utils";

interface DateInputDaysViewProps {
  days: Date[];
  max?: string;
  min?: string;
  onSelectDate: (date: Date) => void;
  todayValue: string;
  value?: string | null;
  visibleMonth: Date;
}

interface DateInputDayButtonProps {
  date: Date;
  max?: string;
  min?: string;
  onSelectDate: (date: Date) => void;
  todayValue: string;
  value?: string | null;
  visibleMonth: Date;
}

export function DateInputDaysView({
  days,
  max,
  min,
  onSelectDate,
  todayValue,
  value,
  visibleMonth,
}: DateInputDaysViewProps) {
  return (
    <div className="grid grid-cols-7 gap-1 text-center">
      {weekdays.map((weekday) => (
        <span
          key={weekday}
          className="py-1 font-black text-slate-muted text-xs uppercase tracking-wide"
        >
          {weekday}
        </span>
      ))}
      {days.map((date) => (
        <DateInputDayButton
          key={toDateValue(date)}
          date={date}
          max={max}
          min={min}
          onSelectDate={onSelectDate}
          todayValue={todayValue}
          value={value}
          visibleMonth={visibleMonth}
        />
      ))}
    </div>
  );
}

function DateInputDayButton({
  date,
  max,
  min,
  onSelectDate,
  todayValue,
  value,
  visibleMonth,
}: DateInputDayButtonProps) {
  const dayState = getCalendarDayButtonViewState({
    date,
    max,
    min,
    todayValue,
    value,
    visibleMonth,
  });

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      disabled={dayState.disabled}
      aria-pressed={dayState.selected}
      className={getCalendarDayButtonClassName(dayState)}
      onClick={() => onSelectDate(date)}
    >
      {dayState.dayLabel}
    </Button>
  );
}
