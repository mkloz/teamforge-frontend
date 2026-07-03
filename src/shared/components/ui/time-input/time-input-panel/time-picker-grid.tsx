import {
  getTimePickerGridClass,
  handleColumnKeyDown,
} from "@/shared/components/ui/time-input/panel-state";
import { TimePeriodColumn } from "@/shared/components/ui/time-input/time-input-panel/time-period-column";
import { TimeScrollColumn } from "@/shared/components/ui/time-input/time-input-panel/time-scroll-column";
import type { TimeParts } from "@/shared/components/ui/time-input/types";
import { cn } from "@/shared/lib/utils";

interface TimePickerGridProps {
  activeHourRef: (node: HTMLButtonElement | null) => void;
  activeMinuteRef: (node: HTMLButtonElement | null) => void;
  activePeriodRef: (node: HTMLButtonElement | null) => void;
  commitParts: (parts: Partial<TimeParts>) => void;
  hourOptions: number[];
  minuteOptions: number[];
  selectedMinute: number;
  selectedParts: TimeParts;
  useMeridiem: boolean;
}

export function TimePickerGrid({
  activeHourRef,
  activeMinuteRef,
  activePeriodRef,
  commitParts,
  hourOptions,
  minuteOptions,
  selectedMinute,
  selectedParts,
  useMeridiem,
}: TimePickerGridProps) {
  return (
    <div
      className={cn(
        "grid w-full items-stretch divide-x divide-border/60 rounded-xl py-1",
        getTimePickerGridClass(useMeridiem),
      )}
    >
      <TimeScrollColumn
        key={useMeridiem ? "hour-12" : "hour-24"}
        title="Hour"
        ariaLabel="Choose hour"
        options={hourOptions}
        isSelected={(hour) => selectedParts.hour === hour}
        activeRef={activeHourRef}
        getOptionLabel={(hour) =>
          useMeridiem ? hour : String(hour).padStart(2, "0")
        }
        onKeyDown={(_, event) =>
          handleColumnKeyDown(
            hourOptions,
            selectedParts.hour,
            event,
            (nextHour) => commitParts({ hour: nextHour }),
          )
        }
        onSelect={(hour) => commitParts({ hour })}
      />

      <TimeScrollColumn
        key={`minute-${minuteOptions.join("-")}`}
        title="Minute"
        ariaLabel="Choose minute"
        options={minuteOptions}
        isSelected={(minute) => selectedMinute === minute}
        activeRef={activeMinuteRef}
        getOptionLabel={(minute) => String(minute).padStart(2, "0")}
        onKeyDown={(_, event) =>
          handleColumnKeyDown(
            minuteOptions,
            selectedMinute,
            event,
            (nextMinute) => commitParts({ minute: nextMinute }),
          )
        }
        onSelect={(minute) => commitParts({ minute })}
      />

      {useMeridiem ? (
        <TimePeriodColumn
          selectedPeriod={selectedParts.period}
          activeRef={activePeriodRef}
          onSelect={(period) => commitParts({ period })}
        />
      ) : null}
    </div>
  );
}
