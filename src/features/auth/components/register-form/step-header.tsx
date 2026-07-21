import type { Ref } from "react";
import type { Step } from "@/features/auth/hooks/use-register-form";

interface StepHeaderProps {
  headingRef?: Ref<HTMLHeadingElement>;
  step: Step;
}

export function StepHeader({ headingRef, step }: StepHeaderProps) {
  const title =
    step === 1
      ? "Let's build your profile"
      : step === 2
        ? "Tell us about yourself"
        : "Final security check";

  const description =
    step === 1
      ? "Start with the basics to secure your account."
      : step === 2
        ? "These details help TeamForge form groups around your plans."
        : "Check your email for a 6-digit code.";

  return (
    <div className="mb-6 flex flex-col items-center sm:mb-8">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-balance text-center font-extrabold font-sans text-2xl text-ink leading-tight tracking-tight outline-none sm:text-4xl"
      >
        {title}
        <span className="text-forge-teal">.</span>
      </h1>
      <p className="mt-1 max-w-sm text-center font-sans text-slate-muted text-xs sm:mt-2 sm:text-base">
        {description}
      </p>
    </div>
  );
}
