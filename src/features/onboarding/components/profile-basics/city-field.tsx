import type { UseFormReturn } from "react-hook-form";

import { AddressAutocomplete } from "@/shared/components/maps/address-autocomplete";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form";
import type { ProfileBasicsValues } from "@/features/onboarding/schemas/profile-basics.schema";

interface CityFieldProps {
  form: UseFormReturn<ProfileBasicsValues>;
  watchedValues: Partial<ProfileBasicsValues>;
}

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
              hint="Exact point is used for matching only. Other members see your city."
              placeholder="Search your city or area..."
              value={
                field.value
                  ? {
                      address: field.value,
                      city: field.value,
                      lat: watchedValues.locationLat ?? null,
                      lng: watchedValues.locationLng ?? null,
                    }
                  : null
              }
              onLocationSelect={(location) => {
                field.onChange(location?.city ?? "");
                form.setValue("locationLat", location?.lat ?? null, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                form.setValue("locationLng", location?.lng ?? null, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />
          </FormControl>
          <FormMessage className="text-xs font-medium text-destructive" />
        </FormItem>
      )}
    />
  );
}
