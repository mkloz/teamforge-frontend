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
            <PlanFieldInput
              form={form}
              onLocationModeChange={onLocationModeChange}
              option={option}
            />
            <PlanFieldError error={form.error} />
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
  form,
  onLocationModeChange,
  option,
}: {
  form: PlanProposalForm;
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
    return <DateTimeInput value={form.value} onValueChange={form.setValue} />;
  }

  if (form.isLocationField) {
    return (
      <LocationInput
        locationValue={form.locationValue}
        onModeChange={onLocationModeChange}
        onLocationSelect={handleLocationSelect}
        onLinkChange={handleLinkChange}
      />
    );
  }

  return (
    <Textarea
      value={form.value}
      onChange={(event) => form.setValue(event.target.value)}
      rows={option.value === "DESCRIPTION" ? 4 : 2}
      className="resize-none"
    />
  );
}

function PlanFieldError({ error }: { error: string | null }) {
  if (!error) {
    return null;
  }

  return (
    <Notice
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
