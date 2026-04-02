import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Form } from "@/shared/components/ui/form";
import { cn } from "@/shared/lib/utils";
import { useRegisterForm, type Step } from "../hooks/use-register-form";
import { StepCredentials } from "./register-steps/step-credentials";
import { StepOtp } from "./register-steps/step-otp";
import { StepProfile } from "./register-steps/step-profile";

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
    goToStep2,
    goToStep3,
    goBackToStep1,
    goBackToStep2,
    onSubmit,
  } = useRegisterForm({ onSuccess, onProgress });

  // Handle step change for scroll-to-top actions
  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  return (
    <div className="flex flex-col w-full">
      <StepIndicator step={step} />
      <StepHeader step={step} />

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
              {step === 1 && <StepCredentials onNext={goToStep2} />}
              {step === 2 && (
                <StepProfile onNext={goToStep3} onBack={goBackToStep1} />
              )}
              {step === 3 && (
                <StepOtp onBack={goBackToStep2} loading={loading} />
              )}
            </motion.div>
          </AnimatePresence>
        </form>
      </Form>

      <SwitchViewPrompt onClick={onSwitchToLogin} />
    </div>
  );
}

/** Internal Sub-Components for cleaner orchestration */

function StepIndicator({ step }: { step: Step }) {
  return (
    <div
      className="flex items-center justify-center gap-1.5 mb-4"
      aria-label={`Step ${step} of 3`}
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={3}
    >
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={cn(
            "rounded-full transition-[width,background-color] duration-500 ease-out h-2",
            s === step
              ? "w-8 bg-forge-teal"
              : s < step
                ? "w-2 bg-forge-teal"
                : "w-2 bg-border",
          )}
        />
      ))}
    </div>
  );
}

function StepHeader({ step }: { step: Step }) {
  const title =
    step === 1
      ? "Create your account"
      : step === 2
        ? "Almost there"
        : "Verify your email";

  const description =
    step === 1
      ? "Start with your basic credentials."
      : step === 2
        ? "A few details to help us forge your group."
        : "Enter the 6-digit code we sent you.";

  return (
    <div className="flex flex-col items-center mb-6 sm:mb-8">
      <h1 className="font-sans text-2xl sm:text-4xl font-extrabold text-ink leading-tight text-balance text-center tracking-tight">
        {title}
        <span className="text-forge-teal">.</span>
      </h1>
      <p className="font-sans text-xs sm:text-base text-slate-muted mt-1 sm:mt-2 text-center max-w-sm">
        {description}
      </p>
    </div>
  );
}

function SwitchViewPrompt({ onClick }: { onClick: () => void }) {
  return (
    <p className="font-sans text-sm text-slate-muted text-center mt-6">
      Already have an account?{" "}
      <button
        type="button"
        onClick={onClick}
        className="font-semibold text-forge-teal hover:underline cursor-pointer transition-colors focus:outline-hidden"
      >
        Sign in
      </button>
    </p>
  );
}
