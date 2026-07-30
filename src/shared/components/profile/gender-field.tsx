import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
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

interface GenderFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
}

export function GenderField<TFieldValues extends FieldValues>({
  control,
  name,
}: GenderFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="content-start gap-2">
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
  );
}

function getSelectValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}
