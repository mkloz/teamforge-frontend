import { lazy, type ReactNode, Suspense } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { DatePickerBoundary } from "@/shared/components/ui/date-time-picker/date-picker-boundary";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { getTodayDateOnly } from "@/shared/validators/date-of-birth.validator";

const AccessibleDateInput = lazy(() =>
  import("@/shared/components/ui/accessible-date-input").then((module) => ({
    default: module.AccessibleDateInput,
  })),
);

interface DateOfBirthFieldProps<TFieldValues extends FieldValues> {
  action?: ReactNode;
  control: Control<TFieldValues>;
  disabled?: boolean;
  name: FieldPath<TFieldValues>;
}

export function DateOfBirthField<TFieldValues extends FieldValues>({
  action,
  control,
  disabled,
  name,
}: DateOfBirthFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = getDateInputValue(field.value);
        const nativeFallback = (
          <FormControl>
            <Input
              type="date"
              required
              aria-label="Date of birth"
              disabled={disabled}
              max={getTodayDateOnly()}
              value={value}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(event.currentTarget.value)}
            />
          </FormControl>
        );

        return (
          <FormItem className="gap-2">
            <FormLabel className="font-sans font-semibold text-ink text-sm">
              Date of birth
            </FormLabel>
            <div
              className={
                action ? "main-action-grid grid items-center gap-2" : undefined
              }
            >
              <DatePickerBoundary fallback={nativeFallback}>
                <Suspense fallback={nativeFallback}>
                  <FormControl>
                    <AccessibleDateInput
                      required
                      aria-label="Date of birth"
                      disabled={disabled}
                      max={getTodayDateOnly()}
                      placeholder="Select your date of birth"
                      value={value}
                      onBlur={field.onBlur}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                </Suspense>
              </DatePickerBoundary>
              {action}
            </div>
            <p className="text-slate-muted text-xs leading-relaxed">
              We use your date of birth to confirm age eligibility, then discard
              the date. It is never shown on your profile.
            </p>
            <FormMessage className="font-medium text-destructive text-xs" />
          </FormItem>
        );
      }}
    />
  );
}

function getDateInputValue(value: unknown) {
  return typeof value === "string" ? value : "";
}
