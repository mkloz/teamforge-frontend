import { Brain, Lock, RefreshCcw } from "lucide-react";
import {
  OnboardingIntroActions,
  OnboardingIntroBenefitList,
} from "@/features/onboarding/components/onboarding-intro-parts";
import { PersonalityScreenShell } from "./personality-screen-layout";

interface PersonalityIntroProps {
  backLabel: string;
  onBack: () => void;
  onStart: () => void;
}

const BENEFITS = [
  {
    icon: Brain,
    text: "Based on the IPIP – one of the most widely validated personality frameworks in academic psychology.",
  },
  {
    icon: Lock,
    text: "Your results are only used to find compatible people. They are never sold or shared.",
  },
  {
    icon: RefreshCcw,
    text: "You can retake or update your assessment at any time from your profile.",
  },
];

export function PersonalityIntro({
  backLabel,
  onBack,
  onStart,
}: PersonalityIntroProps) {
  return (
    <PersonalityScreenShell className="max-w-md pt-10 sm:pt-12">
      <p className="mb-3 text-center font-bold font-sans text-forge-teal text-xs">
        Personality Assessment
      </p>

      <h1 className="mb-4 text-balance text-center font-extrabold font-sans text-2xl text-ink leading-tight sm:text-display-lg">
        What makes you, you?
      </h1>

      <div className="text-left">
        <p className="mb-3 text-pretty font-medium font-sans text-muted-foreground text-sm leading-relaxed sm:text-base">
          Before we build your group, we want to understand how your mind works
          – the core of your personality.
        </p>
        <p className="mb-6 text-pretty font-sans text-muted-foreground text-xs leading-relaxed">
          This is the{" "}
          <span className="font-semibold text-ink">IPIP Assessment</span> – a
          scientifically validated framework. The result shapes your group
          matches and gives you a framework for understanding yourself.
        </p>
      </div>

      <div className="mb-6 h-px w-full bg-muted dark:bg-white/10" />

      <OnboardingIntroBenefitList
        benefits={BENEFITS}
        iconTileClassName="mt-0.5"
        textClassName="font-sans text-muted-foreground text-xs leading-relaxed"
      />

      <OnboardingIntroActions
        backLabel={backLabel}
        onBack={onBack}
        onStart={onStart}
        startLabel="Let's find out"
      />
    </PersonalityScreenShell>
  );
}
