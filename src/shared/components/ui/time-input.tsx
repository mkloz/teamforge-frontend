import { cn } from "@/shared/lib/utils";
import {
  TimeInputControl,
  type TimeInputProps,
} from "./time-input/time-input-control";
import { TimeInputPanel } from "./time-input/time-input-panel";
import { useTimeInputState } from "./time-input/use-time-input-state";

function TimeInput({
  className,
  clearable = true,
  disabled,
  intervalMinutes = 5,
  onValueChange,
  placeholder = "Select time",
  value,
  wrapperClassName,
  ...props
}: TimeInputProps) {
  const {
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
  } = useTimeInputState({
    intervalMinutes,
    onValueChange,
    value,
  });

  return (
    <div ref={triggerRef} className={cn("relative w-full", wrapperClassName)}>
      <TimeInputControl
        className={className}
        disabled={disabled}
        inputProps={props}
        onOpen={openPanel}
        open={open}
        panelId={panelId}
        placeholder={placeholder}
        useMeridiem={useMeridiem}
        value={value}
      />

      {panelState ? (
        <TimeInputPanel
          activeHourRef={(node) => {
            activeHourRef.current = node;
          }}
          activeMinuteRef={(node) => {
            activeMinuteRef.current = node;
          }}
          activePeriodRef={(node) => {
            activePeriodRef.current = node;
          }}
          clearable={clearable}
          closePanel={closePanel}
          commitParts={commitParts}
          hourOptions={hourOptions}
          minuteOptions={minuteOptions}
          onValueChange={onValueChange}
          panelId={panelId}
          panelRef={panelRef}
          panelStyle={panelState.panelStyle}
          portalTarget={panelState.portalTarget}
          selectedMinute={selectedMinute}
          selectedParts={selectedParts}
          setTimeFormat={setTimeFormat}
          useMeridiem={useMeridiem}
        />
      ) : null}
    </div>
  );
}

export { TimeInput };
