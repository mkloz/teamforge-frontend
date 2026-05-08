import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthCommands } from "@/features/auth/api/auth-commands";
import {
  type ResetPasswordValues,
  resetPasswordSchema,
} from "@/features/auth/schemas/auth-schemas";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export function useResetPasswordForm() {
  const { token } = useParams({ from: "/auth/reset-password/$token" });
  const [loading, setLoading] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function submitPasswordReset(values: ResetPasswordValues) {
    setLoading(true);
    setRootError(null);
    setSuccess(false);

    try {
      const result = await AuthCommands.resetPassword(token, values.password);
      trackMutationOutcome(trackedMutationNames.authResetPassword, "success", {
        requestId: result.requestId,
      });
      setSuccess(true);
    } catch (error) {
      captureException(trackedMutationNames.authResetPassword, error);
      trackMutationOutcome(trackedMutationNames.authResetPassword, "error");
      setRootError(
        AuthCommands.getAuthErrorMessage(
          error,
          "We couldn't reset your password. Your link may have expired.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    void submitPasswordReset(values);
  });

  return {
    form,
    loading,
    onSubmit,
    rootError,
    success,
  };
}
