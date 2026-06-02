import { Clock } from "lucide-react";

import { DateInput } from "@/shared/components/ui/date-input";
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
  return (
    <SectionCard>
      <SectionHeader title="When" />

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

      {(planDate || planTime) && (
        <div className="fade-in inline-flex w-fit max-w-full animate-in items-center gap-2 rounded-full border border-forge-teal/15 bg-forge-teal/5 px-3 py-2 duration-200">
          <Clock size={12} className="shrink-0 text-forge-teal/70" />
          <p className="truncate font-medium text-forge-teal text-xs">
            {planDate ? formatPlanDateSummary(planDate) : "Date TBD"}
            {planTime && ` at ${planTime}`}
          </p>
        </div>
      )}
    </SectionCard>
  );
}
