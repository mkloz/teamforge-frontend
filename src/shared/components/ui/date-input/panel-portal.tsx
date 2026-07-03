import { createPortal } from "react-dom";
import type { DateInputPanelPortalProps } from "@/shared/components/ui/date-input/types";
import { DateInputPanel } from "@/shared/components/ui/date-input-panel";

export function DateInputPanelPortal({
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
  portalTarget,
  todayValue,
  value,
  visibleMonth,
  years,
}: DateInputPanelPortalProps) {
  return createPortal(
    <DateInputPanel
      calendarPanelState={calendarPanelState}
      calendarView={calendarView}
      clearable={clearable}
      days={days}
      max={max}
      min={min}
      onClear={onClear}
      onMoveVisibleRange={onMoveVisibleRange}
      onSelectDate={onSelectDate}
      onSelectMonth={onSelectMonth}
      onSelectYear={onSelectYear}
      onToggleCalendarView={onToggleCalendarView}
      panelId={panelId}
      panelRef={panelRef}
      panelStyle={panelStyle}
      todayValue={todayValue}
      value={value}
      visibleMonth={visibleMonth}
      years={years}
    />,
    portalTarget,
  );
}
