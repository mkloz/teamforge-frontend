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
  PlanChangeFormState,
  PlanProposalFieldOption,
} from "@/features/group-plan-detail/components/plan-change-dialog/plan-change-dialog.types";
import { PlanChangeFieldPanel } from "@/features/group-plan-detail/components/plan-change-dialog/plan-change-field-panel";
import { getCurrentProposalValue } from "@/features/group-plan-detail/lib/group-plan-proposal-formatters";
import { FormSectionAccordionItem } from "@/shared/components/ui/form-section-accordion";
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
  option: PlanProposalFieldOption;
}

export function PlanChangeFieldRow({ form, option }: PlanChangeFieldRowProps) {
  const Icon = FIELD_ICON[option.value];
  const currentValue = form.plan
    ? getCurrentProposalValue(form.plan, option.value)
    : "";
  const formattedCurrentValue = formatProposalSummary(
    option.value,
    currentValue,
  );

  return (
    <FormSectionAccordionItem
      value={option.value}
      title={option.label}
      summary={formattedCurrentValue}
      icon={Icon}
    >
      <PlanChangeFieldPanel
        currentValue={formattedCurrentValue}
        form={form}
        option={option}
      />
    </FormSectionAccordionItem>
  );
}

function formatProposalSummary(field: PlanProposalField, value: string) {
  if (!value) {
    return "Not set";
  }

  if (field === "DATE_TIME") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    }
  }

  if (field === "CATEGORY") {
    return value
      .toLowerCase()
      .replaceAll("_", " ")
      .replace(/^\w/, (character) => character.toUpperCase());
  }

  return value;
}
