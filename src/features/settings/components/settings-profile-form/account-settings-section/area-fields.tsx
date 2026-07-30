import type { UseFormReturn } from "react-hook-form";
import type { SettingsProfileValues } from "@/features/settings/schemas/settings-profile.schema";
import {
  AddressAutocomplete,
  type LocationValue,
} from "@/shared/components/maps/address-autocomplete";
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
  const currentLocation = getSettingsProfileLocationValue({
    city: form.watch("city"),
    locationLat,
    locationLng,
  });
  const savedLocation = getSavedSettingsProfileLocation(currentUser);
  const hasEditedLocation = !areLocationsEqual(currentLocation, savedLocation);

  return (
    <div>
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
                badge={
                  hasEditedLocation && savedLocation
                    ? savedLocation.city
                    : "Location use"
                }
                badgeAction={
                  hasEditedLocation && savedLocation
                    ? {
                        ariaLabel: `Reset location to ${savedLocation.city}`,
                        onClick: () => {
                          field.onChange(savedLocation.city);
                          setSettingsProfileCoordinates(form, savedLocation);
                        },
                      }
                    : undefined
                }
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

function getSavedSettingsProfileLocation(
  currentUser: User | undefined,
): LocationValue | null {
  if (!currentUser?.city) {
    return null;
  }

  return {
    address: currentUser.city,
    city: currentUser.city,
    lat: currentUser.locationLat ?? null,
    lng: currentUser.locationLng ?? null,
  };
}

function areLocationsEqual(
  firstLocation: LocationValue | null,
  secondLocation: LocationValue | null,
) {
  return (
    firstLocation?.city === secondLocation?.city &&
    firstLocation?.lat === secondLocation?.lat &&
    firstLocation?.lng === secondLocation?.lng
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
