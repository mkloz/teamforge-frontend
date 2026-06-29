import type { Control, FieldPath, FieldValues } from "react-hook-form";
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

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NON_BINARY", label: "Non-binary" },
  { value: "OTHER", label: "Prefer not to say" },
] as const;

type AgeValueMode = "number" | "string";

interface AgeGenderFieldsProps<TFieldValues extends FieldValues> {
  ageName: FieldPath<TFieldValues>;
  ageValueMode: AgeValueMode;
  control: Control<TFieldValues>;
  genderName: FieldPath<TFieldValues>;
}

export function AgeGenderFields<TFieldValues extends FieldValues>({
  ageName,
  ageValueMode,
  control,
  genderName,
}: AgeGenderFieldsProps<TFieldValues>) {
  return (
    <>
      <div className="flex w-full flex-row gap-4">
        <FormField
          control={control}
          name={ageName}
          render={({ field }) => (
            <FormItem className="flex-1 gap-0">
              <FormLabel className="font-sans font-semibold text-ink text-sm">
                Age
              </FormLabel>
              <FormControl>
                <NumberInput
                  placeholder="22"
                  value={getNumberInputValue(field.value)}
                  min={16}
                  max={99}
                  {...getAgeChangeProps(ageValueMode, field.onChange)}
                />
              </FormControl>
              <FormMessage className="font-medium text-destructive text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={genderName}
          render={({ field }) => (
            <FormItem className="flex flex-1 flex-col justify-start gap-0">
              <FormLabel className="font-sans font-semibold text-ink text-sm">
                Gender
              </FormLabel>
              <Select
                name={field.name}
                onValueChange={field.onChange}
                value={getSelectValue(field.value)}
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
              <FormMessage className="font-medium text-destructive text-xs" />
            </FormItem>
          )}
        />
      </div>

      <p className="mt-0 text-center text-slate-muted text-xs">
        We only show this on your profile; it doesn't affect your group fit.
      </p>
    </>
  );
}

function getAgeChangeProps(
  mode: AgeValueMode,
  onChange: (...event: unknown[]) => void,
) {
  return mode === "number"
    ? { onNumberChange: onChange }
    : { onValueChange: onChange };
}

function getNumberInputValue(value: unknown) {
  return typeof value === "number" || typeof value === "string" ? value : "";
}

function getSelectValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}
