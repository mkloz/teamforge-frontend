import { AlertCircle, Pencil } from "lucide-react";

import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

import { FieldLabel } from "./field-label";
import { SectionCard } from "./section-card";
import { SectionHeader } from "./section-header";

interface EventTitleSectionProps {
  charCount: number;
  isNameError: boolean;
  isNameValid: boolean;
  onPlanNameChange: (value: string) => void;
  planName: string;
}

export function EventTitleSection({
  charCount,
  isNameError,
  isNameValid,
  onPlanNameChange,
  planName,
}: EventTitleSectionProps) {
  return (
    <SectionCard accent={isNameValid}>
      <SectionHeader
        icon={<Pencil size={14} />}
        title="Plan name"
        description="Name the specific hangout you want to organise."
      />

      <div className="space-y-2.5">
        <FieldLabel
          htmlFor="plan-name"
          required
          hint={
            planName.length > 0
              ? isNameValid
                ? "Looks good"
                : `${charCount}/3 min`
              : undefined
          }
        >
          <span
            className={cn(
              "transition-colors",
              isNameValid ? "text-forge-teal" : "",
            )}
          >
            Title
          </span>
        </FieldLabel>

        <Input
          id="plan-name"
          type="text"
          value={planName}
          onChange={(event) => onPlanNameChange(event.target.value)}
          placeholder="e.g. Wednesday Basketball"
          autoComplete="off"
          maxLength={60}
          aria-invalid={isNameError}
          aria-describedby={isNameError ? "name-error" : undefined}
          className="bg-background/60"
        />

        {isNameError && (
          <div
            id="name-error"
            role="alert"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/5 border border-destructive/15 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <AlertCircle size={13} className="text-destructive/60 shrink-0" />
            <p className="text-xs font-medium text-destructive/70">
              Title must be at least 3 characters.
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
