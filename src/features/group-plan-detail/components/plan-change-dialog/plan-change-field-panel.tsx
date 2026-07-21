import { AnimatePresence, m } from "framer-motion";
import { AlertCircle, SendHorizontal } from "lucide-react";
import type {
  PlanChangeFieldRenderState,
  PlanChangeFormState,
  PlanProposalFieldOption,
} from "@/features/group-plan-detail/components/plan-change-dialog/plan-change-dialog.types";
import { ProposalValueInput } from "@/features/group-plan-detail/components/plan-change-dialog/proposal-value-input";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";

interface PlanChangeFieldPanelProps {
  currentValue: string;
  form: PlanChangeFormState;
  onCollapse: () => void;
  option: PlanProposalFieldOption;
  renderState: PlanChangeFieldRenderState;
}

export function PlanChangeFieldPanel({
  currentValue,
  form,
  onCollapse,
  option,
  renderState,
}: PlanChangeFieldPanelProps) {
  return (
    <AnimatePresence initial={false}>
      {renderState.open && (
        <m.div
          id={`field-body-${option.value}`}
          role="region"
          aria-label={`Edit ${option.label}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: "auto",
            opacity: 1,
            transition: {
              height: {
                duration: 0.28,
                ease: [0.25, 0.46, 0.45, 0.94],
              },
              opacity: { duration: 0.2, delay: 0.06 },
            },
          }}
          exit={{
            height: 0,
            opacity: 0,
            transition: {
              height: { duration: 0.2, ease: [0.4, 0, 1, 1] },
              opacity: { duration: 0.12 },
            },
          }}
          className="overflow-hidden"
        >
          <PlanChangeFieldPanelContent
            currentValue={currentValue}
            form={form}
            option={option}
            renderState={renderState}
            onCollapse={onCollapse}
          />
        </m.div>
      )}
    </AnimatePresence>
  );
}

interface PlanChangeFieldPanelContentProps {
  currentValue: string;
  form: PlanChangeFormState;
  onCollapse: () => void;
  option: PlanProposalFieldOption;
  renderState: PlanChangeFieldRenderState;
}

function PlanChangeFieldPanelContent({
  currentValue,
  form,
  onCollapse,
  option,
  renderState,
}: PlanChangeFieldPanelContentProps) {
  const errorId = `plan-change-error-${option.value}`;
  const inputId = `plan-change-value-${option.value}`;
  const labelId = `plan-change-value-label-${option.value}`;
  const hasError = Boolean(form.error);

  return (
    <div className="px-5 pt-1 pb-5">
      {currentValue ? (
        <p className="mb-3 flex items-baseline gap-1.5 text-slate-muted text-xs">
          <span className="shrink-0 font-medium">Currently:</span>
          <span className="min-w-0 truncate">{currentValue}</span>
        </p>
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

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCollapse}
          className="text-slate-muted"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          loading={renderState.creating}
          disabled={renderState.disabled || !form.plan}
          title={
            renderState.online
              ? undefined
              : "Reconnect before suggesting changes."
          }
          onClick={() => void form.submit()}
        >
          <SendHorizontal className="size-3.5" aria-hidden="true" />
          Send to group
        </Button>
      </div>
    </div>
  );
}
