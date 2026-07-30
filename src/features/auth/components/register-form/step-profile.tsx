import { ArrowLeft } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { RegisterValues } from "@/features/auth/schemas/auth-schemas";
import { ArrowRightAnimated } from "@/shared/components/common/arrow-right-animated";
import { AddressAutocomplete } from "@/shared/components/maps/address-autocomplete";
import { DateOfBirthField } from "@/shared/components/profile/date-of-birth-field";
import { GenderField } from "@/shared/components/profile/gender-field";
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
  loading: boolean;
  onNextIntent?: () => void;
}

export function StepProfile({
  onNext,
  onBack,
  isOnline,
  loading,
  onNextIntent,
}: StepProfileProps) {
  const { control } = useFormContext<RegisterValues>();

  return (
    <div className="flex flex-col gap-4">
      <DateOfBirthField control={control} name="dateOfBirth" />

      <GenderField control={control} name="gender" />

      <p className="text-center text-slate-muted text-xs">
        Your age is calculated automatically. Age and gender can appear on your
        profile.
      </p>

      <FormField
        control={control}
        name="city"
        render={({ field }) => (
          <FormItem className="gap-0">
            <FormControl>
              <AddressAutocomplete
                label="City"
                required
                hint="Coordinates help form nearby groups and stay private. You can change city visibility in Settings."
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
        disabled={loading || !isOnline}
        loading={loading}
        title={isOnline ? undefined : "Reconnect before creating your account."}
        size="lg"
        className="mt-4 w-full"
      >
        {isOnline ? "Continue" : "Reconnect to continue"}
        <ArrowRightAnimated />
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        disabled={loading}
        size="sm"
        className="text-slate-muted hover:bg-transparent hover:text-ink"
      >
        <ArrowLeft size={14} />
        Back
      </Button>
    </div>
  );
}
