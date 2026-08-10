import { m } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AlignLeft, Calendar, ChevronDown, MapPin, Type } from "lucide-react";
import { IconTile } from "@/shared/components/ui/icon-tile";
import type {
  PlanProposalFieldOption,
  PlanProposalForm,
} from "./plan-change-dialog-types";
import { PlanFieldBody } from "./plan-change-field-body";
import { isProposalField, type ProposalField } from "./plan-proposal-fields";

const FIELD_ICON: Record<ProposalField, LucideIcon> = {
  TITLE: Type,
  DESCRIPTION: AlignLeft,
  DATE_TIME: Calendar,
  LOCATION: MapPin,
};

interface PlanFieldItemProps {
  currentValue: string;
  form: PlanProposalForm;
  isLast: boolean;
  onLocationModeChange: (mode: string) => void;
  option: PlanProposalFieldOption;
}

export function PlanFieldItem({
  currentValue,
  form,
  isLast,
  onLocationModeChange,
  option,
}: PlanFieldItemProps) {
  const Icon = FIELD_ICON[option.value];
  const isExpanded = form.field === option.value && form.isOpen;

  return (
    <li
      className={[
        "relative transition-colors duration-150",
        !isLast && "border-border/50 border-b",
        isExpanded && "bg-primary-soft",
      ].join(" ")}
    >
      <PlanFieldAccent isExpanded={isExpanded} />
      <PlanFieldTrigger
        currentValue={currentValue}
        Icon={Icon}
        isExpanded={isExpanded}
        onSelect={() => {
          if (isProposalField(option.value)) {
            form.handleFieldChange(option.value);
          }
        }}
        option={option}
      />
      <PlanFieldBody
        currentValue={currentValue}
        form={form}
        isExpanded={isExpanded}
        onLocationModeChange={onLocationModeChange}
        option={option}
      />
    </li>
  );
}

function PlanFieldAccent({ isExpanded }: { isExpanded: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={[
        "absolute top-0 bottom-0 left-0 w-[3px] rounded-r-full transition-all duration-300",
        isExpanded ? "bg-brand-teal opacity-100" : "opacity-0",
      ].join(" ")}
    />
  );
}

interface PlanFieldTriggerProps {
  currentValue: string;
  Icon: LucideIcon;
  isExpanded: boolean;
  onSelect: () => void;
  option: PlanProposalFieldOption;
}

function PlanFieldTrigger({
  currentValue,
  Icon,
  isExpanded,
  onSelect,
  option,
}: PlanFieldTriggerProps) {
  return (
    <button
      type="button"
      aria-expanded={isExpanded}
      aria-controls={`field-body-${option.value}`}
      onClick={onSelect}
      className="flex w-full items-center gap-3 px-5 py-3.5 text-left"
    >
      <IconTile
        icon={Icon}
        iconClassName="size-3.75"
        size="sm"
        shape="square"
        tone={isExpanded ? "teal" : "none"}
        className={isExpanded ? "bg-brand-teal/15" : "text-slate-muted"}
      />
      <PlanFieldLabel
        currentValue={currentValue}
        isExpanded={isExpanded}
        label={option.label}
      />
      <PlanFieldChevron isExpanded={isExpanded} />
    </button>
  );
}

function PlanFieldLabel({
  currentValue,
  isExpanded,
  label,
}: {
  currentValue: string;
  isExpanded: boolean;
  label: string;
}) {
  return (
    <span className="min-w-0 flex-1">
      <span
        className={[
          "block font-medium text-sm leading-snug transition-colors duration-150",
          isExpanded ? "text-foreground" : "text-ink",
        ].join(" ")}
      >
        {label}
      </span>
      {!isExpanded && currentValue ? (
        <span className="mt-0.5 block truncate text-slate-muted text-xs">
          {currentValue}
        </span>
      ) : null}
    </span>
  );
}

function PlanFieldChevron({ isExpanded }: { isExpanded: boolean }) {
  return (
    <m.span
      animate={{ rotate: isExpanded ? 180 : 0 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      aria-hidden="true"
      className="shrink-0"
    >
      <ChevronDown
        className={[
          "size-4 transition-colors duration-150",
          isExpanded ? "text-foreground" : "text-slate-muted/40",
        ].join(" ")}
        strokeWidth={1.75}
      />
    </m.span>
  );
}
