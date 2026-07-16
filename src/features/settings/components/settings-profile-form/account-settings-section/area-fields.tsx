import { MapPin } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { SettingsProfileValues } from "@/features/settings/schemas/settings-profile.schema";
import {
  AddressAutocomplete,
  type LocationValue,
} from "@/shared/components/maps/address-autocomplete";
import { FactItem } from "@/shared/components/ui/fact-item";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form";
import type { User } from "@/shared/schemas";

interface AreaFieldsProps {
  currentUser: User | undefined;
  disabled: boolean;
  form: UseFormReturn<SettingsProfileValues>;
}

const LOCATION_SET_OPTIONS = {
  shouldDirty: true,
  shouldValidate: true,
} as const;

export function AreaFields({ currentUser, disabled, form }: AreaFieldsProps) {
  const locationLat = form.watch("locationLat");
  const locationLng = form.watch("locationLng");
  const cityLabel = currentUser?.city ?? "City not set";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <AddressAutocomplete
                label="City"
                placeholder="Search your city or area..."
                disabled={disabled}
                value={getSettingsProfileLocationValue({
                  city: field.value,
                  locationLat,
                  locationLng,
                })}
                onLocationSelect={(location) => {
                  field.onChange(location?.city ?? "");
                  setSettingsProfileCoordinates(form, location);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FactItem
        icon={MapPin}
        iconTone="teal"
        iconTileClassName="bg-primary/8"
        label="Current city"
        labelClassName="font-semibold"
        value={cityLabel}
        valueClassName="mt-1"
        className="min-h-10 items-start gap-3 border-border border-t pt-4 lg:mt-7 lg:items-center lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4"
      />
      <FormField
        control={form.control}
        name="locationLat"
        render={({ field }) => (
          <input type="hidden" value={field.value ?? ""} readOnly />
        )}
      />
      <FormField
        control={form.control}
        name="locationLng"
        render={({ field }) => (
          <input type="hidden" value={field.value ?? ""} readOnly />
        )}
      />
    </div>
  );
}

function getSettingsProfileLocationValue({
  city,
  locationLat,
  locationLng,
}: Pick<
  SettingsProfileValues,
  "city" | "locationLat" | "locationLng"
>): LocationValue | null {
  if (!city) {
    return null;
  }

  return {
    address: city,
    city,
    lat: locationLat,
    lng: locationLng,
  };
}

function setSettingsProfileCoordinates(
  form: UseFormReturn<SettingsProfileValues>,
  location: LocationValue | null,
) {
  const coordinates = getLocationCoordinates(location);

  form.setValue("locationLat", coordinates.lat, LOCATION_SET_OPTIONS);
  form.setValue("locationLng", coordinates.lng, LOCATION_SET_OPTIONS);
}

function getLocationCoordinates(location: LocationValue | null) {
  if (!location) {
    return { lat: null, lng: null };
  }

  return { lat: location.lat, lng: location.lng };
}
