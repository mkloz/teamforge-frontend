import { Lightbulb } from "lucide-react";
import { useState } from "react";
import type { CreateGroupPlanProposalPayload } from "@/features/group-plan-detail/api/group-plan-detail.api";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  costTypeLabels,
  formatPlanCostValue,
  formatPlanLocationValue,
  getCurrentProposalValue,
  getCurrentSerializedProposalValue,
  getPlanCostValue,
  getPlanLocationValue,
  isPlanProposalField,
  locationModeLabels,
  normalizeProposalValue,
  planCategoryLabels,
  planProposalFieldOptions,
  serializePlanCostValue,
  serializePlanLocationValue,
} from "@/features/group-plan-detail/lib/group-plan-proposal-formatters";
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
import type {
  CostType,
  LocationMode,
  PlanProposalField,
} from "@/shared/schemas/enums";

interface PlanChangeDialogProps {
  detail: GroupPlanDetail;
  disabled?: boolean;
  isCreating: boolean;
  onCreate: (payload: CreateGroupPlanProposalPayload) => Promise<unknown>;
}

export function PlanChangeDialog({
  detail,
  disabled = false,
  isCreating,
  onCreate,
}: PlanChangeDialogProps) {
  const plan = detail.plan;
  const [open, setOpen] = useState(false);
  const [field, setField] = useState<PlanProposalField>("TITLE");
  const [value, setValue] = useState(() =>
    plan ? getCurrentProposalValue(plan, "TITLE") : "",
  );
  const [locationValue, setLocationValue] = useState(() =>
    plan ? getPlanLocationValue(plan) : null,
  );
  const [costValue, setCostValue] = useState(() =>
    plan ? getPlanCostValue(plan) : null,
  );
  const [error, setError] = useState<string | null>(null);

  function resetForm(nextField: PlanProposalField = "TITLE") {
    setField(nextField);
    setValue(plan ? getCurrentProposalValue(plan, nextField) : "");
    setLocationValue(plan ? getPlanLocationValue(plan) : null);
    setCostValue(plan ? getPlanCostValue(plan) : null);
    setError(null);
  }

  function handleFieldChange(nextField: string) {
    if (!isPlanProposalField(nextField)) {
      return;
    }

    resetForm(nextField);
  }

  async function handleSubmit() {
    if (!plan) {
      setError("This group does not have a plan to change yet.");
      return;
    }

    let proposedValue = "";

    try {
      if (field === "LOCATION") {
        if (!locationValue) {
          throw new Error("Choose a location option first.");
        }

        proposedValue = serializePlanLocationValue(locationValue);
      } else if (field === "COST") {
        if (!costValue) {
          throw new Error("Choose a cost option first.");
        }

        proposedValue = serializePlanCostValue(costValue);
      } else {
        proposedValue = normalizeProposalValue(field, value);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Check the change and try again.",
      );
      return;
    }

    if (!proposedValue) {
      setError("Add a new value before sending a change.");
      return;
    }

    if (proposedValue === getCurrentSerializedProposalValue(plan, field)) {
      setError("Change at least one detail before sending.");
      return;
    }

    setError(null);
    try {
      await onCreate({ field, proposedValue });
    } catch {
      return;
    }

    resetForm();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);

        if (!isOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || !plan}>
          <Lightbulb className="size-4" aria-hidden="true" />
          Suggest change
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Suggest a plan change</DialogTitle>
          <DialogDescription>
            Put one clear adjustment in front of the group. Everyone can review
            it before the plan moves.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="plan-change-field">Detail</Label>
            <Select value={field} onValueChange={handleFieldChange}>
              <SelectTrigger id="plan-change-field">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {planProposalFieldOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {plan ? (
            <div className="grid gap-2">
              <Label>Current</Label>
              <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 font-medium text-muted-foreground text-sm">
                {getCurrentProposalValue(plan, field) || "Not set"}
              </div>
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label id="plan-change-value-label">Proposed</Label>
            <ProposalValueInput
              field={field}
              value={value}
              locationValue={locationValue}
              costValue={costValue}
              labelId="plan-change-value-label"
              onCostChange={setCostValue}
              onLocationChange={setLocationValue}
              onValueChange={setValue}
            />
          </div>

          {error ? (
            <p
              id="plan-change-error"
              aria-live="polite"
              className="font-medium text-destructive text-sm"
            >
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={isCreating}
            disabled={disabled || !plan}
            onClick={() => void handleSubmit()}
          >
            Send change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProposalValueInput({
  costValue,
  field,
  labelId,
  locationValue,
  onCostChange,
  onLocationChange,
  onValueChange,
  value,
}: {
  costValue: ReturnType<typeof getPlanCostValue> | null;
  field: PlanProposalField;
  labelId: string;
  locationValue: ReturnType<typeof getPlanLocationValue> | null;
  onCostChange: (value: ReturnType<typeof getPlanCostValue>) => void;
  onLocationChange: (value: ReturnType<typeof getPlanLocationValue>) => void;
  onValueChange: (value: string) => void;
  value: string;
}) {
  if (field === "DATE_TIME") {
    return (
      <fieldset aria-labelledby={labelId} className="min-w-0 border-0 p-0">
        <DateTimeInput value={value} onValueChange={onValueChange} />
      </fieldset>
    );
  }

  if (field === "LOCATION") {
    const nextLocation = locationValue ?? {
      location: "",
      locationLat: null,
      locationLng: null,
      locationMode: "TBD" as LocationMode,
    };

    return (
      <fieldset
        aria-labelledby={labelId}
        className="grid min-w-0 gap-2 border-0 p-0"
      >
        <Select
          value={nextLocation.locationMode}
          onValueChange={(mode) => {
            if (!isLocationMode(mode)) {
              return;
            }

            onLocationChange({
              location: mode === "TBD" ? null : (nextLocation.location ?? ""),
              locationLat: null,
              locationLng: null,
              locationMode: mode,
            });
          }}
        >
          <SelectTrigger aria-label="Location type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(locationModeLabels).map(([mode, label]) => (
              <SelectItem key={mode} value={mode}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {nextLocation.locationMode !== "TBD" ? (
          <Input
            id="plan-change-location"
            aria-label="Location"
            value={nextLocation.location ?? ""}
            placeholder={
              nextLocation.locationMode === "ONLINE"
                ? "Meeting link or platform"
                : "Place or address"
            }
            onChange={(event) => {
              onLocationChange({
                ...nextLocation,
                location: event.target.value,
              });
            }}
          />
        ) : (
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 font-medium text-muted-foreground text-sm">
            {formatPlanLocationValue(nextLocation)}
          </div>
        )}
      </fieldset>
    );
  }

  if (field === "COST") {
    const nextCost = costValue ?? {
      cost: "FREE" as CostType,
      costAmount: null,
      costDetails: null,
    };

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
          <SelectTrigger aria-label="Cost type">
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
          <Input
            id="plan-change-cost-amount"
            aria-label="Estimated cost"
            type="number"
            min={0}
            value={nextCost.costAmount ?? ""}
            placeholder="Estimated cost"
            onChange={(event) => {
              const amount = Number(event.target.value);

              onCostChange({
                ...nextCost,
                costAmount:
                  event.target.value && !Number.isNaN(amount) ? amount : null,
              });
            }}
          />
        ) : null}
        <Textarea
          aria-label="Cost detail"
          value={nextCost.costDetails ?? ""}
          rows={2}
          placeholder="Useful cost detail"
          onChange={(event) => {
            onCostChange({
              ...nextCost,
              costDetails: event.target.value,
            });
          }}
        />
        <p className="text-muted-foreground text-xs">
          {formatPlanCostValue(nextCost)}
        </p>
      </fieldset>
    );
  }

  if (field === "CATEGORY") {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="plan-change-value" aria-labelledby={labelId}>
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

  return (
    <Textarea
      id="plan-change-value"
      aria-labelledby={labelId}
      value={value}
      rows={field === "DESCRIPTION" ? 4 : 2}
      onChange={(event) => onValueChange(event.target.value)}
    />
  );
}

function isLocationMode(value: string): value is LocationMode {
  return Object.keys(locationModeLabels).some((mode) => mode === value);
}

function isCostType(value: string): value is CostType {
  return Object.keys(costTypeLabels).some((cost) => cost === value);
}
