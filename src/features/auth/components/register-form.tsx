import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Form } from "@/shared/components/ui/form";
import { registerSchema, type RegisterValues } from "../schemas/auth-schemas";
import { StepCredentials } from "./register-steps/step-credentials";
import { StepOtp } from "./register-steps/step-otp";
import { StepProfile } from "./register-steps/step-profile";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
  onProgress?: (progress: number) => void;
}

type Step = 1 | 2 | 3;

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 20 : -20,
    opacity: 0,
  }),
};

export function RegisterForm({
  onSwitchToLogin,
  onSuccess,
  onProgress,
}: RegisterFormProps) {
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

  const values = form.watch();

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

    // 7 required fields roughly
    onProgress(Math.min(filled / 7, 1));
  }, [values, onProgress]);

  async function goToStep2() {
    const isValid = await form.trigger(["name", "email", "password"]);
    if (isValid) {
      setDirection(1);
      setStep(2);
    }
  }

  async function goToStep3() {
    const isValid = await form.trigger(["age", "city", "gender"]);
    if (isValid) {
      setDirection(1);
      setStep(3);
    }
  }

  function goBackToStep1() {
    setDirection(-1);
    setStep(1);
  }

  function goBackToStep2() {
    setDirection(-1);
    setStep(2);
  }

  async function onSubmit(values: RegisterValues) {
    const isValid = await form.trigger(["otp"]);
    if (!isValid) return;

    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    console.log("Registration complete", values);
    if (onSuccess) onSuccess();
  }

  return (
    <div className="flex flex-col w-full">
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
            className={`rounded-full transition-all duration-500 ease-out ${
              s === step
                ? "w-8 bg-forge-teal"
                : s < step
                  ? "w-2 bg-forge-teal"
                  : "w-2 bg-[#E5E7EB]"
            } h-2`}
          />
        ))}
      </div>
      <div className="flex flex-col items-center mb-4">
        <h1 className="font-sans text-3xl sm:text-4xl font-extrabold text-ink leading-tight text-balance text-center tracking-tight">
          {step === 1
            ? "Create your account"
            : step === 2
              ? "Almost there"
              : "Verify your email"}
          <span className="text-forge-teal">.</span>
        </h1>
        <p className="font-sans text-sm sm:text-base text-slate-muted mt-2 text-center">
          {step === 1
            ? "Start with your credentials."
            : step === 2
              ? "A few details to build your profile."
              : "Enter the 6-digit code sent to you."}
        </p>
      </div>

      {/* Step indicator */}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
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

      <p className="font-sans text-sm text-slate-muted text-center mt-4">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-forge-teal hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
