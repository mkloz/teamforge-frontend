import type { Plan } from "@/features/activity/lib/activity-contract";
import { LOCATION_MODE_LABELS } from "@/features/activity/lib/plan-location";
import { Button } from "@/shared/components/ui/button";
import { DateTimeInput } from "@/shared/components/ui/datetime-input";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
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
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={form.closeForm}
          className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Field
        </Label>
        <Select
          value={form.field}
          onValueChange={(value) =>
            form.handleFieldChange(value as ProposalField)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLAN_PROPOSAL_FIELD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Current
        </Label>
        <div className="rounded-xl bg-muted/50 px-3 py-2 text-sm text-foreground/70">
          {form.currentValue || "Not set"}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Proposed
        </Label>
        {form.isDateField ? (
          <DateTimeInput value={form.value} onValueChange={form.setValue} />
        ) : form.isLocationField ? (
          <div className="space-y-2">
            <Select
              value={form.locationValue.locationMode}
              onValueChange={(locationMode) =>
                form.setLocationValue((current) => ({
                  ...current,
                  locationMode: locationMode as Plan["locationMode"],
                  location: locationMode === "TBD" ? "" : current.location,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LOCATION_MODE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.locationValue.locationMode !== "TBD" && (
              <Input
                value={form.locationValue.location}
                onChange={(event) =>
                  form.setLocationValue((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                placeholder={
                  form.locationValue.locationMode === "ONLINE"
                    ? "Meeting link or platform"
                    : "Place or address"
                }
              />
            )}
          </div>
        ) : (
          <Textarea
            value={form.value}
            onChange={(event) => form.setValue(event.target.value)}
            rows={form.field === "DESCRIPTION" ? 3 : 2}
            className="resize-none rounded-xl bg-background"
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
