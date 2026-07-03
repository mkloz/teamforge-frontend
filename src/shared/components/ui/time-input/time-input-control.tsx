import { Clock } from "lucide-react";

import { Input, type InputProps } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

import {
  handleTimeInputKeyDown,
  openTimeInputPanelIfEnabled,
} from "./panel-state";
import { formatTimeDisplay } from "./time-value";

export type TimeInputProps = Omit<
  InputProps,
  "type" | "value" | "onChange" | "leftIcon" | "rightIcon"
> & {
  clearable?: boolean;
  intervalMinutes?: number;
  onValueChange: (value: string) => void;
  value?: string | null;
};

interface TimeInputControlProps
  extends Pick<
    TimeInputProps,
    "className" | "disabled" | "placeholder" | "value"
  > {
  inputProps: Omit<
    TimeInputProps,
    | "className"
    | "clearable"
    | "disabled"
    | "intervalMinutes"
    | "onValueChange"
    | "placeholder"
    | "value"
    | "wrapperClassName"
  >;
  onOpen: () => void;
  open: boolean;
  panelId: string;
  useMeridiem: boolean;
}

export function TimeInputControl({
  className,
  disabled,
  inputProps,
  onOpen,
  open,
  panelId,
  placeholder,
  useMeridiem,
  value,
}: TimeInputControlProps) {
  return (
    <Input
      {...inputProps}
      readOnly
      disabled={disabled}
      role="combobox"
      aria-controls={open ? panelId : undefined}
      aria-expanded={open}
      value={formatTimeDisplay(value, useMeridiem)}
      placeholder={placeholder}
      leftIcon={<Clock size={15} />}
      className={cn("cursor-pointer caret-transparent", className)}
      onClick={() => {
        openTimeInputPanelIfEnabled({ disabled, openPanel: onOpen });
      }}
      onKeyDown={(event) => {
        handleTimeInputKeyDown({ disabled, event, openPanel: onOpen });
      }}
    />
  );
}
