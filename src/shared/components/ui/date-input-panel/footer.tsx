import { Button } from "@/shared/components/ui/button";
import { isOutOfRange } from "@/shared/components/ui/date-input-utils";

interface DateInputPanelFooterProps {
  clearable: boolean;
  max?: string;
  min?: string;
  onClear: () => void;
  onSelectDate: (date: Date) => void;
  todayValue: string;
}

export function DateInputPanelFooter({
  clearable,
  max,
  min,
  onClear,
  onSelectDate,
  todayValue,
}: DateInputPanelFooterProps) {
  const selectToday = () => onSelectDate(new Date());

  return (
    <div className="mt-3 flex items-center justify-between border-border/70 border-t pt-3">
      <Button
        type="button"
        variant="ghost"
        size="xs"
        disabled={isOutOfRange(todayValue, min, max)}
        onClick={selectToday}
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
