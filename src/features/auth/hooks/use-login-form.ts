import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import { AuthCommands } from "@/features/auth/api/auth-commands";
import {
  loginSchema,
  type LoginValues,
} from "@/features/auth/schemas/auth-schemas";

interface UseLoginFormOptions {
  onSuccess?: () => void | Promise<void>;
  onProgress?: (progress: number) => void;
}

const FIELD_MIN_LENGTH = 3;

export function useLoginForm({ onSuccess, onProgress }: UseLoginFormOptions) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = useWatch({ control: form.control, name: "email" });
  const passwordValue = useWatch({ control: form.control, name: "password" });

  useEffect(() => {
    if (!onProgress) return;
    let p = 0;
    if (emailValue && emailValue.length > FIELD_MIN_LENGTH) p += 0.5;
    if (passwordValue && passwordValue.length > FIELD_MIN_LENGTH) p += 0.5;
    onProgress(p);
  }, [emailValue, passwordValue, onProgress]);

  async function onSubmit(values: LoginValues) {
    setRootError(null);
    setLoading(true);

    try {
      const result = await AuthCommands.loginWithEmail(values);
      trackMutationOutcome(trackedMutationNames.authLoginEmail, "success", {
        requestId: result.requestId,
      });
      await onSuccess?.();
    } catch (error) {
      captureException(trackedMutationNames.authLoginEmail, error, {
        emailDomain: values.email.split("@")[1] ?? "unknown",
      });
      trackMutationOutcome(trackedMutationNames.authLoginEmail, "error", {
        emailDomain: values.email.split("@")[1] ?? "unknown",
      });
      setRootError(
        AuthCommands.getAuthErrorMessage(
          error,
          "Invalid email or password. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  function togglePasswordVisibility() {
    setShowPassword((v) => !v);
  }

  return {
    form,
    loading,
    rootError,
    showPassword,
    onSubmit,
    togglePasswordVisibility,
  };
}
