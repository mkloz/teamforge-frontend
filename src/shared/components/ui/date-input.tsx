import { AccessibleDateInput } from "@/shared/components/ui/accessible-date-input";
import type { DateInputProps } from "@/shared/components/ui/date-input/types";
import { DatePickerBoundary } from "@/shared/components/ui/date-time-picker/date-picker-boundary";
import {
  parseCalendarDateValue,
  serializeCalendarDateValue,
} from "@/shared/components/ui/date-time-picker/value-adapters";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

function DateInput(props: DateInputProps) {
  return (
    <DatePickerBoundary fallback={<NativeDateInputFallback {...props} />}>
      <AccessibleDateInput {...props} />
    </DatePickerBoundary>
  );
}

function NativeDateInputFallback({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  disabled,
  form,
  id,
  max,
  min,
  name,
  onBlur,
  onFocus,
  onValueChange,
  placeholder,
  readOnly,
  required,
  value,
  wrapperClassName,
}: DateInputProps) {
  const parsedValue = parseCalendarDateValue(value);
  const minValue = parseCalendarDateValue(min);
  const maxValue = parseCalendarDateValue(max);

  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <Input
        type="date"
        id={id}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? placeholder)}
        aria-labelledby={ariaLabelledBy}
        className={className}
        disabled={disabled}
        form={form}
        max={max}
        min={min}
        name={name}
        onBlur={onBlur}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          if (!nextValue) {
            onValueChange("");
            return;
          }

          const parsedNextValue = parseCalendarDateValue(nextValue);
          if (
            parsedNextValue &&
            (!minValue || parsedNextValue.compare(minValue) >= 0) &&
            (!maxValue || parsedNextValue.compare(maxValue) <= 0)
          ) {
            onValueChange(serializeCalendarDateValue(parsedNextValue));
          }
        }}
        onFocus={onFocus}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        value={serializeCalendarDateValue(parsedValue)}
      />
    </div>
  );
}

export { DateInput };
