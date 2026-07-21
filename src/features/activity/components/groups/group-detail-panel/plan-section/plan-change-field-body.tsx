import { AnimatePresence, m } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { DateTimeInput } from "@/shared/components/ui/datetime-input";
import { Notice } from "@/shared/components/ui/notice";
import { Textarea } from "@/shared/components/ui/textarea";
import { PlanChangeActions } from "./plan-change-actions";
import type {
  PlanLocationSelection,
  PlanProposalFieldOption,
  PlanProposalForm,
} from "./plan-change-dialog-types";
import { LocationInput } from "./plan-change-location-input";
import {
  getLocationValueFromLink,
  getLocationValueFromSelection,
} from "./plan-change-location-value";

interface PlanFieldBodyProps {
  currentValue: string;
  form: PlanProposalForm;
  isExpanded: boolean;
  onLocationModeChange: (mode: string) => void;
  option: PlanProposalFieldOption;
}

export function PlanFieldBody({
  currentValue,
  form,
  isExpanded,
  onLocationModeChange,
  option,
}: PlanFieldBodyProps) {
  const errorId = `activity-plan-change-error-${option.value}`;
  const labelId = `activity-plan-change-value-label-${option.value}`;
  const hasError = Boolean(form.error);

  return (
    <AnimatePresence initial={false}>
      {isExpanded ? (
        <m.div
          id={`field-body-${option.value}`}
          role="region"
          aria-label={`Edit ${option.label}`}
          key={`body-${option.value}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: "auto",
            opacity: 1,
            transition: {
              height: {
                duration: 0.28,
                ease: [0.25, 0.46, 0.45, 0.94],
              },
              opacity: { duration: 0.2, delay: 0.07 },
            },
          }}
          exit={{
            height: 0,
            opacity: 0,
            transition: {
              height: { duration: 0.2, ease: [0.4, 0, 1, 1] },
              opacity: { duration: 0.1 },
            },
          }}
          className="overflow-hidden"
        >
          <div className="px-5 pt-0 pb-5">
            <CurrentValueNote currentValue={currentValue} />
            <span id={labelId} className="sr-only">
              New {option.label}
            </span>
            <PlanFieldInput
              errorId={hasError ? errorId : undefined}
              form={form}
              invalid={hasError}
              labelId={labelId}
              onLocationModeChange={onLocationModeChange}
              option={option}
            />
            <PlanFieldError error={form.error} id={errorId} />
            <PlanChangeActions form={form} />
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}

function CurrentValueNote({ currentValue }: { currentValue: string }) {
  if (!currentValue) {
    return null;
  }

  return (
    <p className="mb-3 flex items-baseline gap-1.5 text-slate-muted text-xs">
      <span className="shrink-0 font-medium">Currently:</span>
      <span className="min-w-0 truncate">{currentValue}</span>
    </p>
  );
}

function PlanFieldInput({
  errorId,
  form,
  invalid,
  labelId,
  onLocationModeChange,
  option,
}: {
  errorId?: string;
  form: PlanProposalForm;
  invalid: boolean;
  labelId: string;
  onLocationModeChange: (mode: string) => void;
  option: PlanProposalFieldOption;
}) {
  function handleLocationSelect(location: PlanLocationSelection | null) {
    form.setLocationValue((current) =>
      getLocationValueFromSelection(current, location),
    );
  }

  function handleLinkChange(value: string) {
    form.setLocationValue((current) =>
      getLocationValueFromLink(current, value),
    );
  }

  if (form.isDateField) {
    return (
      <fieldset
        aria-describedby={errorId}
        aria-invalid={invalid}
        aria-labelledby={labelId}
        className="min-w-0 border-0 p-0"
      >
        <DateTimeInput value={form.value} onValueChange={form.setValue} />
      </fieldset>
    );
  }

  if (form.isLocationField) {
    return (
      <LocationInput
        errorId={errorId}
        invalid={invalid}
        labelId={labelId}
        locationValue={form.locationValue}
        onModeChange={onLocationModeChange}
        onLocationSelect={handleLocationSelect}
        onLinkChange={handleLinkChange}
      />
    );
  }

  return (
    <Textarea
      aria-describedby={errorId}
      aria-invalid={invalid}
      aria-labelledby={labelId}
      value={form.value}
      onChange={(event) => form.setValue(event.target.value)}
      rows={option.value === "DESCRIPTION" ? 4 : 2}
      className="resize-none"
    />
  );
}

function PlanFieldError({ error, id }: { error: string | null; id: string }) {
  if (!error) {
    return null;
  }

  return (
    <Notice
      id={id}
      aria-live="polite"
      tone="danger"
      size="sm"
      icon={<AlertCircle className="size-3.5 shrink-0" />}
      className="mt-3 bg-destructive/8"
    >
      {error}
    </Notice>
  );
}
