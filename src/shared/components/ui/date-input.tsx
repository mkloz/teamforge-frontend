import { DateInputControl } from "@/shared/components/ui/date-input/control";
import { DateInputPanelPortal } from "@/shared/components/ui/date-input/panel-portal";
import { getDateInputPanelState } from "@/shared/components/ui/date-input/panel-state";
import type { DateInputProps } from "@/shared/components/ui/date-input/types";
import { useDateInputCalendar } from "@/shared/components/ui/date-input/use-date-input-calendar";
import { cn } from "@/shared/lib/utils";

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
  const {
    calendarPanelState,
    calendarView,
    clearDate,
    days,
    moveVisibleRange,
    open,
    openCalendar,
    panelId,
    panelRef,
    panelStyle,
    portalTarget,
    selectDate,
    selectMonth,
    selectYear,
    todayValue,
    toggleCalendarView,
    triggerRef,
    visibleMonth,
    years,
  } = useDateInputCalendar({
    max,
    min,
    onValueChange,
    value,
  });
  const panelState = getDateInputPanelState({
    open,
    panelStyle,
    portalTarget,
  });

  return (
    <div ref={triggerRef} className={cn("relative w-full", wrapperClassName)}>
      <DateInputControl
        {...props}
        className={className}
        disabled={disabled}
        onOpen={openCalendar}
        open={open}
        panelId={panelId}
        placeholder={placeholder}
        value={value}
      />

      {panelState ? (
        <DateInputPanelPortal
          calendarPanelState={calendarPanelState}
          calendarView={calendarView}
          clearable={clearable}
          days={days}
          max={max}
          min={min}
          onClear={clearDate}
          onMoveVisibleRange={moveVisibleRange}
          onSelectDate={selectDate}
          onSelectMonth={selectMonth}
          onSelectYear={selectYear}
          onToggleCalendarView={toggleCalendarView}
          panelId={panelId}
          panelRef={panelRef}
          panelStyle={panelState.panelStyle}
          portalTarget={panelState.portalTarget}
          todayValue={todayValue}
          value={value}
          visibleMonth={visibleMonth}
          years={years}
        />
      ) : null}
    </div>
  );
}

export { DateInput };
