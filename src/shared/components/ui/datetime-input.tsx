import type { ComponentProps } from "react";

import { DateInput } from "@/shared/components/ui/date-input";
import {
  joinLocalDateTimeValue,
  splitLocalDateTimeValue,
} from "@/shared/components/ui/date-time-picker/value-adapters";
import { TimeInput } from "@/shared/components/ui/time-input";
import { cn } from "@/shared/lib/utils";

interface DateTimeInputProps
  extends Omit<
    ComponentProps<typeof DateInput>,
    "value" | "onValueChange" | "placeholder"
  > {
  intervalMinutes?: number;
  dateAriaLabel?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  timePlaceholder?: string;
  timeAriaLabel?: string;
  value?: string | null;
}

function DateTimeInput({
  className,
  dateAriaLabel,
  intervalMinutes,
  onValueChange,
  placeholder = "Select date",
  timePlaceholder = "Select time",
  timeAriaLabel,
  value,
  wrapperClassName,
  ...props
}: DateTimeInputProps) {
  const { date, time } = splitLocalDateTimeValue(value);

  return (
    <div className={cn("grid gap-2 sm:grid-cols-2", wrapperClassName)}>
      <DateInput
        {...props}
        aria-label={dateAriaLabel ?? props["aria-label"] ?? "Date"}
        value={date}
        placeholder={placeholder}
        className={className}
        onValueChange={(nextDate) => {
          onValueChange(nextDate ? joinLocalDateTimeValue(nextDate, time) : "");
        }}
      />
      <TimeInput
        aria-describedby={props["aria-describedby"]}
        aria-invalid={props["aria-invalid"]}
        aria-label={timeAriaLabel ?? "Time"}
        clearable={false}
        disabled={props.disabled || !date}
        readOnly={props.readOnly}
        required={props.required}
        value={time}
        placeholder={timePlaceholder}
        intervalMinutes={intervalMinutes}
        onValueChange={(nextTime) => {
          onValueChange(joinLocalDateTimeValue(date, nextTime));
        }}
      />
    </div>
  );
}

export { DateTimeInput };
