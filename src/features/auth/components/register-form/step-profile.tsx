import { ArrowLeft } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { ArrowRightAnimated } from "@/shared/components/common/arrow-right-animated";
import { AddressAutocomplete } from "@/shared/components/maps/address-autocomplete";
import { Button } from "@/shared/components/ui/button";
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
import type { RegisterValues } from "@/features/auth/schemas/auth-schemas";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NON_BINARY", label: "Non-binary" },
  { value: "OTHER", label: "Prefer not to say" },
] as const;

interface StepProfileProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepProfile({ onNext, onBack }: StepProfileProps) {
  const { control } = useFormContext<RegisterValues>();

  return (
    <div className="flex flex-col gap-4">
      {/* Age and Gender Row */}
      <div className="flex flex-row gap-4 w-full">
        {/* Age */}
        <div className="flex-1">
          <FormField
            control={control}
            name="age"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel className="font-sans text-sm font-semibold text-ink">
                  Age
                </FormLabel>
                <FormControl>
                  <NumberInput
                    placeholder="22"
                    value={field.value ?? ""}
                    min={16}
                    max={99}
                    onNumberChange={field.onChange}
                  />
                </FormControl>
                <FormMessage className="text-xs font-medium text-destructive" />
              </FormItem>
            )}
          />
        </div>

        {/* Gender */}
        <div className="flex-1">
          <FormField
            control={control}
            name="gender"
            render={({ field }) => (
              <FormItem className="space-y-0 flex flex-col justify-start">
                <FormLabel className="font-sans text-sm font-semibold text-ink">
                  Gender
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                <FormMessage className="text-xs font-medium text-destructive" />
              </FormItem>
            )}
          />
        </div>
      </div>

      <p className="text-xs text-slate-muted mt-0 text-center">
        We only show this on your profile; it doesn't affect your matching.
      </p>

      {/* City full-width */}
      <FormField
        control={control}
        name="city"
        render={({ field }) => (
          <FormItem className="space-y-0">
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
                        lat: null,
                        lng: null,
                        placeId: null,
                      }
                    : null
                }
                onLocationSelect={(location) => {
                  field.onChange(location?.city ?? "");
                }}
              />
            </FormControl>
            <FormMessage className="text-xs font-medium text-destructive" />
          </FormItem>
        )}
      />

      <Button type="button" onClick={onNext} size="lg" className="w-full mt-4">
        Looks good
        <ArrowRightAnimated />
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        size="sm"
        className="text-slate-muted hover:text-ink hover:bg-transparent"
      >
        <ArrowLeft size={14} />
        Wait, go back
      </Button>
    </div>
  );
}
