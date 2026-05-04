import type { SettingsProfileValues } from "@/features/settings/schemas/settings-profile.schema";
import { AddressAutocomplete } from "@/shared/components/maps/address-autocomplete";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form";
import type { User } from "@/shared/schemas";
import { MapPin } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

interface AreaFieldsProps {
  currentUser: User | undefined;
  form: UseFormReturn<SettingsProfileValues>;
}

export function AreaFields({ currentUser, form }: AreaFieldsProps) {
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
                value={
                  field.value
                    ? {
                        address: field.value,
                        city: field.value,
                        lat: locationLat,
                        lng: locationLng,
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
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex min-h-10 gap-3 border-t border-border pt-4 lg:mt-7 lg:items-center lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-forge-teal/8 text-forge-teal">
          <MapPin size={16} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-muted">
            Current city
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">{cityLabel}</p>
        </div>
      </div>
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
