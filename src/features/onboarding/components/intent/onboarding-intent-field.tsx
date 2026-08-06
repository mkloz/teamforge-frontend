import type { UseFormReturn } from "react-hook-form";

import type { OnboardingIntentValues } from "@/features/onboarding/schemas/onboarding-intent.schema";
import { cn } from "@/shared/lib/utils";

const INTENT_OPTIONS = [
  {
    value: "BRING_A_PLAN",
    label: "Bring a plan",
    description: "Start with an idea and find people for it.",
  },
  {
    value: "EXPLORE_AND_JOIN",
    label: "Explore and join",
    description: "See relevant plans and find your next thing.",
  },
  {
    value: "BOTH_OR_UNSURE",
    label: "A bit of both",
    description: "Keep both paths easy to reach.",
  },
] as const;

export function OnboardingIntentField({
  form,
}: {
  form: UseFormReturn<OnboardingIntentValues>;
}) {
  const selected = form.watch("onboardingIntent");

  return (
    <fieldset aria-describedby="onboarding-intent-help" className="min-w-0">
      <legend className="sr-only">Choose what brings you to TeamForge</legend>
      <p
        id="onboarding-intent-help"
        className="text-slate-muted text-sm leading-6"
      >
        This only changes your first suggestions and guidance. It never changes
        eligibility or safety checks.
      </p>
      <div className="mt-5 grid gap-3">
        {INTENT_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex min-h-24 cursor-pointer flex-col justify-center rounded-2xl border px-4 py-3 transition-colors",
              "focus-within:ring-2 focus-within:ring-forge-teal focus-within:ring-offset-2",
              selected === option.value
                ? "border-forge-teal bg-forge-teal/8"
                : "border-border bg-card hover:border-forge-teal/35",
            )}
          >
            <input
              type="radio"
              className="sr-only"
              value={option.value}
              checked={selected === option.value}
              onChange={() =>
                form.setValue("onboardingIntent", option.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            <span className="font-bold text-base text-ink">{option.label}</span>
            <span className="mt-1 text-slate-muted text-sm leading-5">
              {option.description}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
