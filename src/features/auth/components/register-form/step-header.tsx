import { type Step } from "../../hooks/use-register-form";

interface StepHeaderProps {
  step: Step;
}

export function StepHeader({ step }: StepHeaderProps) {
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
