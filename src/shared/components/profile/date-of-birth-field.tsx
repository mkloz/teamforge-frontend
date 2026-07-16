import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { DateInput } from "@/shared/components/ui/date-input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { getTodayDateOnly } from "@/shared/validators/date-of-birth.validator";

interface DateOfBirthFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  disabled?: boolean;
  name: FieldPath<TFieldValues>;
}

export function DateOfBirthField<TFieldValues extends FieldValues>({
  control,
  disabled,
  name,
}: DateOfBirthFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="gap-0">
          <FormLabel className="font-sans font-semibold text-ink text-sm">
            Date of birth
          </FormLabel>
          <FormControl>
            <DateInput
              required
              disabled={disabled}
              max={getTodayDateOnly()}
              placeholder="Select your date of birth"
              value={getDateInputValue(field.value)}
              onValueChange={field.onChange}
            />
          </FormControl>
          <p className="mt-1 text-slate-muted text-xs leading-relaxed">
            We use your date of birth to confirm age eligibility, then discard
            the date. It is never shown on your profile.
          </p>
          <FormMessage className="font-medium text-destructive text-xs" />
        </FormItem>
      )}
    />
  );
}

function getDateInputValue(value: unknown) {
  return typeof value === "string" ? value : "";
}
