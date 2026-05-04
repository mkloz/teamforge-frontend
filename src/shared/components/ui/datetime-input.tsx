import type { ComponentProps } from "react";

import { DateInput } from "@/shared/components/ui/date-input";
import { TimeInput } from "@/shared/components/ui/time-input";
import { cn } from "@/shared/lib/utils";

interface DateTimeInputProps extends Omit<
  ComponentProps<typeof DateInput>,
  "value" | "onValueChange" | "placeholder"
> {
  intervalMinutes?: number;
  onValueChange: (value: string) => void;
  placeholder?: string;
  timePlaceholder?: string;
  value?: string | null;
}

function splitDateTimeValue(value: string | null | undefined) {
  if (!value) {
    return { date: "", time: "" };
  }

  const [date = "", timeWithSeconds = ""] = value.split("T");
  const time = timeWithSeconds.slice(0, 5);

  return { date, time };
}

function joinDateTimeValue(date: string, time: string) {
  if (!date && !time) {
    return "";
  }

  if (!date) {
    return "";
  }

  return `${date}T${time || "12:00"}`;
}

function DateTimeInput({
  className,
  intervalMinutes,
  onValueChange,
  placeholder = "Select date",
  timePlaceholder = "Select time",
  value,
  wrapperClassName,
  ...props
}: DateTimeInputProps) {
  const { date, time } = splitDateTimeValue(value);

  return (
    <div className={cn("grid gap-2 sm:grid-cols-2", wrapperClassName)}>
      <DateInput
        {...props}
        value={date}
        placeholder={placeholder}
        className={className}
        onValueChange={(nextDate) => {
          onValueChange(joinDateTimeValue(nextDate, time));
        }}
      />
      <TimeInput
        disabled={props.disabled}
        value={time}
        placeholder={timePlaceholder}
        intervalMinutes={intervalMinutes}
        onValueChange={(nextTime) => {
          onValueChange(joinDateTimeValue(date, nextTime));
        }}
      />
    </div>
  );
}

export { DateTimeInput };
