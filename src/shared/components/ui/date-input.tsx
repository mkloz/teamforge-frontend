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
import {
  type CalendarView,
  formatDisplayValue,
  getCalendarDayButtonClassName,
  getCalendarDayButtonViewState,
  getCalendarDays,
  getCalendarMonthButtonViewState,
  getCalendarOptionButtonClassName,
  getCalendarPanelViewState,
  getCalendarYearButtonViewState,
  getCalendarYears,
  getMovedVisibleMonth,
  getNextCalendarView,
  isCalendarOpenKey,
  isOutOfRange,
  monthNames,
  parseDateValue,
  toDateValue,
  weekdays,
} from "./date-input-utils";

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

interface DateInputCalendarInput {
  max?: string;
  min?: string;
  onValueChange: (value: string) => void;
  value?: string | null;
}

type DateInputCalendarState = ReturnType<typeof useDateInputCalendar>;
type DateInputControlProps = Omit<
  DateInputProps,
  "clearable" | "max" | "min" | "onValueChange" | "wrapperClassName"
> & {
  calendar: DateInputCalendarState;
};

interface DateInputPanelPortalProps {
  calendar: DateInputCalendarState;
  clearable: boolean;
  max?: string;
  min?: string;
  value?: string | null;
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
  const calendar = useDateInputCalendar({
    max,
    min,
    onValueChange,
    value,
  });

  return (
    <div
      ref={calendar.triggerRef}
      className={cn("relative w-full", wrapperClassName)}
    >
      <DateInputControl
        {...props}
        calendar={calendar}
        className={className}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
      />

      <DateInputPanelPortal
        calendar={calendar}
        clearable={clearable}
        max={max}
        min={min}
        value={value}
      />
    </div>
  );
}

function DateInputControl({
  calendar,
  className,
  disabled,
  placeholder,
  value,
  ...props
}: DateInputControlProps) {
  return (
    <Input
      {...props}
      readOnly
      disabled={disabled}
      role="combobox"
      aria-controls={calendar.open ? calendar.panelId : undefined}
      aria-expanded={calendar.open}
      value={formatDisplayValue(value)}
      placeholder={placeholder}
      leftIcon={<CalendarIcon size={15} />}
      className={cn("cursor-pointer caret-transparent", className)}
      onClick={() => {
        if (!disabled) {
          calendar.openCalendar();
        }
      }}
      onKeyDown={(event) => {
        if (!disabled && isCalendarOpenKey(event.key)) {
          event.preventDefault();
          calendar.openCalendar();
        }
      }}
    />
  );
}

function DateInputPanelPortal({
  calendar,
  clearable,
  max,
  min,
  value,
}: DateInputPanelPortalProps) {
  if (!(calendar.open && calendar.panelStyle && calendar.portalTarget)) {
    return null;
  }

  return createPortal(
    <DateInputPanel
      calendarPanelState={calendar.calendarPanelState}
      calendarView={calendar.calendarView}
      clearable={clearable}
      days={calendar.days}
      max={max}
      min={min}
      onClear={calendar.clearDate}
      onMoveVisibleRange={calendar.moveVisibleRange}
      onSelectDate={calendar.selectDate}
      onSelectMonth={calendar.selectMonth}
      onSelectYear={calendar.selectYear}
      onToggleCalendarView={calendar.toggleCalendarView}
      panelId={calendar.panelId}
      panelRef={calendar.panelRef}
      panelStyle={calendar.panelStyle}
      todayValue={calendar.todayValue}
      value={value}
      visibleMonth={calendar.visibleMonth}
      years={calendar.years}
    />,
    calendar.portalTarget,
  );
}

function useDateInputCalendar({
  max,
  min,
  onValueChange,
  value,
}: DateInputCalendarInput) {
  const panelId = useId();
  const selectedDate = parseDateValue(value);
  const todayValue = toDateValue(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>("days");
  const [visibleMonth, setVisibleMonth] = useState(selectedDate ?? new Date());
  const floatingPanel = useFloatingInputPanel({
    panelHeight: 360,
    panelWidth: 288,
  });
  const calendarPanelState = getCalendarPanelViewState({
    calendarView,
    visibleMonth,
  });
  const days = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const years = useMemo(
    () => getCalendarYears(calendarPanelState.yearRangeStart),
    [calendarPanelState.yearRangeStart],
  );

  const openCalendar = () => {
    setVisibleMonth(selectedDate ?? new Date());
    setCalendarView("days");
    floatingPanel.openPanel();
  };

  const moveVisibleRange = (amount: number) => {
    setVisibleMonth((current) => {
      return getMovedVisibleMonth(current, calendarView, amount);
    });
  };

  const toggleCalendarView = () => {
    setCalendarView((current) => getNextCalendarView(current));
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
    floatingPanel.closePanel();
  };

  const clearDate = () => {
    onValueChange("");
    floatingPanel.closePanel();
  };

  return {
    calendarPanelState,
    calendarView,
    clearDate,
    days,
    moveVisibleRange,
    open: floatingPanel.open,
    openCalendar,
    panelId,
    panelRef: floatingPanel.panelRef,
    panelStyle: floatingPanel.panelStyle,
    portalTarget: floatingPanel.portalTarget,
    selectDate,
    selectMonth,
    selectYear,
    todayValue,
    toggleCalendarView,
    triggerRef: floatingPanel.triggerRef,
    visibleMonth,
    years,
  };
}

type DateInputPanelRef = ReturnType<typeof useFloatingInputPanel>["panelRef"];
type DateInputPanelStyle = NonNullable<
  ReturnType<typeof useFloatingInputPanel>["panelStyle"]
>;
type CalendarPanelState = ReturnType<typeof getCalendarPanelViewState>;

interface DateInputPanelProps {
  calendarPanelState: CalendarPanelState;
  calendarView: CalendarView;
  clearable: boolean;
  days: Date[];
  max?: string;
  min?: string;
  onClear: () => void;
  onMoveVisibleRange: (amount: number) => void;
  onSelectDate: (date: Date) => void;
  onSelectMonth: (month: number) => void;
  onSelectYear: (year: number) => void;
  onToggleCalendarView: () => void;
  panelId: string;
  panelRef: DateInputPanelRef;
  panelStyle: DateInputPanelStyle;
  todayValue: string;
  value?: string | null;
  visibleMonth: Date;
  years: number[];
}

function DateInputPanel({
  calendarPanelState,
  calendarView,
  clearable,
  days,
  max,
  min,
  onClear,
  onMoveVisibleRange,
  onSelectDate,
  onSelectMonth,
  onSelectYear,
  onToggleCalendarView,
  panelId,
  panelRef,
  panelStyle,
  todayValue,
  value,
  visibleMonth,
  years,
}: DateInputPanelProps) {
  return (
    <div
      id={panelId}
      ref={panelRef}
      style={panelStyle}
      className="z-100 rounded-xl border border-border bg-card p-3 shadow-[0_1px_5px_color-mix(in_srgb,var(--color-ink)_6%,transparent)]"
    >
      <DateInputPanelHeader
        calendarPanelState={calendarPanelState}
        onMoveVisibleRange={onMoveVisibleRange}
        onToggleCalendarView={onToggleCalendarView}
      />

      {calendarView === "days" ? (
        <DateInputDaysView
          days={days}
          max={max}
          min={min}
          onSelectDate={onSelectDate}
          todayValue={todayValue}
          value={value}
          visibleMonth={visibleMonth}
        />
      ) : null}

      {calendarView === "months" ? (
        <DateInputMonthsView
          max={max}
          min={min}
          onSelectMonth={onSelectMonth}
          visibleMonth={visibleMonth}
        />
      ) : null}

      {calendarView === "years" ? (
        <DateInputYearsView
          max={max}
          min={min}
          onSelectYear={onSelectYear}
          visibleMonth={visibleMonth}
          years={years}
        />
      ) : null}

      <DateInputPanelFooter
        clearable={clearable}
        max={max}
        min={min}
        onClear={onClear}
        onSelectDate={onSelectDate}
        todayValue={todayValue}
      />
    </div>
  );
}

interface DateInputPanelHeaderProps {
  calendarPanelState: CalendarPanelState;
  onMoveVisibleRange: (amount: number) => void;
  onToggleCalendarView: () => void;
}

function DateInputPanelHeader({
  calendarPanelState,
  onMoveVisibleRange,
  onToggleCalendarView,
}: DateInputPanelHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={calendarPanelState.previousRangeLabel}
        className="rounded-md text-slate-muted hover:text-ink"
        onClick={() => onMoveVisibleRange(-1)}
      >
        <ChevronLeft size={15} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="min-w-32 rounded-md font-bold text-ink text-sm"
        aria-label="Change calendar view"
        onClick={onToggleCalendarView}
      >
        {calendarPanelState.title}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={calendarPanelState.nextRangeLabel}
        className="rounded-md text-slate-muted hover:text-ink"
        onClick={() => onMoveVisibleRange(1)}
      >
        <ChevronRight size={15} />
      </Button>
    </div>
  );
}

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

function DateInputDaysView({
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

interface DateInputMonthsViewProps {
  max?: string;
  min?: string;
  onSelectMonth: (month: number) => void;
  visibleMonth: Date;
}

function DateInputMonthsView({
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

interface DateInputYearsViewProps {
  max?: string;
  min?: string;
  onSelectYear: (year: number) => void;
  visibleMonth: Date;
  years: number[];
}

function DateInputYearsView({
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

interface DateInputPanelFooterProps {
  clearable: boolean;
  max?: string;
  min?: string;
  onClear: () => void;
  onSelectDate: (date: Date) => void;
  todayValue: string;
}

function DateInputPanelFooter({
  clearable,
  max,
  min,
  onClear,
  onSelectDate,
  todayValue,
}: DateInputPanelFooterProps) {
  return (
    <div className="mt-3 flex items-center justify-between border-border/70 border-t pt-3">
      <Button
        type="button"
        variant="ghost"
        size="xs"
        disabled={isOutOfRange(todayValue, min, max)}
        onClick={() => onSelectDate(new Date())}
      >
        Today
      </Button>
      {clearable ? (
        <Button type="button" variant="ghost" size="xs" onClick={onClear}>
          Clear
        </Button>
      ) : null}
    </div>
  );
}

export { DateInput };
