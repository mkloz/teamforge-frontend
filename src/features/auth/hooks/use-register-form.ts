import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import { AuthCommands } from "@/features/auth/api/auth-commands";
import {
  registerSchema,
  type RegisterValues,
} from "@/features/auth/schemas/auth-schemas";

interface UseRegisterFormOptions {
  onSuccess?: () => void | Promise<void>;
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
  const [resendLoading, setResendLoading] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

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
    if (
      values.age !== undefined &&
      values.age !== null &&
      String(values.age) !== ""
    )
      filled++;
    if (values.city && values.city.length > 2) filled++;
    if (values.gender && values.gender.length > 1) filled++;

    onProgress(Math.min(filled / TOTAL_REQUIRED_FIELDS, 1));
  }, [values, onProgress]);

  // Step transitions
  async function goToStep2() {
    setRootError(null);
    const isValid = await form.trigger(["name", "email", "password"]);
    if (isValid) {
      setDirection(1);
      setStep(2);
    }
  }

  async function goToStep3() {
    setRootError(null);
    const isValid = await form.trigger(["age", "city", "gender"]);
    if (!isValid) {
      return;
    }

    setLoading(true);

    try {
      const result = await AuthCommands.registerWithEmail(form.getValues());
      trackMutationOutcome(trackedMutationNames.authRegisterEmail, "success", {
        requestId: result.requestId,
      });
      setOtpMessage(
        `We sent a 6-digit verification code to ${form.getValues("email")}.`,
      );
      setDirection(1);
      setStep(3);
    } catch (error) {
      captureException(trackedMutationNames.authRegisterEmail, error, {
        emailDomain: form.getValues("email").split("@")[1] ?? "unknown",
      });
      trackMutationOutcome(trackedMutationNames.authRegisterEmail, "error");
      setRootError(
        AuthCommands.getAuthErrorMessage(
          error,
          "We couldn't start your verification step. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  function goBackToStep1() {
    setRootError(null);
    setDirection(-1);
    setStep(1);
  }

  function goBackToStep2() {
    setRootError(null);
    setDirection(-1);
    setStep(2);
  }

  async function onSubmit(formValues: RegisterValues) {
    const isValid = await form.trigger(["otp"]);
    if (!isValid) return;

    setRootError(null);
    setLoading(true);
    try {
      const result = await AuthCommands.verifyEmailOtp(formValues);
      trackMutationOutcome(trackedMutationNames.authVerifyEmailOtp, "success", {
        requestId: result.requestId,
      });
      await onSuccess?.();
    } catch (error) {
      captureException(trackedMutationNames.authVerifyEmailOtp, error);
      trackMutationOutcome(trackedMutationNames.authVerifyEmailOtp, "error");
      setRootError(
        AuthCommands.getAuthErrorMessage(
          error,
          "We couldn't verify that code. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    const email = form.getValues("email");

    setRootError(null);
    setOtpMessage(null);
    setResendLoading(true);

    try {
      const result = await AuthCommands.resendEmailOtp(email);
      trackMutationOutcome(trackedMutationNames.authResendEmailOtp, "success", {
        requestId: result.requestId,
      });
      setOtpMessage(`A fresh verification code is on its way to ${email}.`);
    } catch (error) {
      captureException(trackedMutationNames.authResendEmailOtp, error, {
        emailDomain: email.split("@")[1] ?? "unknown",
      });
      trackMutationOutcome(trackedMutationNames.authResendEmailOtp, "error");
      setRootError(
        AuthCommands.getAuthErrorMessage(
          error,
          "We couldn't resend the verification code. Please try again.",
        ),
      );
    } finally {
      setResendLoading(false);
    }
  }

  return {
    form,
    step,
    direction,
    loading,
    resendLoading,
    rootError,
    otpMessage,
    goToStep2,
    goToStep3,
    goBackToStep1,
    goBackToStep2,
    onSubmit,
    resendOtp,
  };
}
