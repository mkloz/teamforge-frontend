import { useId, useState } from "react";
import type { DateInputCalendarInput } from "@/shared/components/ui/date-input/types";
import {
  type CalendarView,
  getCalendarDays,
  getCalendarPanelViewState,
  getCalendarYears,
  getMovedVisibleMonth,
  getNextCalendarView,
  isOutOfRange,
  parseDateValue,
  toDateValue,
} from "@/shared/components/ui/date-input-utils";
import { useFloatingInputPanel } from "@/shared/hooks/use-floating-input-panel";

export function useDateInputCalendar({
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
  const days = getCalendarDays(visibleMonth);
  const years = getCalendarYears(calendarPanelState.yearRangeStart);

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
