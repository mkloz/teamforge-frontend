import { AlertCircle } from "lucide-react";

import { Input } from "@/shared/components/ui/input";
import { Notice } from "@/shared/components/ui/notice";
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
  const nameStatus = getPlanNameStatus({ charCount, isNameValid, planName });

  return (
    <SectionCard accent={isNameValid}>
      <SectionHeader
        title="Plan name"
        aside={
          <PlanNameStatusAside isNameValid={isNameValid} status={nameStatus} />
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
        />

        <PlanNameErrorNotice isNameError={isNameError} />
      </div>
    </SectionCard>
  );
}

function getPlanNameStatus({
  charCount,
  isNameValid,
  planName,
}: Pick<EventTitleSectionProps, "charCount" | "isNameValid" | "planName">) {
  if (planName.length === 0) {
    return null;
  }

  return isNameValid ? "Looks good" : `${charCount}/3 min`;
}

function PlanNameStatusAside({
  isNameValid,
  status,
}: {
  isNameValid: boolean;
  status: string | null;
}) {
  if (!status) {
    return null;
  }

  return (
    <span
      className={cn(
        "text-micro text-muted-foreground/50",
        isNameValid && "text-forge-teal",
      )}
    >
      {status}
    </span>
  );
}

function PlanNameErrorNotice({ isNameError }: { isNameError: boolean }) {
  if (!isNameError) {
    return null;
  }

  return (
    <Notice
      id="name-error"
      role="alert"
      tone="danger"
      size="xs"
      icon={<AlertCircle size={13} className="shrink-0 text-destructive/60" />}
      iconClassName="mt-0"
      className="fade-in slide-in-from-top-1 animate-in items-center rounded-lg border-destructive/15 duration-150"
      contentClassName="font-medium text-destructive/70"
    >
      Use at least 3 characters for the plan name.
    </Notice>
  );
}
