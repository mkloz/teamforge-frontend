import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import type { CalendarPanelState } from "@/shared/components/ui/date-input-panel/types";

interface DateInputPanelHeaderProps {
  calendarPanelState: CalendarPanelState;
  onMoveVisibleRange: (amount: number) => void;
  onToggleCalendarView: () => void;
}

export function DateInputPanelHeader({
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
