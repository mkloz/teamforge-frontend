import type { FormEventHandler } from "react";
import type { UseFormReturn } from "react-hook-form";

import { ArrowRightAnimated } from "@/shared/components/common/arrow-right-animated";
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import type { ResetPasswordValues } from "@/features/auth/schemas/auth-schemas";

import { ResetPasswordField } from "./reset-password-field";

interface ResetPasswordFormProps {
  form: UseFormReturn<ResetPasswordValues>;
  loading: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function ResetPasswordForm({
  form,
  loading,
  onSubmit,
}: ResetPasswordFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <ResetPasswordField name="password" label="New password" />
        <ResetPasswordField name="confirmPassword" label="Confirm password" />

        <Button type="submit" loading={loading} size="lg" className="w-full">
          Save new password
          <ArrowRightAnimated />
        </Button>
      </form>
    </Form>
  );
}
