import type { AriaAttributes, FocusEventHandler } from "react";

export interface TimeInputProps {
  "aria-describedby"?: AriaAttributes["aria-describedby"];
  "aria-invalid"?: AriaAttributes["aria-invalid"];
  "aria-label"?: AriaAttributes["aria-label"];
  "aria-labelledby"?: AriaAttributes["aria-labelledby"];
  className?: string;
  clearable?: boolean;
  disabled?: boolean;
  form?: string;
  id?: string;
  intervalMinutes?: number;
  max?: string;
  min?: string;
  name?: string;
  onBlur?: FocusEventHandler;
  onFocus?: FocusEventHandler;
  onValueChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  value?: string | null;
  wrapperClassName?: string;
}
