import type { CSSProperties, RefObject } from "react";

import { DateInputDaysView } from "@/shared/components/ui/date-input-panel/days-view";
import { DateInputPanelFooter } from "@/shared/components/ui/date-input-panel/footer";
import { DateInputPanelHeader } from "@/shared/components/ui/date-input-panel/header";
import {
  DateInputMonthsView,
  DateInputYearsView,
} from "@/shared/components/ui/date-input-panel/month-year-views";
import type { CalendarPanelState } from "@/shared/components/ui/date-input-panel/types";
import type { CalendarView } from "@/shared/components/ui/date-input-utils";

export interface DateInputPanelProps {
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
  panelRef: RefObject<HTMLDivElement | null>;
  panelStyle: CSSProperties;
  todayValue: string;
  value?: string | null;
  visibleMonth: Date;
  years: number[];
}

export function DateInputPanel({
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
      className="z-100 rounded-xl bg-card p-3 shadow-soft-md"
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
