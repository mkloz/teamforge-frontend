import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input, type InputProps } from "@/shared/components/ui/input";

import {
  authFormItemClassName,
  authFormLabelClassName,
  authFormMessageClassName,
} from "./auth-form-styles";

interface AuthTextFieldProps<TFieldValues extends FieldValues> {
  autoComplete?: InputProps["autoComplete"];
  control: Control<TFieldValues>;
  label: string;
  name: FieldPath<TFieldValues>;
  placeholder: string;
  type?: InputProps["type"];
}

export function AuthTextField<TFieldValues extends FieldValues>({
  autoComplete,
  control,
  label,
  name,
  placeholder,
  type = "text",
}: AuthTextFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={authFormItemClassName}>
          <FormLabel className={authFormLabelClassName}>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              type={type}
              autoComplete={autoComplete}
              {...field}
            />
          </FormControl>
          <FormMessage className={authFormMessageClassName} />
        </FormItem>
      )}
    />
  );
}
