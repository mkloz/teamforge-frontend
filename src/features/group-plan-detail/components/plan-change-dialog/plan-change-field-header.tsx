import { m } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import type { PlanProposalFieldOption } from "@/features/group-plan-detail/components/plan-change-dialog/plan-change-dialog.types";
import { IconTile } from "@/shared/components/ui/icon-tile";

type FieldHeaderVisualState = "open" | "closed";

const FIELD_HEADER_VISUALS = {
  open: {
    chevronClassName: "size-4 transition-colors duration-150 text-forge-teal",
    iconClassName: "transition-all duration-200 bg-forge-teal/15",
    iconTone: "teal",
    labelClassName:
      "block font-medium text-sm leading-snug transition-colors duration-150 text-forge-teal",
    rotate: 180,
  },
  closed: {
    chevronClassName:
      "size-4 transition-colors duration-150 text-slate-muted/40",
    iconClassName: "transition-all duration-200 text-slate-muted",
    iconTone: "none",
    labelClassName:
      "block font-medium text-sm leading-snug transition-colors duration-150 text-ink",
    rotate: 0,
  },
} satisfies Record<
  FieldHeaderVisualState,
  {
    chevronClassName: string;
    iconClassName: string;
    iconTone: "teal" | "none";
    labelClassName: string;
    rotate: number;
  }
>;

interface PlanChangeFieldHeaderProps {
  currentValue: string;
  icon: LucideIcon;
  isOpen: boolean;
  onToggle: () => void;
  option: PlanProposalFieldOption;
}

export function PlanChangeFieldHeader({
  currentValue,
  icon: Icon,
  isOpen,
  onToggle,
  option,
}: PlanChangeFieldHeaderProps) {
  const visualState = getFieldHeaderVisualState(isOpen);

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls={`field-body-${option.value}`}
      onClick={onToggle}
      className="flex w-full items-center gap-3 px-5 py-3.5 text-left"
    >
      <IconTile
        icon={Icon}
        size="sm"
        tone={visualState.iconTone}
        className={visualState.iconClassName}
        iconClassName="size-3.75"
      />

      <span className="min-w-0 flex-1">
        <span className={visualState.labelClassName}>{option.label}</span>
        <CollapsedFieldCurrentValue
          currentValue={currentValue}
          isOpen={isOpen}
        />
      </span>

      <m.span
        animate={{ rotate: visualState.rotate }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="shrink-0"
        aria-hidden="true"
      >
        <ChevronDown
          className={visualState.chevronClassName}
          strokeWidth={1.75}
        />
      </m.span>
    </button>
  );
}

function getFieldHeaderVisualState(isOpen: boolean) {
  return FIELD_HEADER_VISUALS[getFieldHeaderVisualStateKey(isOpen)];
}

function getFieldHeaderVisualStateKey(isOpen: boolean): FieldHeaderVisualState {
  return isOpen ? "open" : "closed";
}

function CollapsedFieldCurrentValue({
  currentValue,
  isOpen,
}: {
  currentValue: string;
  isOpen: boolean;
}) {
  if (isOpen || !currentValue) {
    return null;
  }

  return (
    <span className="mt-0.5 block truncate text-slate-muted text-xs">
      {currentValue}
    </span>
  );
}
