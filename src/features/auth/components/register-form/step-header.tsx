import type { Step } from "@/features/auth/hooks/use-register-form";

interface StepHeaderProps {
  step: Step;
}

export function StepHeader({ step }: StepHeaderProps) {
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
        ? "Just a few details to help us forge better groups."
        : "Check your email for a 6-digit code.";

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
