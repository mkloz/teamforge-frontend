import { AlertCircle } from "lucide-react";

import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

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
  const nameStatus =
    planName.length > 0
      ? isNameValid
        ? "Looks good"
        : `${charCount}/3 min`
      : null;

  return (
    <SectionCard accent={isNameValid}>
      <SectionHeader
        title="Plan name"
        aside={
          nameStatus ? (
            <span
              className={cn(
                "text-micro text-muted-foreground/50",
                isNameValid && "text-forge-teal",
              )}
            >
              {nameStatus}
            </span>
          ) : null
        }
      />

      <div className="flex flex-col gap-2">
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
          aria-label="Plan name"
          aria-required="true"
          className="bg-background/60"
        />

        {isNameError && (
          <div
            id="name-error"
            role="alert"
            className="fade-in slide-in-from-top-1 flex animate-in items-center gap-2 rounded-lg border border-destructive/15 bg-destructive/5 px-3 py-2 duration-150"
          >
            <AlertCircle size={13} className="shrink-0 text-destructive/60" />
            <p className="font-medium text-destructive/70 text-xs">
              Plan name must be at least 3 characters.
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
