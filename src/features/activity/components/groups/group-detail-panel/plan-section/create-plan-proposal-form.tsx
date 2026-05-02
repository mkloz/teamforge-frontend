import type { Plan } from "@/features/activity/lib/activity-contract";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import {
  PLAN_PROPOSAL_FIELD_OPTIONS,
  type ProposalField,
} from "./plan-proposal-fields";
import { usePlanProposalForm } from "./use-plan-proposal-form";

interface CreatePlanProposalFormProps {
  plan: Plan;
}

export function CreatePlanProposalForm({ plan }: CreatePlanProposalFormProps) {
  const form = usePlanProposalForm(plan);

  if (!form.isOpen) {
    return (
      <div className="mt-5">
        <Button
          variant="outline"
          size="sm"
          onClick={form.openForm}
          className="rounded-xl"
        >
          Suggest a Change
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border border-border/60 bg-card/70 p-3 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-foreground">New Proposal</p>
        <button
          type="button"
          onClick={form.closeForm}
          className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Field
        </label>
        <select
          value={form.field}
          onChange={(event) =>
            form.handleFieldChange(event.target.value as ProposalField)
          }
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-forge-teal"
        >
          {PLAN_PROPOSAL_FIELD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Current
        </label>
        <div className="rounded-xl bg-muted/50 px-3 py-2 text-sm text-foreground/70">
          {form.currentValue || "Not set"}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Proposed
        </label>
        {form.isDateField ? (
          <input
            type="datetime-local"
            value={form.value}
            onChange={(event) => form.setValue(event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-forge-teal"
          />
        ) : (
          <textarea
            value={form.value}
            onChange={(event) => form.setValue(event.target.value)}
            rows={form.field === "DESCRIPTION" ? 3 : 2}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-forge-teal"
          />
        )}
      </div>

      {form.error && (
        <p className="text-[11px] font-medium text-destructive">{form.error}</p>
      )}

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          onClick={() => void form.handleSubmit()}
          disabled={form.isCreating}
          className={cn("rounded-xl", form.isCreating && "opacity-80")}
        >
          {form.isCreating ? "Sending..." : "Send Proposal"}
        </Button>
      </div>
    </div>
  );
}
