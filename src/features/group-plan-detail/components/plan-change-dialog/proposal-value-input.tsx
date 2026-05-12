import {
  costTypeLabels,
  formatPlanCostValue,
  formatPlanLocationValue,
  isCostType,
  isLocationMode,
  locationModeLabels,
  type PlanCostValue,
  type PlanLocationValue,
  planCategoryLabels,
} from "@/features/group-plan-detail/lib/group-plan-proposal-formatters";
import { DateTimeInput } from "@/shared/components/ui/datetime-input";
import { Input } from "@/shared/components/ui/input";
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

interface ProposalValueInputProps {
  costValue: PlanCostValue | null;
  field: PlanProposalField;
  labelId: string;
  locationValue: PlanLocationValue | null;
  onCostChange: (value: PlanCostValue) => void;
  onLocationChange: (value: PlanLocationValue) => void;
  onValueChange: (value: string) => void;
  value: string;
}

export function ProposalValueInput({
  costValue,
  field,
  labelId,
  locationValue,
  onCostChange,
  onLocationChange,
  onValueChange,
  value,
}: ProposalValueInputProps) {
  if (field === "DATE_TIME") {
    return (
      <fieldset aria-labelledby={labelId} className="min-w-0 border-0 p-0">
        <DateTimeInput value={value} onValueChange={onValueChange} />
      </fieldset>
    );
  }

  if (field === "LOCATION") {
    return (
      <LocationProposalInput
        labelId={labelId}
        value={locationValue}
        onChange={onLocationChange}
      />
    );
  }

  if (field === "COST") {
    return (
      <CostProposalInput
        labelId={labelId}
        value={costValue}
        onChange={onCostChange}
      />
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

function LocationProposalInput({
  labelId,
  onChange,
  value,
}: {
  labelId: string;
  onChange: (value: PlanLocationValue) => void;
  value: PlanLocationValue | null;
}) {
  const nextLocation = value ?? {
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

          onChange({
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
            onChange({
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

function CostProposalInput({
  labelId,
  onChange,
  value,
}: {
  labelId: string;
  onChange: (value: PlanCostValue) => void;
  value: PlanCostValue | null;
}) {
  const nextCost = value ?? {
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

          onChange({
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

            onChange({
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
          onChange({
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
