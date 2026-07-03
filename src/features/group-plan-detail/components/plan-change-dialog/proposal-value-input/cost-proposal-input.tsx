import type { ProposalValueInputProps } from "@/features/group-plan-detail/components/plan-change-dialog/proposal-value-input/proposal-value-input.types";
import {
  costTypeLabels,
  formatPlanCostValue,
  isCostType,
  type PlanCostValue,
} from "@/features/group-plan-detail/lib/group-plan-proposal-formatters";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";

const DEFAULT_PLAN_COST_VALUE = {
  cost: "FREE",
  costAmount: null,
  costDetails: null,
} satisfies PlanCostValue;

export function CostProposalInput({
  costValue,
  labelId,
  onCostChange,
}: ProposalValueInputProps) {
  const nextCost = costValue ?? DEFAULT_PLAN_COST_VALUE;

  return (
    <fieldset
      aria-labelledby={labelId}
      className="grid min-w-0 gap-2 border-0 p-0"
    >
      <Select
        value={nextCost.cost}
        onValueChange={(cost) => {
          if (!isCostType(cost)) {
            return;
          }

          onCostChange({
            cost,
            costAmount: cost === "PAID" ? nextCost.costAmount : null,
            costDetails: nextCost.costDetails,
          });
        }}
      >
        <SelectTrigger aria-label="Cost type" className="bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(costTypeLabels).map(([cost, label]) => (
            <SelectItem key={cost} value={cost}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {nextCost.cost === "PAID" ? (
        <CostAmountInput nextCost={nextCost} onChange={onCostChange} />
      ) : null}
      <CostDetailsInput nextCost={nextCost} onChange={onCostChange} />
      <p className="text-muted-foreground text-xs">
        {formatPlanCostValue(nextCost)}
      </p>
    </fieldset>
  );
}

function CostAmountInput({
  nextCost,
  onChange,
}: {
  nextCost: PlanCostValue;
  onChange: (value: PlanCostValue) => void;
}) {
  return (
    <Input
      id="plan-change-cost-amount"
      aria-label="Estimated cost"
      type="number"
      min={0}
      value={nextCost.costAmount ?? ""}
      placeholder="Estimated cost"
      className="bg-card"
      onChange={(event) => {
        const amount = Number(event.target.value);

        onChange({
          ...nextCost,
          costAmount:
            event.target.value && !Number.isNaN(amount) ? amount : null,
        });
      }}
    />
  );
}

function CostDetailsInput({
  nextCost,
  onChange,
}: {
  nextCost: PlanCostValue;
  onChange: (value: PlanCostValue) => void;
}) {
  return (
    <Textarea
      aria-label="Cost detail"
      value={nextCost.costDetails ?? ""}
      rows={2}
      placeholder="Useful cost detail"
      className="resize-none bg-card"
      onChange={(event) => {
        onChange({
          ...nextCost,
          costDetails: event.target.value,
        });
      }}
    />
  );
}
