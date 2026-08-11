import { DateInput } from "@/shared/components/ui/date-input";
import { TimeInput } from "@/shared/components/ui/time-input";
import { FieldLabel } from "./field-label";
import { PlanDecisionToggle } from "./plan-decision-toggle";
import type { PlanScheduleMode } from "./types";

interface DateTimeSectionProps {
  canDecideTogether: boolean;
  onPlanDateChange: (value: string) => void;
  onPlanTimeChange: (value: string) => void;
  planDate: string;
  planTime: string;
  scheduleMode: PlanScheduleMode;
  onScheduleModeChange: (value: PlanScheduleMode) => void;
}

function getTodayDateValue() {
  const today = new Date();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

export function DateTimeSection({
  canDecideTogether,
  onPlanDateChange,
  onPlanTimeChange,
  planDate,
  planTime,
  scheduleMode,
  onScheduleModeChange,
}: DateTimeSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-xl text-muted-foreground text-sm leading-relaxed">
        {canDecideTogether
          ? "Choose whether to set the schedule now."
          : "Set the schedule for the people you invite."}
      </p>

      {canDecideTogether ? (
        <div className="border-border/30 border-t">
          <PlanDecisionToggle
            checked={scheduleMode === "FIXED"}
            checkedDescription="Choose when the plan should happen."
            label="Set date and time now"
            onCheckedChange={(checked) =>
              onScheduleModeChange(checked ? "FIXED" : "TO_BE_DECIDED")
            }
            uncheckedDescription="The group can decide together after it forms."
          />
        </div>
      ) : null}

      {scheduleMode === "FIXED" ? (
        <div className="fade-in slide-in-from-top-1 grid animate-in grid-cols-1 gap-3 duration-200 sm:grid-cols-2">
          <div className="flex flex-col gap-2.5">
            <FieldLabel htmlFor="plan-date">Date</FieldLabel>
            <DateInput
              id="plan-date"
              aria-label="Plan date"
              min={getTodayDateValue()}
              value={planDate}
              onValueChange={onPlanDateChange}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <FieldLabel htmlFor="plan-time">Time</FieldLabel>
            <TimeInput
              id="plan-time"
              value={planTime}
              onValueChange={onPlanTimeChange}
            />
          </div>
        </div>
      ) : (
        <p className="fade-in animate-in text-muted-foreground text-xs leading-relaxed duration-200">
          No date or time is locked yet.
        </p>
      )}
    </div>
  );
}
