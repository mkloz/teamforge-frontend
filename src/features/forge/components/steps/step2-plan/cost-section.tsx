import { DollarSign } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import { FieldLabel } from "./field-label";
import { InputField } from "./input-field";
import { SectionCard } from "./section-card";
import { SectionHeader } from "./section-header";
import type { PlanCost } from "./types";

interface CostSectionProps {
  onPlanCostAmountChange: (value: string) => void;
  onPlanCostChange: (value: PlanCost) => void;
  onPlanCostDetailsChange: (value: string) => void;
  planCost: PlanCost;
  planCostAmount: string;
  planCostDetails: string;
}

export function CostSection({
  onPlanCostAmountChange,
  onPlanCostChange,
  onPlanCostDetailsChange,
  planCost,
  planCostAmount,
  planCostDetails,
}: CostSectionProps) {
  return (
    <SectionCard>
      <SectionHeader
        icon={<DollarSign size={14} />}
        title="Cost"
        description="Be clear if members should expect to pay anything."
      />

      <div
        className="grid grid-cols-2 gap-2"
        role="radiogroup"
        aria-label="Plan cost"
      >
        {(["FREE", "PAID"] as const).map((value) => {
          const active = planCost === value;

          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onPlanCostChange(value)}
              className={cn(
                "rounded-xl border px-3 py-3 text-left transition-colors duration-150",
                active
                  ? "border-primary/30 bg-primary/8 ring-1 ring-primary/20"
                  : "border-border/50 bg-background/40 hover:border-primary/20 hover:bg-primary/4",
              )}
            >
              <p
                className={cn(
                  "text-xs font-semibold",
                  active ? "text-primary" : "text-foreground",
                )}
              >
                {value === "FREE" ? "Free" : "Paid"}
              </p>
              <p className="mt-0.5 text-micro text-muted-foreground/60">
                {value === "FREE" ? "No expected spend" : "Set an estimate"}
              </p>
            </button>
          );
        })}
      </div>

      {planCost === "PAID" && (
        <div className="grid gap-3 sm:grid-cols-[10rem_1fr] animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="space-y-2">
            <FieldLabel htmlFor="plan-cost-amount" required>
              Estimate
            </FieldLabel>
            <InputField icon={<DollarSign size={13} />}>
              <input
                id="plan-cost-amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={planCostAmount}
                onChange={(event) => onPlanCostAmountChange(event.target.value)}
                placeholder="12.50"
                className="w-full h-11 pl-8 pr-3 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/35 focus:outline-none rounded-xl"
              />
            </InputField>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="plan-cost-details" hint="Optional">
              Details
            </FieldLabel>
            <InputField>
              <input
                id="plan-cost-details"
                type="text"
                value={planCostDetails}
                onChange={(event) =>
                  onPlanCostDetailsChange(event.target.value)
                }
                placeholder="Tickets, split bill, entry fee..."
                maxLength={160}
                className="w-full h-11 px-3 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/35 focus:outline-none rounded-xl"
              />
            </InputField>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
