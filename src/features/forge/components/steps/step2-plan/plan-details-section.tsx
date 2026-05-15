import { AlignLeft } from "lucide-react";

import { Textarea } from "@/shared/components/ui/textarea";
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
        title="Context"
        description="Add anything people should know before joining."
      />

      <div className="flex flex-col gap-2.5">
        <FieldLabel htmlFor="plan-description" hint="Optional">
          Description
        </FieldLabel>
        <div className="rounded-lg border border-border/50 bg-background/50 transition-colors focus-within:border-forge-teal/50 focus-within:ring-2 focus-within:ring-forge-teal/10">
          <Textarea
            id="plan-description"
            value={planDescription}
            onChange={(event) => onPlanDescriptionChange(event.target.value)}
            placeholder="What should members know before joining?"
            maxLength={500}
            rows={3}
            className={cn(
              "resize-none rounded-xl border-0 bg-transparent px-3 py-3 font-medium text-foreground text-sm shadow-none",
              "placeholder:text-muted-foreground/35 focus-visible:ring-0",
            )}
          />
        </div>
      </div>
    </SectionCard>
  );
}
