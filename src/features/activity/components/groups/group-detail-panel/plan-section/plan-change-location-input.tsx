import { LOCATION_MODE_LABELS } from "@/features/activity/lib/plan-location";
import { AddressAutocomplete } from "@/shared/components/maps/address-autocomplete";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { PlanLocationSelection } from "./plan-change-dialog-types";

interface LocationInputProps {
  locationValue: {
    locationMode: string;
    location: string;
    locationLat: number | null;
    locationLng: number | null;
  };
  onModeChange: (mode: string) => void;
  onLocationSelect: (location: PlanLocationSelection | null) => void;
  onLinkChange: (value: string) => void;
}

export function LocationInput({
  locationValue,
  onModeChange,
  onLocationSelect,
  onLinkChange,
}: LocationInputProps) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2 border-0 p-0">
      <Select value={locationValue.locationMode} onValueChange={onModeChange}>
        <SelectTrigger aria-label="Location type">
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

      {locationValue.locationMode === "IN_PERSON" ? (
        <AddressAutocomplete
          label="Place or address"
          badge="Plan location"
          hint="Members will see this place if the group approves the change."
          placeholder="Search address or venue name..."
          value={
            locationValue.location
              ? {
                  address: locationValue.location,
                  city: locationValue.location,
                  lat: locationValue.locationLat,
                  lng: locationValue.locationLng,
                }
              : null
          }
          onLocationSelect={onLocationSelect}
          className="[&_label]:font-semibold [&_label]:text-muted-foreground [&_label]:text-xs"
        />
      ) : locationValue.locationMode === "ONLINE" ? (
        <Input
          value={locationValue.location}
          onChange={(event) => onLinkChange(event.target.value)}
          placeholder="Meeting link or platform"
        />
      ) : null}
    </fieldset>
  );
}
