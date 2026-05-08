import type { UseFormReturn } from "react-hook-form";
import type { ProfileBasicsValues } from "@/features/onboarding/schemas/profile-basics.schema";
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

import { GENDER_OPTIONS } from "./profile-basics-options";

interface AgeGenderFieldsProps {
  form: UseFormReturn<ProfileBasicsValues>;
}

export function AgeGenderFields({ form }: AgeGenderFieldsProps) {
  return (
    <>
      <div className="flex w-full flex-row gap-4">
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem className="flex-1 gap-0">
              <FormLabel className="font-sans font-semibold text-ink text-sm">
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
              <FormMessage className="font-medium text-destructive text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem className="flex flex-1 flex-col justify-start gap-0">
              <FormLabel className="font-sans font-semibold text-ink text-sm">
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
              <FormMessage className="font-medium text-destructive text-xs" />
            </FormItem>
          )}
        />
      </div>

      <p className="mt-0 text-center text-slate-muted text-xs">
        We only show this on your profile; it doesn't affect your matching.
      </p>
    </>
  );
}
