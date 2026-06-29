import { lazy, Suspense } from "react";
import { FormLevelError } from "@/features/auth/components/form-level-error";
import {
  type Step,
  useRegisterForm,
} from "@/features/auth/hooks/use-register-form";
import { Form } from "@/shared/components/ui/form";
import { StepCredentials } from "./step-credentials";
import { StepHeader } from "./step-header";
import { SwitchViewPrompt } from "./switch-view-prompt";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
  onProgress?: (progress: number) => void;
  onStepChange?: (step: Step) => void;
}

const loadStepProfile = () =>
  import("./step-profile").then((module) => ({
    default: module.StepProfile,
  }));

const loadStepOtp = () =>
  import("./step-otp").then((module) => ({
    default: module.StepOtp,
  }));

const LazyStepProfile = lazy(loadStepProfile);
const LazyStepOtp = lazy(loadStepOtp);

function RegisterStepFallback() {
  return <div className="min-h-80" aria-hidden="true" />;
}

/**
 * RegisterForm
 * A smooth, multi-step onboarding wizard for new TeamForge users.
 * Orchestrates step transitions, validation, and real-time progress feedback.
 */
export function RegisterForm({
  onSwitchToLogin,
  onSuccess,
  onProgress,
  onStepChange,
}: RegisterFormProps) {
  const {
    form,
    isOnline,
    step,
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
  } = useRegisterForm({ onSuccess, onProgress, onStepChange });

  return (
    <div className="flex w-full flex-col">
      <StepHeader step={step} />

      {rootError && <FormLevelError message={rootError} />}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <Suspense fallback={<RegisterStepFallback />}>
            <div key={step} className="w-full animate-auth-step-enter">
              {step === 1 && (
                <StepCredentials
                  onNext={goToStep2}
                  onGoogleSuccess={onSuccess}
                  onNextIntent={loadStepProfile}
                />
              )}
              {step === 2 && (
                <LazyStepProfile
                  onNext={goToStep3}
                  onBack={goBackToStep1}
                  onNextIntent={loadStepOtp}
                  isOnline={isOnline}
                />
              )}
              {step === 3 && (
                <LazyStepOtp
                  onBack={goBackToStep2}
                  loading={loading}
                  resendLoading={resendLoading}
                  email={form.getValues("email")}
                  isOnline={isOnline}
                  otpMessage={otpMessage}
                  onResend={resendOtp}
                />
              )}
            </div>
          </Suspense>
        </form>
      </Form>

      <SwitchViewPrompt onClick={onSwitchToLogin} />
    </div>
  );
}
