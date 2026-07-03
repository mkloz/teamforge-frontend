import type { CSSProperties } from "react";
import type { DateInputPanelProps } from "@/shared/components/ui/date-input-panel";
import type { InputProps } from "@/shared/components/ui/input";

export type DateInputProps = Omit<
  InputProps,
  "type" | "value" | "onChange" | "leftIcon" | "rightIcon"
> & {
  clearable?: boolean;
  max?: string;
  min?: string;
  onValueChange: (value: string) => void;
  value?: string | null;
};

export interface DateInputCalendarInput {
  max?: string;
  min?: string;
  onValueChange: (value: string) => void;
  value?: string | null;
}

export type DateInputControlProps = Omit<
  DateInputProps,
  "clearable" | "max" | "min" | "onValueChange" | "wrapperClassName"
> & {
  onOpen: () => void;
  open: boolean;
  panelId: string;
};

export type DateInputPanelPortalProps = DateInputPanelProps & {
  portalTarget: Element;
};

export interface DateInputPanelState {
  panelStyle: CSSProperties;
  portalTarget: Element;
}
