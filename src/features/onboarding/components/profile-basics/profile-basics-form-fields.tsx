import { AddressAutocomplete } from "@/shared/components/maps/address-autocomplete";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { NumberInput } from "@/shared/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { ProfileBasicsValues } from "@/features/onboarding/schemas/profile-basics.schema";
import type { UseFormReturn } from "react-hook-form";

import { GENDER_OPTIONS } from "./profile-basics-options";

interface ProfileBasicsFormFieldsProps {
  form: UseFormReturn<ProfileBasicsValues>;
  watchedValues: Partial<ProfileBasicsValues>;
}

export function ProfileBasicsFormFields({
  form,
  watchedValues,
}: ProfileBasicsFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-ink">
                Age
              </FormLabel>
              <FormControl>
                <NumberInput
                  placeholder="22"
                  value={field.value ?? ""}
                  min={16}
                  max={99}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormMessage className="text-xs font-medium" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-ink">
                Gender
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-xs font-medium" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <AddressAutocomplete
                label="City"
                required
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
            <FormMessage className="text-xs font-medium" />
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
    </>
  );
}
