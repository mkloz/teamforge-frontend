import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  Calendar,
  DollarSign,
  MapPin,
  Tag,
  Type,
} from "lucide-react";
import type {
  PlanChangeFieldRenderState,
  PlanChangeFormState,
  PlanProposalFieldOption,
} from "@/features/group-plan-detail/components/plan-change-dialog/plan-change-dialog.types";
import { PlanChangeFieldHeader } from "@/features/group-plan-detail/components/plan-change-dialog/plan-change-field-header";
import { PlanChangeFieldPanel } from "@/features/group-plan-detail/components/plan-change-dialog/plan-change-field-panel";
import { getCurrentProposalValue } from "@/features/group-plan-detail/lib/group-plan-proposal-formatters";
import { cn } from "@/shared/lib/utils";
import type { PlanProposalField } from "@/shared/schemas/enums";

const FIELD_ICON: Record<PlanProposalField, LucideIcon> = {
  TITLE: Type,
  DESCRIPTION: AlignLeft,
  DATE_TIME: Calendar,
  LOCATION: MapPin,
  COST: DollarSign,
  CATEGORY: Tag,
};

interface PlanChangeFieldRowProps {
  form: PlanChangeFormState;
  onCollapse: () => void;
  onToggle: () => void;
  option: PlanProposalFieldOption;
  renderState: PlanChangeFieldRenderState;
}

export function PlanChangeFieldRow({
  form,
  onCollapse,
  onToggle,
  option,
  renderState,
}: PlanChangeFieldRowProps) {
  const Icon = FIELD_ICON[option.value];
  const currentValue = form.plan
    ? getCurrentProposalValue(form.plan, option.value)
    : "";

  return (
    <li
      className={cn(
        "relative transition-colors duration-150",
        !renderState.last && "border-border/50 border-b",
        renderState.open && "bg-forge-teal/[0.035]",
      )}
    >
      <PlanChangeFieldRail isOpen={renderState.open} />
      <PlanChangeFieldHeader
        currentValue={currentValue}
        icon={Icon}
        isOpen={renderState.open}
        option={option}
        onToggle={onToggle}
      />
      <PlanChangeFieldPanel
        currentValue={currentValue}
        form={form}
        option={option}
        renderState={renderState}
        onCollapse={onCollapse}
      />
    </li>
  );
}

function PlanChangeFieldRail({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      className={cn(
        "absolute top-0 bottom-0 left-0 w-0.75 rounded-r-full transition-all duration-300",
        isOpen ? "bg-forge-teal opacity-100" : "opacity-0",
      )}
      aria-hidden="true"
    />
  );
}
