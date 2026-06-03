import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthCommands } from "@/features/auth/api/auth-commands";
import {
  type ResetPasswordValues,
  resetPasswordSchema,
} from "@/features/auth/schemas/auth-schemas";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { showAppSuccessToast } from "@/shared/lib/app-toast";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export function useResetPasswordForm() {
  const { token } = useParams({ from: "/auth/reset-password/$token" });
  const [loading, setLoading] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

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
    setRootError(null);
    setSuccess(false);
    if (
      guardOfflineAction({
        id: "auth-reset-password-offline",
        description: "Reconnect before resetting your password.",
      })
    ) {
      setRootError(
        "You are offline. Reconnect before resetting your password.",
      );
      return;
    }

    setLoading(true);

    try {
      const result = await AuthCommands.resetPassword(token, values.password);
      trackMutationOutcome(trackedMutationNames.authResetPassword, "success", {
        requestId: result.requestId,
      });
      setSuccess(true);
      showAppSuccessToast("Password updated.", {
        description: "You can sign in with the new password now.",
        id: "auth-reset-password",
      });
      setLoading(false);
    } catch (error) {
      captureException(trackedMutationNames.authResetPassword, error);
      trackMutationOutcome(trackedMutationNames.authResetPassword, "error");
      setRootError(
        AuthCommands.getAuthErrorMessage(
          error,
          "We couldn't reset your password. Your link may have expired.",
        ),
      );
      setLoading(false);
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    void submitPasswordReset(values);
  });

  return {
    form,
    isOnline,
    loading,
    onSubmit,
    rootError,
    success,
  };
}
