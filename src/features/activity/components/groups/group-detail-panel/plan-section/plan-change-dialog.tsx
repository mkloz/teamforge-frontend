import { Lightbulb } from "lucide-react";
import type { Plan } from "@/features/activity/lib/activity-contract";
import { LOCATION_MODE_LABELS } from "@/features/activity/lib/plan-location";
import { Button } from "@/shared/components/ui/button";
import { DateTimeInput } from "@/shared/components/ui/datetime-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
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
import {
  isProposalField,
  PLAN_PROPOSAL_FIELD_OPTIONS,
} from "./plan-proposal-fields";
import { usePlanProposalForm } from "./use-plan-proposal-form";

interface PlanChangeDialogProps {
  className?: string;
  plan: Plan;
}

export function PlanChangeDialog({ className, plan }: PlanChangeDialogProps) {
  const form = usePlanProposalForm(plan);

  function handleOpenChange(open: boolean) {
    if (open) {
      form.openForm();
      return;
    }

    form.closeForm();
  }

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
      location: locationMode === "TBD" ? "" : current.location,
      locationMode,
    }));
  }

  return (
    <Dialog open={form.isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="primary"
          size="xs"
          className={className}
          contentClassName="gap-1.5"
        >
          <Lightbulb className="size-3.5" aria-hidden="true" />
          <span className="truncate">Suggest</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Suggest a plan change</DialogTitle>
          <DialogDescription>
            Put one clear adjustment in front of the group. Everyone can review
            it before the plan changes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="plan-change-field"
              className="font-semibold text-muted-foreground text-xs"
            >
              Detail
            </Label>
            <Select value={form.field} onValueChange={handleFieldValueChange}>
              <SelectTrigger id="plan-change-field">
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

          <div className="flex flex-col gap-2">
            <Label className="font-semibold text-muted-foreground text-xs">
              Current
            </Label>
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-foreground/70 text-sm">
              {form.currentValue || "Not set"}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              id="plan-change-value-label"
              className="font-semibold text-muted-foreground text-xs"
            >
              Proposed
            </Label>
            {form.isDateField ? (
              <DateTimeInput value={form.value} onValueChange={form.setValue} />
            ) : form.isLocationField ? (
              <fieldset
                aria-labelledby="plan-change-value-label"
                className="flex min-w-0 flex-col gap-2 border-0 p-0"
              >
                <Select
                  value={form.locationValue.locationMode}
                  onValueChange={handleLocationModeChange}
                >
                  <SelectTrigger aria-label="Location type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LOCATION_MODE_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                {form.locationValue.locationMode !== "TBD" ? (
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
                ) : null}
              </fieldset>
            ) : (
              <Textarea
                value={form.value}
                onChange={(event) => form.setValue(event.target.value)}
                rows={form.field === "DESCRIPTION" ? 4 : 2}
                className="resize-none"
              />
            )}
          </div>

          {form.error ? (
            <p
              aria-live="polite"
              className="font-medium text-destructive text-sm"
            >
              {form.error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={form.closeForm}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            loading={form.isCreating}
            onClick={() => void form.handleSubmit()}
          >
            Send change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function isPlanLocationMode(value: string): value is Plan["locationMode"] {
  return Object.keys(LOCATION_MODE_LABELS).some((mode) => mode === value);
}
