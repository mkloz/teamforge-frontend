import { useFormContext } from "react-hook-form";
import type { RegisterValues } from "@/features/auth/schemas/auth-schemas";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
  authFormItemClassName,
  authFormLabelClassName,
  authFormMessageClassName,
} from "../auth-form-styles";

export function RegisterIdentityFields() {
  const { control } = useFormContext<RegisterValues>();

  return (
    <>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem className={authFormItemClassName}>
            <FormLabel className={authFormLabelClassName}>Full Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Alex Johnson"
                autoComplete="name"
                {...field}
              />
            </FormControl>
            <FormMessage className={authFormMessageClassName} />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem className={authFormItemClassName}>
            <FormLabel className={authFormLabelClassName}>Email</FormLabel>
            <FormControl>
              <Input
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                {...field}
              />
            </FormControl>
            <FormMessage className={authFormMessageClassName} />
          </FormItem>
        )}
      />
    </>
  );
}
