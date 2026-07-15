import type { UseFormReturn } from "react-hook-form";
import type { ProfileBasicsValues } from "@/features/onboarding/schemas/profile-basics.schema";
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

interface CityFieldProps {
  form: UseFormReturn<ProfileBasicsValues>;
  watchedValues: Partial<ProfileBasicsValues>;
}

const LOCATION_SET_OPTIONS = {
  shouldDirty: true,
  shouldValidate: true,
} as const;

export function CityField({ form, watchedValues }: CityFieldProps) {
  return (
    <FormField
      control={form.control}
      name="city"
      render={({ field }) => (
        <FormItem className="gap-0">
          <FormControl>
            <AddressAutocomplete
              label="City"
              required
              hint="Coordinates help form nearby groups and stay private. You can change city visibility in Settings."
              placeholder="Search your city or area..."
              value={getProfileBasicsLocationValue(field.value, watchedValues)}
              onLocationSelect={(location) => {
                field.onChange(location?.city ?? "");
                setProfileBasicsCoordinates(form, location);
              }}
            />
          </FormControl>
          <FormMessage className="font-medium text-destructive text-xs" />
        </FormItem>
      )}
    />
  );
}

function getProfileBasicsLocationValue(
  city: string,
  values: Partial<ProfileBasicsValues>,
): LocationValue | null {
  if (!city) {
    return null;
  }

  return {
    address: city,
    city,
    lat: values.locationLat ?? null,
    lng: values.locationLng ?? null,
  };
}

function setProfileBasicsCoordinates(
  form: UseFormReturn<ProfileBasicsValues>,
  location: LocationValue | null,
) {
  form.setValue("locationLat", location?.lat ?? null, LOCATION_SET_OPTIONS);
  form.setValue("locationLng", location?.lng ?? null, LOCATION_SET_OPTIONS);
}
