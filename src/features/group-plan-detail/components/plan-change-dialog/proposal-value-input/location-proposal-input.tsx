import type { ReactNode } from "react";
import type { ProposalValueInputProps } from "@/features/group-plan-detail/components/plan-change-dialog/proposal-value-input/proposal-value-input.types";
import {
  formatPlanLocationValue,
  isLocationMode,
  locationModeLabels,
  type PlanLocationValue,
} from "@/features/group-plan-detail/lib/group-plan-proposal-formatters";
import { AddressAutocomplete } from "@/shared/components/maps/address-autocomplete";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { LocationValue } from "@/shared/lib/maps/location.types";
import type { LocationMode } from "@/shared/schemas/enums";

interface LocationModeInputProps {
  nextLocation: PlanLocationValue;
  onChange: (value: PlanLocationValue) => void;
}

const LOCATION_MODE_RENDERERS = {
  IN_PERSON: InPersonLocationInput,
  ONLINE: OnlineLocationInput,
  TBD: TbdLocationInput,
} satisfies Record<LocationMode, (props: LocationModeInputProps) => ReactNode>;

const EMPTY_SELECTED_ADDRESS_LOCATION = {
  location: "",
  locationLat: null,
  locationLng: null,
} satisfies Pick<PlanLocationValue, "location" | "locationLat" | "locationLng">;

const DEFAULT_PLAN_LOCATION_VALUE = {
  location: "",
  locationLat: null,
  locationLng: null,
  locationMode: "TBD",
} satisfies PlanLocationValue;

export function LocationProposalInput({
  errorId,
  invalid,
  labelId,
  locationValue,
  onLocationChange,
}: ProposalValueInputProps) {
  const nextLocation = locationValue ?? DEFAULT_PLAN_LOCATION_VALUE;

  return (
    <fieldset
      aria-describedby={errorId}
      aria-invalid={invalid}
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
        onChange: onLocationChange,
      })}
    </fieldset>
  );
}

function InPersonLocationInput({
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

function OnlineLocationInput({
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

function TbdLocationInput({ nextLocation }: LocationModeInputProps) {
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
