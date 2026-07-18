import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { AuthCommands } from "@/features/auth/api/auth-commands";
import { calculateLoginProgress } from "@/features/auth/lib/auth-form-progress";
import { getEmailDomain } from "@/features/auth/lib/auth-telemetry";
import {
  type LoginValues,
  loginSchema,
} from "@/features/auth/schemas/auth-schemas";
import { isApiNetworkError } from "@/shared/api/api-network-error";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

interface UseLoginFormOptions {
  onSuccess?: () => void | Promise<void>;
  onProgress?: (progress: number) => void;
}

async function runOptionalSuccessCallback(
  callback?: () => void | Promise<void>,
) {
  if (callback) {
    await callback();
  }
}

export function useLoginForm({ onSuccess, onProgress }: UseLoginFormOptions) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = useWatch({ control: form.control, name: "email" });
  const passwordValue = useWatch({ control: form.control, name: "password" });

  useEffect(() => {
    onProgress?.(
      calculateLoginProgress({
        email: emailValue,
        password: passwordValue,
      }),
    );
  }, [emailValue, passwordValue, onProgress]);

  async function onSubmit(values: LoginValues) {
    const emailDomain = getEmailDomain(values.email);

    setRootError(null);
    if (
      guardOfflineAction({
        id: "auth-login-offline",
        description: "Reconnect before signing in.",
      })
    ) {
      setRootError("You are offline. Reconnect before signing in.");
      return;
    }

    setLoading(true);

    try {
      const result = await AuthCommands.loginWithEmail(values);
      trackMutationOutcome(trackedMutationNames.authLoginEmail, "success", {
        requestId: result.requestId,
      });
      await runOptionalSuccessCallback(onSuccess);
      setLoading(false);
    } catch (error) {
      captureException(trackedMutationNames.authLoginEmail, error, {
        emailDomain,
      });
      trackMutationOutcome(trackedMutationNames.authLoginEmail, "error", {
        emailDomain,
      });
      setRootError(
        isApiNetworkError(error)
          ? "TeamForge couldn't connect. Check your connection and try again."
          : AuthCommands.getAuthErrorMessage(
              error,
              "Invalid email or password. Please try again.",
            ),
      );
      setLoading(false);
    }
  }

  function togglePasswordVisibility() {
    setShowPassword((v) => !v);
  }

  return {
    form,
    loading,
    isOnline,
    rootError,
    showPassword,
    onSubmit,
    togglePasswordVisibility,
  };
}
