import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { registerSchema, type RegisterValues } from "../schemas/auth-schemas";

interface UseRegisterFormOptions {
  onSuccess?: () => void;
  onProgress?: (progress: number) => void;
}

export type Step = 1 | 2 | 3;

/** Total required fields for progress calculation. */
const TOTAL_REQUIRED_FIELDS = 7;

export function useRegisterForm({
  onSuccess,
  onProgress,
}: UseRegisterFormOptions) {
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      otp: "",
      age: 21,
      city: "",
      gender: "",
    },
  });

  const values = useWatch({ control: form.control });

  // Progress tracking
  useEffect(() => {
    if (!onProgress) return;
    let filled = 0;
    if (values.name && values.name.length > 2) filled++;
    if (values.email && values.email.length > 4) filled++;
    if (values.password && values.password.length > 5) filled++;
    if (values.otp && values.otp.length === 6) filled++;
    if (values.age && values.age !== ("" as unknown as number)) filled++;
    if (values.city && values.city.length > 2) filled++;
    if (values.gender && values.gender.length > 1) filled++;

    onProgress(Math.min(filled / TOTAL_REQUIRED_FIELDS, 1));
  }, [values, onProgress]);

  // Step transitions
  const goToStep2 = useCallback(async () => {
    const isValid = await form.trigger(["name", "email", "password"]);
    if (isValid) {
      setDirection(1);
      setStep(2);
    }
  }, [form]);

  const goToStep3 = useCallback(async () => {
    const isValid = await form.trigger(["age", "city", "gender"]);
    if (isValid) {
      setDirection(1);
      setStep(3);
    }
  }, [form]);

  const goBackToStep1 = useCallback(() => {
    setDirection(-1);
    setStep(1);
  }, []);

  const goBackToStep2 = useCallback(() => {
    setDirection(-1);
    setStep(2);
  }, []);

  const onSubmit = useCallback(
    async (formValues: RegisterValues) => {
      const isValid = await form.trigger(["otp"]);
      if (!isValid) return;

      setLoading(true);
      try {
        // TODO: Integrate with apiClient from @/shared/api/api
        await new Promise((r) => setTimeout(r, 1800));
        console.log("Registration complete", formValues);
        onSuccess?.();
      } catch (error) {
        console.error("Registration failed", error);
      } finally {
        setLoading(false);
      }
    },
    [form, onSuccess],
  );

  return {
    form,
    step,
    direction,
    loading,
    goToStep2,
    goToStep3,
    goBackToStep1,
    goBackToStep2,
    onSubmit,
  };
}
