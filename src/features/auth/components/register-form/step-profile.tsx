import { ArrowLeft } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { RegisterValues } from "@/features/auth/schemas/auth-schemas";
import { ArrowRightAnimated } from "@/shared/components/common/arrow-right-animated";
import { AddressAutocomplete } from "@/shared/components/maps/address-autocomplete";
import { AgeGenderFields } from "@/shared/components/profile/age-gender-fields";
import { Button } from "@/shared/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form";

interface StepProfileProps {
  onNext: () => void;
  onBack: () => void;
  isOnline: boolean;
  onNextIntent?: () => void;
}

export function StepProfile({
  onNext,
  onBack,
  isOnline,
  onNextIntent,
}: StepProfileProps) {
  const { control } = useFormContext<RegisterValues>();

  return (
    <div className="flex flex-col gap-4">
      <AgeGenderFields
        ageName="age"
        ageValueMode="number"
        control={control}
        genderName="gender"
      />

      <FormField
        control={control}
        name="city"
        render={({ field }) => (
          <FormItem className="gap-0">
            <FormControl>
              <AddressAutocomplete
                label="City"
                required
                hint="Exact point is used for group fit only. Other members see your city."
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
            <FormMessage className="font-medium text-destructive text-xs" />
          </FormItem>
        )}
      />

      <Button
        type="button"
        onClick={onNext}
        onFocus={onNextIntent}
        onPointerEnter={onNextIntent}
        disabled={!isOnline}
        title={isOnline ? undefined : "Reconnect before creating your account."}
        size="lg"
        className="mt-4 w-full"
      >
        {isOnline ? "Looks good" : "Reconnect to continue"}
        <ArrowRightAnimated />
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        size="sm"
        className="text-slate-muted hover:bg-transparent hover:text-ink"
      >
        <ArrowLeft size={14} />
        Wait, go back
      </Button>
    </div>
  );
}
