import type { ProposalValueInputProps } from "@/features/group-plan-detail/components/plan-change-dialog/proposal-value-input/proposal-value-input.types";
import { Textarea } from "@/shared/components/ui/textarea";
import type { PlanProposalField } from "@/shared/schemas/enums";

export function TextProposalInput({
  field,
  labelId,
  onValueChange,
  value,
}: ProposalValueInputProps) {
  return (
    <Textarea
      id="plan-change-value"
      aria-labelledby={labelId}
      value={value}
      rows={getTextProposalRows(field)}
      onChange={(event) => onValueChange(event.target.value)}
      className="resize-none bg-card"
    />
  );
}

function getTextProposalRows(field: PlanProposalField) {
  return field === "DESCRIPTION" ? 4 : 2;
}
