import type { FormEventHandler } from "react";
import type { UseFormReturn } from "react-hook-form";

import { ArrowRightAnimated } from "@/shared/components/common/arrow-right-animated";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import type { ForgotPasswordValues } from "@/features/auth/schemas/auth-schemas";

interface ForgotPasswordFormProps {
  form: UseFormReturn<ForgotPasswordValues>;
  loading: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function ForgotPasswordForm({
  form,
  loading,
  onSubmit,
}: ForgotPasswordFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-0 text-left">
              <FormLabel className="font-sans text-sm font-semibold text-foreground">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-11 px-3.5 rounded-xl border border-border bg-background font-sans text-sm text-foreground placeholder:text-slate-muted/70 hover:border-forge-teal/40 focus-visible:border-forge-teal focus-visible:ring-2 focus-visible:ring-forge-teal/15 transition-all duration-200"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs font-medium text-destructive mt-1" />
            </FormItem>
          )}
        />

        <Button type="submit" loading={loading} size="lg" className="w-full">
          Send reset link
          <ArrowRightAnimated />
        </Button>
      </form>
    </Form>
  );
}
