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
  isProposalField,
  PLAN_PROPOSAL_FIELD_OPTIONS,
} from "./plan-proposal-fields";
import { usePlanProposalForm } from "./use-plan-proposal-form";

interface CreatePlanProposalFormProps {
  plan: Plan;
}

export function CreatePlanProposalForm({ plan }: CreatePlanProposalFormProps) {
  const form = usePlanProposalForm(plan);

  function handleFieldValueChange(value: string) {
    if (isProposalField(value)) {
      form.handleFieldChange(value);
    }
  }

  function handleLocationModeChange(locationMode: string) {
    if (!isPlanLocationMode(locationMode)) {
      return;
    }

    form.setLocationValue((current) => ({
      ...current,
      locationMode,
      location: locationMode === "TBD" ? "" : current.location,
    }));
  }

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
    <div className="mt-5 flex flex-col gap-3 rounded-xl border border-border/60 bg-card/70 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-foreground">New Proposal</p>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={form.closeForm}
          className="px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Field
        </Label>
        <Select value={form.field} onValueChange={handleFieldValueChange}>
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

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Current
        </Label>
        <div className="rounded-xl bg-muted/50 px-3 py-2 text-sm text-foreground/70">
          {form.currentValue || "Not set"}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Proposed
        </Label>
        {form.isDateField ? (
          <DateTimeInput value={form.value} onValueChange={form.setValue} />
        ) : form.isLocationField ? (
          <div className="flex flex-col gap-2">
            <Select
              value={form.locationValue.locationMode}
              onValueChange={handleLocationModeChange}
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
        <p className="text-xs font-medium text-destructive">{form.error}</p>
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

function isPlanLocationMode(value: string): value is Plan["locationMode"] {
  return Object.keys(LOCATION_MODE_LABELS).some((mode) => mode === value);
}
