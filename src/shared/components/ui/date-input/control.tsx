import { Calendar as CalendarIcon } from "lucide-react";
import type { DateInputControlProps } from "@/shared/components/ui/date-input/types";
import {
  formatDisplayValue,
  isCalendarOpenKey,
} from "@/shared/components/ui/date-input-utils";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

export function DateInputControl({
  className,
  disabled,
  onOpen,
  open,
  panelId,
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
      aria-controls={open ? panelId : undefined}
      aria-expanded={open}
      value={formatDisplayValue(value)}
      placeholder={placeholder}
      leftIcon={<CalendarIcon size={15} />}
      className={cn("cursor-pointer caret-transparent", className)}
      onClick={() => {
        if (!disabled) {
          onOpen();
        }
      }}
      onKeyDown={(event) => {
        if (!disabled && isCalendarOpenKey(event.key)) {
          event.preventDefault();
          onOpen();
        }
      }}
    />
  );
}
