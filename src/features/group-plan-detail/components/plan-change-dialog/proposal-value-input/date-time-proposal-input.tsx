import type { ProposalValueInputProps } from "@/features/group-plan-detail/components/plan-change-dialog/proposal-value-input/proposal-value-input.types";
import { DateTimeInput } from "@/shared/components/ui/datetime-input";

export function DateTimeProposalInput({
  errorId,
  invalid,
  labelId,
  onValueChange,
  value,
}: ProposalValueInputProps) {
  return (
    <fieldset
      aria-describedby={errorId}
      aria-invalid={invalid}
      aria-labelledby={labelId}
      className="min-w-0 border-0 p-0"
    >
      <DateTimeInput value={value} onValueChange={onValueChange} />
    </fieldset>
  );
}
