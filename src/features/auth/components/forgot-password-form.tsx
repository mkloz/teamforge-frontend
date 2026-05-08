import type { FormEventHandler } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ForgotPasswordValues } from "@/features/auth/schemas/auth-schemas";
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
                  {...field}
                />
              </FormControl>
              <FormMessage className="mt-1 text-xs font-medium text-destructive" />
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
