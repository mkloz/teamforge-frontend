import { Eye, Lock, RefreshCcw } from "lucide-react";
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
    icon: Lock,
    text: "Your answers are sent for scoring when you submit and are not saved.",
  },
  {
    icon: Eye,
    text: "After you see the result, you decide whether TeamForge can use it when forming groups. A published result can be shown to people in a group proposal with you and members of your current groups.",
  },
  {
    icon: RefreshCcw,
    text: "Answers stay only in this tab until submission. Reloading, signing out, or closing the tab loses them.",
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
        Before the assessment
      </p>

      <h1 className="mb-4 text-balance text-center font-extrabold font-sans text-2xl text-ink leading-tight sm:text-display-lg">
        Know what happens to your answers
      </h1>

      <div className="text-left">
        <p className="mb-3 text-pretty font-medium font-sans text-muted-foreground text-sm leading-relaxed sm:text-base">
          You will answer questions about how you usually think, feel, and act.
          TeamForge calculates the result after you finish.
        </p>
        <p className="mb-6 text-pretty font-sans text-muted-foreground text-xs leading-relaxed">
          The questions come from the public-domain International Personality
          Item Pool. The result is an estimate, not a diagnosis.
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
        startLabel="I understand, continue"
      />
    </PersonalityScreenShell>
  );
}
