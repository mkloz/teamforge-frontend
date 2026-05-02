import { AlertCircle, Pencil } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import { FieldLabel } from "./field-label";
import { InputField } from "./input-field";
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
        title="Event title"
        description="Give your group gathering a name people will recognise."
      />

      <div className="space-y-2">
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
              isNameValid ? "text-primary" : "",
            )}
          >
            {isNameValid ? "Title" : "Title"}
          </span>
        </FieldLabel>

        <InputField
          icon={<span className="text-sm font-bold text-primary/30">#</span>}
          error={isNameError}
        >
          <input
            id="plan-name"
            type="text"
            value={planName}
            onChange={(event) => onPlanNameChange(event.target.value)}
            placeholder="e.g. Wednesday Basketball"
            autoComplete="off"
            maxLength={60}
            aria-describedby={isNameError ? "name-error" : undefined}
            className="w-full h-12 pl-9 pr-4 bg-transparent text-sm font-medium placeholder:text-muted-foreground/35 focus:outline-none rounded-xl"
          />
        </InputField>

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
