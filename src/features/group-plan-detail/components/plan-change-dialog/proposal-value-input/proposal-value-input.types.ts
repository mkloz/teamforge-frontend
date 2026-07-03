import type {
  PlanCostValue,
  PlanLocationValue,
} from "@/features/group-plan-detail/lib/group-plan-proposal-formatters";
import type { PlanProposalField } from "@/shared/schemas/enums";

export interface ProposalValueInputProps {
  costValue: PlanCostValue | null;
  field: PlanProposalField;
  labelId: string;
  locationValue: PlanLocationValue | null;
  onCostChange: (value: PlanCostValue) => void;
  onLocationChange: (value: PlanLocationValue) => void;
  onValueChange: (value: string) => void;
  value: string;
}
