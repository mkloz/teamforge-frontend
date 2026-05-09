import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthCommands } from "@/features/auth/api/auth-commands";
import { getEmailDomain } from "@/features/auth/lib/auth-telemetry";
import {
  type ForgotPasswordValues,
  forgotPasswordSchema,
} from "@/features/auth/schemas/auth-schemas";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export function useForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  async function submitResetLink(values: ForgotPasswordValues) {
    const emailDomain = getEmailDomain(values.email);

    setLoading(true);
    setRootError(null);
    setSuccessMessage(null);

    try {
      const result = await AuthCommands.sendResetPasswordLink(values.email);
      trackMutationOutcome(trackedMutationNames.authForgotPassword, "success", {
        emailDomain,
        requestId: result.requestId,
      });
      setSuccessMessage(
        "If that email belongs to a verified account, a reset link is on its way.",
      );
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
    loading,
    onSubmit,
    rootError,
    successMessage,
  };
}
