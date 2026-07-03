import type { CSSProperties, Dispatch, RefObject, SetStateAction } from "react";

import type {
  TimeFormat,
  TimeParts,
} from "@/shared/components/ui/time-input/types";

export interface TimeInputPanelProps {
  activeHourRef: (node: HTMLButtonElement | null) => void;
  activeMinuteRef: (node: HTMLButtonElement | null) => void;
  activePeriodRef: (node: HTMLButtonElement | null) => void;
  clearable: boolean;
  closePanel: () => void;
  commitParts: (parts: Partial<TimeParts>) => void;
  hourOptions: number[];
  minuteOptions: number[];
  onValueChange: (value: string) => void;
  panelId: string;
  panelRef: RefObject<HTMLDivElement | null>;
  panelStyle: CSSProperties;
  portalTarget: Element;
  selectedMinute: number;
  selectedParts: TimeParts;
  setTimeFormat: Dispatch<SetStateAction<TimeFormat>>;
  useMeridiem: boolean;
}
