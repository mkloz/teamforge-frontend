import { createPortal } from "react-dom";

import { TimeInputPanelFooter } from "@/shared/components/ui/time-input/time-input-panel/time-input-panel-footer";
import { TimePickerGrid } from "@/shared/components/ui/time-input/time-input-panel/time-picker-grid";
import type { TimeInputPanelProps } from "@/shared/components/ui/time-input/time-input-panel/types";

export function TimeInputPanel({
  activeHourRef,
  activeMinuteRef,
  activePeriodRef,
  clearable,
  closePanel,
  commitParts,
  hourOptions,
  minuteOptions,
  onValueChange,
  panelId,
  panelRef,
  panelStyle,
  portalTarget,
  selectedMinute,
  selectedParts,
  setTimeFormat,
  useMeridiem,
}: TimeInputPanelProps) {
  return createPortal(
    <div
      id={panelId}
      ref={panelRef}
      style={panelStyle}
      className="z-100 rounded-xl bg-card p-2 shadow-soft-md"
    >
      <TimePickerGrid
        activeHourRef={activeHourRef}
        activeMinuteRef={activeMinuteRef}
        activePeriodRef={activePeriodRef}
        commitParts={commitParts}
        hourOptions={hourOptions}
        minuteOptions={minuteOptions}
        selectedMinute={selectedMinute}
        selectedParts={selectedParts}
        useMeridiem={useMeridiem}
      />

      <TimeInputPanelFooter
        clearable={clearable}
        closePanel={closePanel}
        onValueChange={onValueChange}
        setTimeFormat={setTimeFormat}
        useMeridiem={useMeridiem}
      />
    </div>,
    portalTarget,
  );
}
