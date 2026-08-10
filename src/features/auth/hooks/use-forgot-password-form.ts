import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { AuthCommands } from "@/features/auth/api/auth-commands";
import { calculateForgotPasswordProgress } from "@/features/auth/lib/auth-form-progress";
import { getEmailDomain } from "@/features/auth/lib/auth-telemetry";
import {
  type ForgotPasswordValues,
  forgotPasswordSchema,
} from "@/features/auth/schemas/auth-schemas";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { showAppSuccessToast } from "@/shared/lib/app-toast";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export function useForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
    },
  });
  const emailValue = useWatch({ control: form.control, name: "email" });
  const progress = calculateForgotPasswordProgress({ email: emailValue });

  async function submitResetLink(values: ForgotPasswordValues) {
    const emailDomain = getEmailDomain(values.email);

    setRootError(null);
    if (
      guardOfflineAction({
        id: "auth-forgot-password-offline",
        description: "Reconnect before sending a reset link.",
      })
    ) {
      setRootError("You are offline. Reconnect before sending a reset link.");
      return;
    }

    setLoading(true);

    try {
      const result = await AuthCommands.sendResetPasswordLink(values.email);
      trackMutationOutcome(trackedMutationNames.authForgotPassword, "success", {
        emailDomain,
        requestId: result.requestId,
      });
      showAppSuccessToast("Reset link sent.", {
        description:
          "If that email belongs to a verified account, a reset link is on its way.",
        duration: 6000,
        id: "auth-forgot-password-link",
      });
      setLoading(false);
    } catch (error) {
      captureException(trackedMutationNames.authForgotPassword, error, {
        emailDomain,
      });
      trackMutationOutcome(trackedMutationNames.authForgotPassword, "error", {
        emailDomain,
      });
      setRootError(
        AuthCommands.getAuthErrorMessage(
          error,
          "We couldn't send a reset link right now. Please try again.",
        ),
      );
      setLoading(false);
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    void submitResetLink(values);
  });

  return {
    form,
    isOnline,
    loading,
    onSubmit,
    progress,
    rootError,
  };
}
