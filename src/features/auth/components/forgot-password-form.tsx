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
import {
  authFormItemClassName,
  authFormLabelClassName,
  authFormMessageClassName,
} from "./auth-form-styles";

interface ForgotPasswordFormProps {
  form: UseFormReturn<ForgotPasswordValues>;
  isOnline: boolean;
  loading: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function ForgotPasswordForm({
  form,
  isOnline,
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
            <FormItem className={authFormItemClassName}>
              <FormLabel className={authFormLabelClassName}>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage className={authFormMessageClassName} />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={!isOnline}
          loading={loading}
          title={
            isOnline ? undefined : "Reconnect before sending a reset link."
          }
          size="lg"
          className="w-full"
        >
          {isOnline ? "Send reset link" : "Reconnect to continue"}
          <ArrowRightAnimated />
        </Button>
      </form>
    </Form>
  );
}
