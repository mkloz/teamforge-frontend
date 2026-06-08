import type { FormEventHandler } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ResetPasswordValues } from "@/features/auth/schemas/auth-schemas";
import { ArrowRightAnimated } from "@/shared/components/common/arrow-right-animated";
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";

import { ResetPasswordField } from "./reset-password-field";

interface ResetPasswordFormProps {
  form: UseFormReturn<ResetPasswordValues>;
  isOnline: boolean;
  loading: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function ResetPasswordForm({
  form,
  isOnline,
  loading,
  onSubmit,
}: ResetPasswordFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <ResetPasswordField name="password" label="New password" />
        <ResetPasswordField name="confirmPassword" label="Confirm password" />

        <Button
          type="submit"
          disabled={!isOnline}
          loading={loading}
          title={isOnline ? undefined : "Reconnect before resetting password."}
          size="lg"
          className="w-full"
        >
          {isOnline ? "Save new password" : "Reconnect to continue"}
          <ArrowRightAnimated />
        </Button>
      </form>
    </Form>
  );
}
