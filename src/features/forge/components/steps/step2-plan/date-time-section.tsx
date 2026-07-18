import { CalendarClock, Clock, UsersRound } from "lucide-react";
import { DateInput } from "@/shared/components/ui/date-input";
import { SegmentedTabs } from "@/shared/components/ui/segmented-tabs";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { TimeInput } from "@/shared/components/ui/time-input";
import { FieldLabel } from "./field-label";
import { SectionCard } from "./section-card";
import { SectionHeader } from "./section-header";
import { formatPlanDateSummary } from "./step2-plan.utils";
import type { PlanScheduleMode } from "./types";

const SCHEDULE_MODE_OPTIONS = [
  {
    id: "TO_BE_DECIDED",
    label: "Decide together",
    shortLabel: "Together",
    icon: UsersRound,
  },
  {
    id: "FIXED",
    label: "Set date and time",
    shortLabel: "Set time",
    icon: CalendarClock,
  },
] as const;

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
  const dateTimePreview = planDate || planTime;

  return (
    <SectionCard>
      <SectionHeader
        title="When"
        aside={
          scheduleMode === "TO_BE_DECIDED" ? (
            <StatusPill tone="teal" size="md">
              Decide together
            </StatusPill>
          ) : dateTimePreview ? (
            <StatusPill
              icon={Clock}
              tone="teal"
              size="md"
              className="fade-in max-w-full animate-in border-forge-teal/15 bg-forge-teal/5 font-medium duration-200"
              iconClassName="size-3 text-forge-teal/70"
            >
              <span className="truncate">
                {planDate ? formatPlanDateSummary(planDate) : "Date TBD"}
                {planTime && ` at ${planTime}`}
              </span>
            </StatusPill>
          ) : null
        }
      />

      {canDecideTogether ? (
        <SegmentedTabs
          ariaLabel="Date and time choice"
          className="self-start"
          options={SCHEDULE_MODE_OPTIONS}
          size="lg"
          value={scheduleMode}
          onChange={onScheduleModeChange}
        />
      ) : null}

      {scheduleMode === "FIXED" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2.5">
            <FieldLabel htmlFor="plan-date">Date</FieldLabel>
            <DateInput
              id="plan-date"
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
        <p className="text-muted-foreground text-xs leading-relaxed">
          The group can propose and choose a time after it forms.
        </p>
      )}
    </SectionCard>
  );
}
