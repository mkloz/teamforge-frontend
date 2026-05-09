import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { AuthCommands } from "@/features/auth/api/auth-commands";
import { calculateRegisterProgress } from "@/features/auth/lib/auth-form-progress";
import { getEmailDomain } from "@/features/auth/lib/auth-telemetry";
import {
  type RegisterValues,
  registerSchema,
} from "@/features/auth/schemas/auth-schemas";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

interface UseRegisterFormOptions {
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

export type Step = 1 | 2 | 3;

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
    mode: "onChange",
    reValidateMode: "onChange",
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

  useEffect(() => {
    onProgress?.(calculateRegisterProgress(values));
  }, [values, onProgress]);

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
      const email = form.getValues("email");
      const result = await AuthCommands.registerWithEmail(form.getValues());
      trackMutationOutcome(trackedMutationNames.authRegisterEmail, "success", {
        requestId: result.requestId,
      });
      setOtpMessage(`We sent a 6-digit verification code to ${email}.`);
      setDirection(1);
      setStep(3);
      setLoading(false);
    } catch (error) {
      captureException(trackedMutationNames.authRegisterEmail, error, {
        emailDomain: getEmailDomain(form.getValues("email")),
      });
      trackMutationOutcome(trackedMutationNames.authRegisterEmail, "error");
      setRootError(
        AuthCommands.getAuthErrorMessage(
          error,
          "We couldn't start your verification step. Please try again.",
        ),
      );
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
      await runOptionalSuccessCallback(onSuccess);
      setLoading(false);
    } catch (error) {
      captureException(trackedMutationNames.authVerifyEmailOtp, error);
      trackMutationOutcome(trackedMutationNames.authVerifyEmailOtp, "error");
      setRootError(
        AuthCommands.getAuthErrorMessage(
          error,
          "We couldn't verify that code. Please try again.",
        ),
      );
      setLoading(false);
    }
  }

  async function resendOtp() {
    const email = form.getValues("email");
    const emailDomain = getEmailDomain(email);

    setRootError(null);
    setOtpMessage(null);
    setResendLoading(true);

    try {
      const result = await AuthCommands.resendEmailOtp(email);
      trackMutationOutcome(trackedMutationNames.authResendEmailOtp, "success", {
        requestId: result.requestId,
      });
      setOtpMessage(`A fresh verification code is on its way to ${email}.`);
      setResendLoading(false);
    } catch (error) {
      captureException(trackedMutationNames.authResendEmailOtp, error, {
        emailDomain,
      });
      trackMutationOutcome(trackedMutationNames.authResendEmailOtp, "error");
      setRootError(
        AuthCommands.getAuthErrorMessage(
          error,
          "We couldn't resend the verification code. Please try again.",
        ),
      );
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
