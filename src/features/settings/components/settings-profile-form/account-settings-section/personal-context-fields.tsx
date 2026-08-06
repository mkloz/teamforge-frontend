import type { UseFormReturn } from "react-hook-form";
import type { SettingsProfileValues } from "@/features/settings/schemas/settings-profile.schema";
import { unspecifiedGenderValue } from "@/features/settings/schemas/settings-profile.schema";
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
import { GENDER_OPTIONS } from "./account-settings-constants";

interface PersonalContextFieldsProps {
  compatibilityInputsDisabled: boolean;
  form: UseFormReturn<SettingsProfileValues>;
}

function getGenderLabel(value: SettingsProfileValues["gender"]) {
  if (value === unspecifiedGenderValue) {
    return "Prefer not to say";
  }

  return GENDER_OPTIONS.find((option) => option.value === value)?.label;
}

export function PersonalContextFields({
  compatibilityInputsDisabled,
  form,
}: PersonalContextFieldsProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField
        control={form.control}
        name="age"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Age</FormLabel>
            <FormControl>
              <NumberInput
                value={field.value ?? ""}
                min={18}
                max={99}
                disabled={compatibilityInputsDisabled}
                placeholder="24"
                onValueChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Gender</FormLabel>
            <Select
              value={field.value}
              disabled={compatibilityInputsDisabled}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger className="data-[placeholder]:text-slate-muted">
                  <SelectValue placeholder="Select gender">
                    {getGenderLabel(field.value)}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={unspecifiedGenderValue}>
                  Prefer not to say
                </SelectItem>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
