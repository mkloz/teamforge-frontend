import { Clock } from "lucide-react";

import { DateInput } from "@/shared/components/ui/date-input";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { TimeInput } from "@/shared/components/ui/time-input";

import { FieldLabel } from "./field-label";
import { SectionCard } from "./section-card";
import { SectionHeader } from "./section-header";
import { formatPlanDateSummary } from "./step2-plan.utils";

interface DateTimeSectionProps {
  onPlanDateChange: (value: string) => void;
  onPlanTimeChange: (value: string) => void;
  planDate: string;
  planTime: string;
}

function getTodayDateValue() {
  const today = new Date();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

export function DateTimeSection({
  onPlanDateChange,
  onPlanTimeChange,
  planDate,
  planTime,
}: DateTimeSectionProps) {
  const dateTimePreview = planDate || planTime;

  return (
    <SectionCard>
      <SectionHeader
        title="When"
        aside={
          dateTimePreview ? (
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2.5">
          <FieldLabel htmlFor="plan-date">Date required</FieldLabel>
          <DateInput
            id="plan-date"
            min={getTodayDateValue()}
            value={planDate}
            onValueChange={onPlanDateChange}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <FieldLabel htmlFor="plan-time">Time required</FieldLabel>
          <TimeInput
            id="plan-time"
            value={planTime}
            onValueChange={onPlanTimeChange}
          />
        </div>
      </div>
    </SectionCard>
  );
}
