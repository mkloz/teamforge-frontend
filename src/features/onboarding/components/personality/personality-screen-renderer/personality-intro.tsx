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
    text: "Uses questions adapted from the public-domain International Personality Item Pool (IPIP).",
  },
  {
    icon: Lock,
    text: "Your results help TeamForge form groups. Our privacy policy explains how this data is handled.",
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
          Before we build your group, answer a set of questions about how you
          usually think, feel, and act.
        </p>
        <p className="mb-6 text-pretty font-sans text-muted-foreground text-xs leading-relaxed">
          This assessment uses IPIP questions. Your result shows five broad
          trait scores and helps TeamForge form groups.
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
        startLabel="Start assessment"
      />
    </PersonalityScreenShell>
  );
}
