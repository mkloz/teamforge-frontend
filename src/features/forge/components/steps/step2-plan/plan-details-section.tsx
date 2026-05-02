import { AlignLeft } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import { FieldLabel } from "./field-label";
import { SectionCard } from "./section-card";
import { SectionHeader } from "./section-header";

interface PlanDetailsSectionProps {
  onPlanDescriptionChange: (value: string) => void;
  planDescription: string;
}

export function PlanDetailsSection({
  onPlanDescriptionChange,
  planDescription,
}: PlanDetailsSectionProps) {
  return (
    <SectionCard>
      <SectionHeader
        icon={<AlignLeft size={14} />}
        title="Plan details"
        description="Add the context people need before they say yes."
      />

      <div className="space-y-2">
        <FieldLabel htmlFor="plan-description" hint="Optional">
          Description
        </FieldLabel>
        <div className="rounded-xl border border-border/60 bg-background/60 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/12">
          <textarea
            id="plan-description"
            value={planDescription}
            onChange={(event) => onPlanDescriptionChange(event.target.value)}
            placeholder="What should members know before joining?"
            maxLength={500}
            rows={3}
            className={cn(
              "w-full resize-none rounded-xl bg-transparent px-3 py-3 text-sm font-medium text-foreground",
              "placeholder:text-muted-foreground/35 focus:outline-none",
            )}
          />
        </div>
      </div>
    </SectionCard>
  );
}
