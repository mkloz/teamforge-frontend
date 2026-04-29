import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { AuthApi } from "../api/auth.api";
import { loginSchema, type LoginValues } from "../schemas/auth-schemas";

interface UseLoginFormOptions {
  onSuccess?: () => void;
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

  const onSubmit = useCallback(
    async (values: LoginValues) => {
      setRootError(null);
      setLoading(true);
      try {
        await AuthApi.loginWithEmail(values);
        onSuccess?.();
      } catch (error) {
        setRootError(
          AuthApi.getAuthErrorMessage(
            error,
            "Invalid email or password. Please try again.",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [onSuccess],
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((v) => !v);
  }, []);

  return {
    form,
    loading,
    rootError,
    showPassword,
    onSubmit,
    togglePasswordVisibility,
  };
}
