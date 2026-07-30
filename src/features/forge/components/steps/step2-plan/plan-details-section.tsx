import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";

import { FieldLabel } from "./field-label";

interface PlanDetailsSectionProps {
  onPlanDescriptionChange: (value: string) => void;
  planDescription: string;
}

export function PlanDetailsSection({
  onPlanDescriptionChange,
  planDescription,
}: PlanDetailsSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <FieldLabel htmlFor="plan-description">Context</FieldLabel>
        <p className="text-muted-foreground text-xs leading-snug">
          Optional details people should know before joining.
        </p>
      </div>
      <div className="rounded-xl border border-border/45 bg-input transition-colors focus-within:border-forge-teal/60 focus-within:ring-2 focus-within:ring-forge-teal/12">
        <Textarea
          id="plan-description"
          value={planDescription}
          onChange={(event) => onPlanDescriptionChange(event.target.value)}
          placeholder="What should members know before joining?"
          maxLength={500}
          rows={3}
          aria-label="Plan context"
          className={cn(
            "resize-none rounded-xl border-0 bg-transparent px-3 py-3 font-medium text-foreground text-sm shadow-none",
            "placeholder:text-slate-muted/55 focus-visible:border-transparent focus-visible:ring-0",
          )}
        />
      </div>
    </div>
  );
}
