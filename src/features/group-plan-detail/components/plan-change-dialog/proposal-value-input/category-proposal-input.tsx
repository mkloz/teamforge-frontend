import type { ProposalValueInputProps } from "@/features/group-plan-detail/components/plan-change-dialog/proposal-value-input/proposal-value-input.types";
import { planCategoryLabels } from "@/features/group-plan-detail/lib/group-plan-proposal-formatters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export function CategoryProposalInput({
  errorId,
  inputId,
  invalid,
  labelId,
  onValueChange,
  value,
}: ProposalValueInputProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        id={inputId}
        aria-describedby={errorId}
        aria-invalid={invalid}
        aria-labelledby={labelId}
        className="bg-card"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(planCategoryLabels).map(([category, label]) => (
          <SelectItem key={category} value={category}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
