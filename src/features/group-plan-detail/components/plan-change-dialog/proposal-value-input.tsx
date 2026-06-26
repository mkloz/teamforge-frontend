import type { ReactNode } from "react";
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
import { AddressAutocomplete } from "@/shared/components/maps/address-autocomplete";
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
import type { LocationValue } from "@/shared/lib/maps/location.types";
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

type ProposalFieldRenderer = (props: ProposalValueInputProps) => ReactNode;

interface LocationModeInputProps {
  nextLocation: PlanLocationValue;
  onChange: (value: PlanLocationValue) => void;
}

const PROPOSAL_FIELD_RENDERERS = {
  CATEGORY: renderCategoryProposalInput,
  COST: renderCostProposalInput,
  DATE_TIME: renderDateTimeProposalInput,
  DESCRIPTION: renderTextProposalInput,
  LOCATION: renderLocationProposalInput,
  TITLE: renderTextProposalInput,
} satisfies Record<PlanProposalField, ProposalFieldRenderer>;

const LOCATION_MODE_RENDERERS = {
  IN_PERSON: renderInPersonLocationInput,
  ONLINE: renderOnlineLocationInput,
  TBD: renderTbdLocationInput,
} satisfies Record<LocationMode, (props: LocationModeInputProps) => ReactNode>;

const EMPTY_SELECTED_ADDRESS_LOCATION = {
  location: "",
  locationLat: null,
  locationLng: null,
} satisfies Pick<PlanLocationValue, "location" | "locationLat" | "locationLng">;

export function ProposalValueInput(props: ProposalValueInputProps) {
  return PROPOSAL_FIELD_RENDERERS[props.field](props);
}

function renderDateTimeProposalInput({
  labelId,
  onValueChange,
  value,
}: ProposalValueInputProps) {
  return (
    <fieldset aria-labelledby={labelId} className="min-w-0 border-0 p-0">
      <DateTimeInput value={value} onValueChange={onValueChange} />
    </fieldset>
  );
}

function renderLocationProposalInput({
  labelId,
  locationValue,
  onLocationChange,
}: ProposalValueInputProps) {
  return (
    <LocationProposalInput
      labelId={labelId}
      value={locationValue}
      onChange={onLocationChange}
    />
  );
}

function renderCostProposalInput({
  costValue,
  labelId,
  onCostChange,
}: ProposalValueInputProps) {
  return (
    <CostProposalInput
      labelId={labelId}
      value={costValue}
      onChange={onCostChange}
    />
  );
}

function renderCategoryProposalInput({
  labelId,
  onValueChange,
  value,
}: ProposalValueInputProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        id="plan-change-value"
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

function renderTextProposalInput({
  field,
  labelId,
  onValueChange,
  value,
}: ProposalValueInputProps) {
  return (
    <Textarea
      id="plan-change-value"
      aria-labelledby={labelId}
      value={value}
      rows={getTextProposalRows(field)}
      onChange={(event) => onValueChange(event.target.value)}
      className="resize-none bg-card"
    />
  );
}

function getTextProposalRows(field: PlanProposalField) {
  return field === "DESCRIPTION" ? 4 : 2;
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
        <SelectTrigger aria-label="Location type" className="bg-card">
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
      {LOCATION_MODE_RENDERERS[nextLocation.locationMode]({
        nextLocation,
        onChange,
      })}
    </fieldset>
  );
}

function renderInPersonLocationInput({
  nextLocation,
  onChange,
}: LocationModeInputProps) {
  return (
    <AddressAutocomplete
      label="Place or address"
      badge="Plan location"
      hint="Members will see this place if the group approves the change."
      placeholder="Search address or venue name..."
      value={getAddressAutocompleteValue(nextLocation)}
      onLocationSelect={(location) => {
        onChange(getSelectedAddressLocation(nextLocation, location));
      }}
      className="[&_label]:font-semibold [&_label]:text-muted-foreground [&_label]:text-xs"
    />
  );
}

function renderOnlineLocationInput({
  nextLocation,
  onChange,
}: LocationModeInputProps) {
  return (
    <Input
      id="plan-change-location"
      aria-label="Location"
      value={nextLocation.location ?? ""}
      placeholder="Meeting link or platform"
      className="bg-card"
      onChange={(event) => {
        onChange({
          ...nextLocation,
          location: event.target.value,
          locationLat: null,
          locationLng: null,
        });
      }}
    />
  );
}

function renderTbdLocationInput({ nextLocation }: LocationModeInputProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 font-medium text-muted-foreground text-sm">
      {formatPlanLocationValue(nextLocation)}
    </div>
  );
}

function getAddressAutocompleteValue(nextLocation: PlanLocationValue) {
  if (!nextLocation.location) {
    return null;
  }

  return {
    address: nextLocation.location,
    city: nextLocation.location,
    lat: nextLocation.locationLat,
    lng: nextLocation.locationLng,
  };
}

function getSelectedAddressLocation(
  nextLocation: PlanLocationValue,
  location: LocationValue | null,
): PlanLocationValue {
  const selectedLocation = getSelectedAddressFields(location);

  return {
    ...nextLocation,
    ...selectedLocation,
  };
}

function getSelectedAddressFields(location: LocationValue | null) {
  if (!location) {
    return EMPTY_SELECTED_ADDRESS_LOCATION;
  }

  return {
    location: location.address,
    locationLat: location.lat,
    locationLng: location.lng,
  };
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
      ) : null}
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
      <p className="text-muted-foreground text-xs">
        {formatPlanCostValue(nextCost)}
      </p>
    </fieldset>
  );
}
