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
                className="h-11 px-3.5 rounded-xl border border-border bg-white font-sans text-sm text-ink placeholder:text-slate-muted/70 hover:border-forge-teal/40 focus-visible:border-forge-teal focus-visible:ring-2 focus-visible:ring-forge-teal/15 transition-all duration-200"
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
                className="h-11 px-3.5 rounded-xl border border-border bg-white font-sans text-sm text-ink placeholder:text-slate-muted/70 hover:border-forge-teal/40 focus-visible:border-forge-teal focus-visible:ring-2 focus-visible:ring-forge-teal/15 transition-all duration-200"
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
