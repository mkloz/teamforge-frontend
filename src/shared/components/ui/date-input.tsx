import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/shared/components/ui/button";
import { Input, type InputProps } from "@/shared/components/ui/input";
import { useFloatingInputPanel } from "@/shared/hooks/use-floating-input-panel";
import { cn } from "@/shared/lib/utils";

type DateInputProps = Omit<
  InputProps,
  "type" | "value" | "onChange" | "leftIcon" | "rightIcon"
> & {
  clearable?: boolean;
  max?: string;
  min?: string;
  onValueChange: (value: string) => void;
  value?: string | null;
};

type CalendarView = "days" | "months" | "years";

const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const monthNames = Array.from({ length: 12 }, (_, month) =>
  new Intl.DateTimeFormat("en", { month: "short" }).format(
    new Date(2026, month, 1),
  ),
);

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatDisplayValue(value: string | null | undefined) {
  const date = parseDateValue(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

function isOutOfRange(value: string, min?: string, max?: string) {
  return (min != null && value < min) || (max != null && value > max);
}

function isMonthOutOfRange(
  year: number,
  month: number,
  min?: string,
  max?: string,
) {
  const firstDay = toDateValue(new Date(year, month, 1));
  const lastDay = toDateValue(new Date(year, month + 1, 0));

  return (min != null && lastDay < min) || (max != null && firstDay > max);
}

function isYearOutOfRange(year: number, min?: string, max?: string) {
  const firstDay = toDateValue(new Date(year, 0, 1));
  const lastDay = toDateValue(new Date(year, 11, 31));

  return (min != null && lastDay < min) || (max != null && firstDay > max);
}

function DateInput({
  className,
  clearable = true,
  disabled,
  max,
  min,
  onValueChange,
  placeholder = "Select date",
  value,
  wrapperClassName,
  ...props
}: DateInputProps) {
  const panelId = useId();
  const selectedDate = parseDateValue(value);
  const todayValue = toDateValue(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>("days");
  const [visibleMonth, setVisibleMonth] = useState(selectedDate ?? new Date());
  const {
    closePanel,
    open,
    openPanel,
    panelRef,
    panelStyle,
    portalTarget,
    triggerRef,
  } = useFloatingInputPanel({
    panelHeight: 360,
    panelWidth: 288,
  });
  const monthLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);
  const yearLabel = String(visibleMonth.getFullYear());
  const yearRangeStart = Math.floor(visibleMonth.getFullYear() / 12) * 12;
  const yearRangeLabel = `${yearRangeStart} - ${yearRangeStart + 11}`;

  const days = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const years = useMemo(
    () => Array.from({ length: 12 }, (_, index) => yearRangeStart + index),
    [yearRangeStart],
  );

  const openCalendar = () => {
    setVisibleMonth(selectedDate ?? new Date());
    setCalendarView("days");
    openPanel();
  };

  const moveVisibleRange = (amount: number) => {
    setVisibleMonth((current) => {
      if (calendarView === "months") {
        return new Date(current.getFullYear() + amount, current.getMonth(), 1);
      }

      if (calendarView === "years") {
        return new Date(
          current.getFullYear() + amount * 12,
          current.getMonth(),
          1,
        );
      }

      return new Date(current.getFullYear(), current.getMonth() + amount, 1);
    });
  };

  const toggleCalendarView = () => {
    setCalendarView((current) => {
      if (current === "days") {
        return "months";
      }

      if (current === "months") {
        return "years";
      }

      return "days";
    });
  };

  const selectMonth = (month: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), month, 1));
    setCalendarView("days");
  };

  const selectYear = (year: number) => {
    setVisibleMonth((current) => new Date(year, current.getMonth(), 1));
    setCalendarView("months");
  };

  const selectDate = (date: Date) => {
    const nextValue = toDateValue(date);

    if (isOutOfRange(nextValue, min, max)) {
      return;
    }

    onValueChange(nextValue);
    closePanel();
  };

  return (
    <div ref={triggerRef} className={cn("relative w-full", wrapperClassName)}>
      <Input
        {...props}
        readOnly
        disabled={disabled}
        role="combobox"
        aria-controls={open ? panelId : undefined}
        aria-expanded={open}
        value={formatDisplayValue(value)}
        placeholder={placeholder}
        leftIcon={<CalendarIcon size={15} />}
        className={cn("cursor-pointer caret-transparent", className)}
        onClick={() => {
          if (!disabled) {
            openCalendar();
          }
        }}
        onKeyDown={(event) => {
          if (
            !disabled &&
            (event.key === "Enter" ||
              event.key === " " ||
              event.key === "ArrowDown")
          ) {
            event.preventDefault();
            openCalendar();
          }
        }}
      />

      {open && panelStyle && portalTarget
        ? createPortal(
            <div
              id={panelId}
              ref={panelRef}
              style={panelStyle}
              className="z-100 rounded-xl border border-border bg-card p-3 shadow-xl shadow-black/10"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={
                    calendarView === "years"
                      ? "Previous years"
                      : calendarView === "months"
                        ? "Previous year"
                        : "Previous month"
                  }
                  className="rounded-md text-slate-muted hover:text-ink"
                  onClick={() => moveVisibleRange(-1)}
                >
                  <ChevronLeft size={15} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="min-w-32 rounded-md text-sm font-bold text-ink"
                  aria-label="Change calendar view"
                  onClick={toggleCalendarView}
                >
                  {calendarView === "years"
                    ? yearRangeLabel
                    : calendarView === "months"
                      ? yearLabel
                      : monthLabel}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={
                    calendarView === "years"
                      ? "Next years"
                      : calendarView === "months"
                        ? "Next year"
                        : "Next month"
                  }
                  className="rounded-md text-slate-muted hover:text-ink"
                  onClick={() => moveVisibleRange(1)}
                >
                  <ChevronRight size={15} />
                </Button>
              </div>

              {calendarView === "days" ? (
                <div className="grid grid-cols-7 gap-1 text-center">
                  {weekdays.map((weekday) => (
                    <span
                      key={weekday}
                      className="py-1 text-xs font-black tracking-wide text-slate-muted uppercase"
                    >
                      {weekday}
                    </span>
                  ))}
                  {days.map((date) => {
                    const dateValue = toDateValue(date);
                    const selected = value === dateValue;
                    const today = todayValue === dateValue;
                    const outsideMonth =
                      date.getMonth() !== visibleMonth.getMonth();
                    const disabledDay = isOutOfRange(dateValue, min, max);

                    return (
                      <Button
                        key={dateValue}
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        disabled={disabledDay}
                        aria-pressed={selected}
                        className={cn(
                          "h-8 w-8 rounded-lg text-xs font-bold",
                          selected &&
                            "border-forge-teal bg-forge-teal text-white hover:bg-forge-teal hover:text-white",
                          outsideMonth && "text-slate-muted/35",
                          today &&
                            !selected &&
                            "border-forge-teal/30 text-forge-teal",
                        )}
                        onClick={() => selectDate(date)}
                      >
                        {date.getDate()}
                      </Button>
                    );
                  })}
                </div>
              ) : null}

              {calendarView === "months" ? (
                <div className="grid min-h-72 grid-cols-3 content-center gap-2">
                  {monthNames.map((month, monthIndex) => {
                    const selected = visibleMonth.getMonth() === monthIndex;
                    const disabledMonth = isMonthOutOfRange(
                      visibleMonth.getFullYear(),
                      monthIndex,
                      min,
                      max,
                    );

                    return (
                      <Button
                        key={month}
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabledMonth}
                        aria-pressed={selected}
                        className={cn(
                          "h-10 rounded-lg text-xs",
                          selected &&
                            "border-forge-teal bg-forge-teal text-white hover:bg-forge-teal hover:text-white",
                        )}
                        onClick={() => selectMonth(monthIndex)}
                      >
                        {month}
                      </Button>
                    );
                  })}
                </div>
              ) : null}

              {calendarView === "years" ? (
                <div className="grid min-h-72 grid-cols-3 content-center gap-2">
                  {years.map((year) => {
                    const selected = visibleMonth.getFullYear() === year;
                    const disabledYear = isYearOutOfRange(year, min, max);

                    return (
                      <Button
                        key={year}
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabledYear}
                        aria-pressed={selected}
                        className={cn(
                          "h-10 rounded-lg text-xs tabular-nums",
                          selected &&
                            "border-forge-teal bg-forge-teal text-white hover:bg-forge-teal hover:text-white",
                        )}
                        onClick={() => selectYear(year)}
                      >
                        {year}
                      </Button>
                    );
                  })}
                </div>
              ) : null}

              <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  disabled={isOutOfRange(todayValue, min, max)}
                  onClick={() => selectDate(new Date())}
                >
                  Today
                </Button>
                {clearable ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      onValueChange("");
                      closePanel();
                    }}
                  >
                    Clear
                  </Button>
                ) : null}
              </div>
            </div>,
            portalTarget,
          )
        : null}
    </div>
  );
}

export { DateInput };
