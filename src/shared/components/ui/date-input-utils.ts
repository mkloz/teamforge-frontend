import { cn } from "@/shared/lib/utils";

export type CalendarView = "days" | "months" | "years";

const YEAR_RANGE_SIZE = 12;
const calendarDayButtonBaseClassName = "size-8 rounded-lg font-bold text-xs";
const calendarDayButtonSelectedClassName =
  "border-primary bg-primary text-primary-foreground";
const calendarDayButtonOutsideMonthClassName = "text-slate-muted/35";
const calendarDayButtonTodayClassName = "border-foreground/30 text-foreground";

const nextCalendarViewByView = {
  days: "months",
  months: "years",
  years: "days",
} satisfies Record<CalendarView, CalendarView>;

const calendarRangeLabelsByView = {
  days: {
    nextRangeLabel: "Next month",
    previousRangeLabel: "Previous month",
  },
  months: {
    nextRangeLabel: "Next year",
    previousRangeLabel: "Previous year",
  },
  years: {
    nextRangeLabel: "Next years",
    previousRangeLabel: "Previous years",
  },
} satisfies Record<
  CalendarView,
  {
    nextRangeLabel: string;
    previousRangeLabel: string;
  }
>;

const visibleMonthMoveOffsetByView = {
  days: {
    months: 1,
    years: 0,
  },
  months: {
    months: 0,
    years: 1,
  },
  years: {
    months: 0,
    years: YEAR_RANGE_SIZE,
  },
} satisfies Record<CalendarView, { months: number; years: number }>;

export const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
export const monthNames = Array.from({ length: 12 }, (_, month) =>
  new Intl.DateTimeFormat("en", { month: "short" }).format(
    new Date(2026, month, 1),
  ),
);

interface CalendarPanelViewStateInput {
  calendarView: CalendarView;
  visibleMonth: Date;
}

interface CalendarDayButtonViewStateInput {
  date: Date;
  max?: string;
  min?: string;
  todayValue: string;
  value?: string | null;
  visibleMonth: Date;
}

interface CalendarMonthButtonViewStateInput {
  max?: string;
  min?: string;
  monthIndex: number;
  visibleMonth: Date;
}

interface CalendarYearButtonViewStateInput {
  max?: string;
  min?: string;
  visibleMonth: Date;
  year: number;
}

interface CalendarDayButtonClassState {
  outsideMonth: boolean;
  selected: boolean;
  today: boolean;
}

interface CalendarOptionButtonClassState {
  baseClassName: string;
  selected: boolean;
}

interface ParsedDateParts {
  day: number;
  month: number;
  year: number;
}

export function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const dateParts = parseDateParts(value);

  if (!dateParts) {
    return null;
  }

  return new Date(dateParts.year, dateParts.month - 1, dateParts.day);
}

function parseDateParts(value: string): ParsedDateParts | null {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return { day, month, year };
}

export function formatDisplayValue(value: string | null | undefined) {
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

export function getCalendarDays(monthDate: Date) {
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

export function getCalendarYears(yearRangeStart: number) {
  return Array.from(
    { length: YEAR_RANGE_SIZE },
    (_, index) => yearRangeStart + index,
  );
}

export function getNextCalendarView(current: CalendarView): CalendarView {
  return nextCalendarViewByView[current];
}

export function getMovedVisibleMonth(
  current: Date,
  calendarView: CalendarView,
  amount: number,
) {
  const offset = visibleMonthMoveOffsetByView[calendarView];

  return new Date(
    current.getFullYear() + offset.years * amount,
    current.getMonth() + offset.months * amount,
    1,
  );
}

export function getCalendarPanelViewState({
  calendarView,
  visibleMonth,
}: CalendarPanelViewStateInput) {
  const rangeLabels = calendarRangeLabelsByView[calendarView];
  const monthLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);
  const yearLabel = String(visibleMonth.getFullYear());
  const yearRangeStart =
    Math.floor(visibleMonth.getFullYear() / YEAR_RANGE_SIZE) * YEAR_RANGE_SIZE;
  const yearRangeLabel = `${yearRangeStart} - ${
    yearRangeStart + YEAR_RANGE_SIZE - 1
  }`;

  return {
    nextRangeLabel: rangeLabels.nextRangeLabel,
    previousRangeLabel: rangeLabels.previousRangeLabel,
    title: getCalendarTitle({
      calendarView,
      monthLabel,
      yearLabel,
      yearRangeLabel,
    }),
    yearRangeStart,
  };
}

export function getCalendarDayButtonViewState({
  date,
  max,
  min,
  todayValue,
  value,
  visibleMonth,
}: CalendarDayButtonViewStateInput) {
  const dateValue = toDateValue(date);
  const selected = value === dateValue;

  return {
    dateValue,
    dayLabel: date.getDate(),
    disabled: isOutOfRange(dateValue, min, max),
    outsideMonth: date.getMonth() !== visibleMonth.getMonth(),
    selected,
    today: todayValue === dateValue,
  };
}

export function getCalendarMonthButtonViewState({
  max,
  min,
  monthIndex,
  visibleMonth,
}: CalendarMonthButtonViewStateInput) {
  return {
    disabled: isMonthOutOfRange(
      visibleMonth.getFullYear(),
      monthIndex,
      min,
      max,
    ),
    selected: visibleMonth.getMonth() === monthIndex,
  };
}

export function getCalendarYearButtonViewState({
  max,
  min,
  visibleMonth,
  year,
}: CalendarYearButtonViewStateInput) {
  return {
    disabled: isYearOutOfRange(year, min, max),
    selected: visibleMonth.getFullYear() === year,
  };
}

export function getCalendarDayButtonClassName(
  dayState: CalendarDayButtonClassState,
) {
  return cn(
    calendarDayButtonBaseClassName,
    getSelectedCalendarButtonClassName(dayState.selected),
    getOutsideMonthCalendarDayButtonClassName(dayState.outsideMonth),
    getTodayCalendarDayButtonClassName(dayState),
  );
}

export function getCalendarOptionButtonClassName({
  baseClassName,
  selected,
}: CalendarOptionButtonClassState) {
  return cn(baseClassName, getSelectedCalendarButtonClassName(selected));
}

export function isCalendarOpenKey(key: string) {
  return key === "Enter" || key === " " || key === "ArrowDown";
}

export function isOutOfRange(value: string, min?: string, max?: string) {
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

function getSelectedCalendarButtonClassName(selected: boolean) {
  return selected ? calendarDayButtonSelectedClassName : undefined;
}

function getOutsideMonthCalendarDayButtonClassName(outsideMonth: boolean) {
  return outsideMonth ? calendarDayButtonOutsideMonthClassName : undefined;
}

function getTodayCalendarDayButtonClassName({
  selected,
  today,
}: Pick<CalendarDayButtonClassState, "selected" | "today">) {
  return today && !selected ? calendarDayButtonTodayClassName : undefined;
}

function getCalendarTitle({
  calendarView,
  monthLabel,
  yearLabel,
  yearRangeLabel,
}: {
  calendarView: CalendarView;
  monthLabel: string;
  yearLabel: string;
  yearRangeLabel: string;
}) {
  const titleByView = {
    days: monthLabel,
    months: yearLabel,
    years: yearRangeLabel,
  } satisfies Record<CalendarView, string>;

  return titleByView[calendarView];
}
