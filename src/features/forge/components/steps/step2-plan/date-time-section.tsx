import { Calendar, Clock } from "lucide-react";

import { FieldLabel } from "./field-label";
import { InputField } from "./input-field";
import { SectionCard } from "./section-card";
import { SectionHeader } from "./section-header";
import { formatPlanDateSummary } from "./step2-plan.utils";

interface DateTimeSectionProps {
  onPlanDateChange: (value: string) => void;
  onPlanTimeChange: (value: string) => void;
  planDate: string;
  planTime: string;
}

export function DateTimeSection({
  onPlanDateChange,
  onPlanTimeChange,
  planDate,
  planTime,
}: DateTimeSectionProps) {
  return (
    <SectionCard>
      <SectionHeader
        icon={<Calendar size={14} />}
        title="Date & time"
        description="When are you planning to meet up?"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <FieldLabel htmlFor="plan-date">Date</FieldLabel>
          <InputField icon={<Calendar size={13} />}>
            <input
              id="plan-date"
              type="date"
              value={planDate}
              onChange={(event) => onPlanDateChange(event.target.value)}
              className="w-full h-11 pl-8 pr-2 bg-transparent text-sm font-medium text-foreground focus:outline-none rounded-xl cursor-pointer"
            />
          </InputField>
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="plan-time">Time</FieldLabel>
          <InputField icon={<Clock size={13} />}>
            <input
              id="plan-time"
              type="time"
              value={planTime}
              onChange={(event) => onPlanTimeChange(event.target.value)}
              className="w-full h-11 pl-8 pr-2 bg-transparent text-sm font-medium text-foreground focus:outline-none rounded-xl cursor-pointer"
            />
          </InputField>
        </div>
      </div>

      {(planDate || planTime) && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10 animate-in fade-in duration-200">
          <Clock size={12} className="text-primary/60 shrink-0" />
          <p className="text-xs font-medium text-primary/80">
            {planDate ? formatPlanDateSummary(planDate) : "Date TBD"}
            {planTime && ` at ${planTime}`}
          </p>
        </div>
      )}
    </SectionCard>
  );
}
