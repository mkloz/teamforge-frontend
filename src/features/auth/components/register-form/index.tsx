import { Form } from "@/shared/components/ui/form";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { FormLevelError } from "@/features/auth/components/form-level-error";
import {
  useRegisterForm,
  type Step,
} from "@/features/auth/hooks/use-register-form";
import { StepCredentials } from "./step-credentials";
import { StepHeader } from "./step-header";
import { StepOtp } from "./step-otp";
import { StepProfile } from "./step-profile";
import { SwitchViewPrompt } from "./switch-view-prompt";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
  onProgress?: (progress: number) => void;
  onStepChange?: (step: Step) => void;
}

const variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    y: direction < 0 ? 30 : -30,
    opacity: 0,
  }),
};

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
  } = useRegisterForm({ onSuccess, onProgress });

  // Handle step change for scroll-to-top actions
  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  return (
    <div className="flex w-full flex-col">
      <StepHeader step={step} />

      {rootError && <FormLevelError message={rootError} />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full"
            >
              {step === 1 && (
                <StepCredentials
                  onNext={goToStep2}
                  onGoogleSuccess={onSuccess}
                />
              )}
              {step === 2 && (
                <StepProfile onNext={goToStep3} onBack={goBackToStep1} />
              )}
              {step === 3 && (
                <StepOtp
                  onBack={goBackToStep2}
                  loading={loading}
                  resendLoading={resendLoading}
                  email={form.getValues("email")}
                  otpMessage={otpMessage}
                  onResend={resendOtp}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </form>
      </Form>

      <SwitchViewPrompt onClick={onSwitchToLogin} />
    </div>
  );
}
