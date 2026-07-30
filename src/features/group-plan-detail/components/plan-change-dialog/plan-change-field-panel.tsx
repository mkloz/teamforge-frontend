import { AlertCircle } from "lucide-react";
import type {
  PlanChangeFormState,
  PlanProposalFieldOption,
} from "@/features/group-plan-detail/components/plan-change-dialog/plan-change-dialog.types";
import { ProposalValueInput } from "@/features/group-plan-detail/components/plan-change-dialog/proposal-value-input";
import { Notice } from "@/shared/components/ui/notice";

interface PlanChangeFieldPanelProps {
  currentValue: string;
  form: PlanChangeFormState;
  option: PlanProposalFieldOption;
}

export function PlanChangeFieldPanel({
  currentValue,
  form,
  option,
}: PlanChangeFieldPanelProps) {
  const errorId = `plan-change-error-${option.value}`;
  const inputId = `plan-change-value-${option.value}`;
  const labelId = `plan-change-value-label-${option.value}`;
  const hasError = Boolean(form.error);

  return (
    <div>
      {currentValue ? (
        <div className="mb-4 rounded-lg bg-black/[0.035] px-3 py-2.5 dark:bg-white/[0.035]">
          <p className="text-muted-foreground text-xs">Current value</p>
          <p className="mt-0.5 line-clamp-2 font-medium text-foreground text-sm">
            {currentValue}
          </p>
        </div>
      ) : null}

      <div id={labelId} className="sr-only">
        {`New ${option.label}`}
      </div>
      <ProposalValueInput
        errorId={hasError ? errorId : undefined}
        field={form.field}
        inputId={inputId}
        invalid={hasError}
        value={form.value}
        locationValue={form.locationValue}
        costValue={form.costValue}
        labelId={labelId}
        onCostChange={form.setCostValue}
        onLocationChange={form.setLocationValue}
        onValueChange={form.setValue}
      />

      {form.error ? (
        <Notice
          id={errorId}
          aria-live="polite"
          tone="danger"
          size="sm"
          icon={<AlertCircle className="size-3.5 shrink-0" />}
          className="mt-3 bg-destructive/8"
        >
          {form.error}
        </Notice>
      ) : null}
    </div>
  );
}
