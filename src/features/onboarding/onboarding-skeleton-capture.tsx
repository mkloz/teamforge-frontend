import { OnboardingPageLoading } from "@/features/onboarding/onboarding-page.loading";

const ONBOARDING_CAPTURE_STEPS = [
  "profile",
  "personality",
  "interests",
] as const;

export function OnboardingSkeletonCapture() {
  return (
    <main className="bg-canvas">
      {ONBOARDING_CAPTURE_STEPS.map((step) => (
        <section className="min-h-screen" key={step}>
          <OnboardingPageLoading mode="route" step={step} />
        </section>
      ))}
    </main>
  );
}
