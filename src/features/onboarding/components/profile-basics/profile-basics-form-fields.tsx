import { AddressAutocomplete } from "@/shared/components/maps/address-autocomplete";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
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
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="22"
                  className="h-11 rounded-xl bg-white"
                  {...field}
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
                  <SelectTrigger className="h-11 rounded-xl bg-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent
                  position="popper"
                  className="rounded-xl border-border bg-white shadow-lg shadow-black/5"
                >
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="rounded-lg"
                    >
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
