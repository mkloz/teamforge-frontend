import { useEffect, useId, useRef, useState } from "react";

import { useFloatingInputPanel } from "@/shared/hooks/use-floating-input-panel";
import { cancelDelay, scheduleDelay } from "@/shared/lib/browser-scheduling";

import { focusActiveTimeOptions } from "./active-options";
import { getTimeInputPanelState, getTimePickerPanelWidth } from "./panel-state";
import {
  buildHourOptions,
  buildMinuteOptions,
  getCommittedTimeValue,
  getNearestTimeOption,
  getTimeParts,
  shouldUseMeridiemTime,
} from "./time-value";
import type { TimeFormat } from "./types";

interface UseTimeInputStateOptions {
  intervalMinutes: number;
  onValueChange: (value: string) => void;
  value: string | null | undefined;
}

export function useTimeInputState({
  intervalMinutes,
  onValueChange,
  value,
}: UseTimeInputStateOptions) {
  const panelId = useId();
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(() =>
    shouldUseMeridiemTime() ? "12" : "24",
  );
  const useMeridiem = timeFormat === "12";
  const {
    closePanel,
    open,
    openPanel,
    panelRef,
    panelStyle,
    portalTarget,
    triggerRef,
  } = useFloatingInputPanel({
    panelHeight: 340,
    panelWidth: getTimePickerPanelWidth(useMeridiem),
  });
  const activeHourRef = useRef<HTMLButtonElement | null>(null);
  const activeMinuteRef = useRef<HTMLButtonElement | null>(null);
  const activePeriodRef = useRef<HTMLButtonElement | null>(null);
  const selectedParts = getTimeParts(value, intervalMinutes, useMeridiem);
  const hourOptions = buildHourOptions(useMeridiem);
  const minuteOptions = buildMinuteOptions(intervalMinutes);
  const panelState = getTimeInputPanelState({
    open,
    panelStyle,
    portalTarget,
  });
  const selectedMinute = getNearestTimeOption(
    minuteOptions,
    selectedParts.minute,
  );

  const commitParts = (parts: Partial<typeof selectedParts>) => {
    onValueChange(
      getCommittedTimeValue({
        parts,
        selectedParts,
        useMeridiem,
      }),
    );
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: selected time changes should recenter the active option while the panel is open.
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const delay = scheduleDelay(() => {
      focusActiveTimeOptions({
        hourRef: activeHourRef,
        minuteRef: activeMinuteRef,
      });
    }, 0);

    return () => {
      cancelDelay(delay);
    };
  }, [open, selectedParts.hour, selectedParts.minute]);

  return {
    activeHourRef,
    activeMinuteRef,
    activePeriodRef,
    closePanel,
    commitParts,
    hourOptions,
    minuteOptions,
    open,
    openPanel,
    panelId,
    panelRef,
    panelState,
    selectedMinute,
    selectedParts,
    setTimeFormat,
    triggerRef,
    useMeridiem,
  };
}
