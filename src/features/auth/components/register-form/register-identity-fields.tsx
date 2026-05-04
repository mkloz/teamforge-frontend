import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import type { RegisterValues } from "@/features/auth/schemas/auth-schemas";

export function RegisterIdentityFields() {
  const { control } = useFormContext<RegisterValues>();

  return (
    <>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem className="space-y-0">
            <FormLabel className="font-sans text-sm font-semibold text-ink">
              Full Name
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Alex Johnson"
                autoComplete="name"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs font-medium text-destructive" />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem className="space-y-0">
            <FormLabel className="font-sans text-sm font-semibold text-ink">
              Email
            </FormLabel>
            <FormControl>
              <Input
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs font-medium text-destructive" />
          </FormItem>
        )}
      />
    </>
  );
}
