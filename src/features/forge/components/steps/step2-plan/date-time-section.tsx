import { CalendarClock, Clock, UsersRound } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { DateInput } from "@/shared/components/ui/date-input";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { TimeInput } from "@/shared/components/ui/time-input";
import { cn } from "@/shared/lib/utils";
import { FieldLabel } from "./field-label";
import { SectionCard } from "./section-card";
import { SectionHeader } from "./section-header";
import { formatPlanDateSummary } from "./step2-plan.utils";
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
        <fieldset className="grid gap-2 sm:grid-cols-2">
          <legend className="sr-only">Date and time choice</legend>
          <ScheduleModeButton
            active={scheduleMode === "TO_BE_DECIDED"}
            icon={UsersRound}
            label="Decide together"
            onClick={() => onScheduleModeChange("TO_BE_DECIDED")}
          />
          <ScheduleModeButton
            active={scheduleMode === "FIXED"}
            icon={CalendarClock}
            label="Set a date and time now"
            onClick={() => onScheduleModeChange("FIXED")}
          />
        </fieldset>
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

function ScheduleModeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Clock;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-auto min-h-11 justify-start whitespace-normal px-3 py-2 text-left",
        active && "border-forge-teal/50 bg-forge-teal/8 text-forge-teal",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {label}
    </Button>
  );
}
