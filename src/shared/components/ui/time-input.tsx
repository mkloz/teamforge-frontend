import { AccessibleTimeInput } from "@/shared/components/ui/accessible-time-input";
import { TimePickerBoundary } from "@/shared/components/ui/date-time-picker/time-picker-boundary";
import {
  parseTimeValue,
  serializeTimeValue,
} from "@/shared/components/ui/date-time-picker/value-adapters";
import { Input } from "@/shared/components/ui/input";
import type { TimeInputProps } from "@/shared/components/ui/time-input/types";
import { cn } from "@/shared/lib/utils";

function TimeInput(props: TimeInputProps) {
  return (
    <TimePickerBoundary fallback={<NativeTimeInputFallback {...props} />}>
      <AccessibleTimeInput {...props} />
    </TimePickerBoundary>
  );
}

function NativeTimeInputFallback({
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
}: TimeInputProps) {
  const parsedValue = parseTimeValue(value);
  const minValue = parseTimeValue(min);
  const maxValue = parseTimeValue(max);
  const normalizedValue =
    parsedValue &&
    (!minValue || parsedValue.compare(minValue) >= 0) &&
    (!maxValue || parsedValue.compare(maxValue) <= 0)
      ? parsedValue
      : null;

  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <Input
        type="time"
        id={id}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? placeholder)}
        aria-labelledby={ariaLabelledBy}
        className={className}
        disabled={disabled}
        form={form}
        max={serializeTimeValue(maxValue)}
        min={serializeTimeValue(minValue)}
        name={name}
        onBlur={onBlur}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          if (!nextValue) {
            onValueChange("");
            return;
          }

          const parsedNextValue = parseTimeValue(nextValue);
          if (
            parsedNextValue &&
            (!minValue || parsedNextValue.compare(minValue) >= 0) &&
            (!maxValue || parsedNextValue.compare(maxValue) <= 0)
          ) {
            onValueChange(serializeTimeValue(parsedNextValue));
          }
        }}
        onFocus={onFocus}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        step={60}
        value={serializeTimeValue(normalizedValue)}
      />
    </div>
  );
}

export type { TimeInputProps } from "@/shared/components/ui/time-input/types";
export { TimeInput };
