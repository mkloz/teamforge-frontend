import { Lock, RefreshCw, Users } from "lucide-react";
import {
  OnboardingIntroActions,
  OnboardingIntroBenefitList,
} from "@/features/onboarding/components/onboarding-intro-parts";

interface InterestsIntroProps {
  backLabel: string;
  onBack: () => void;
  onStart: () => void;
}

const BENEFITS = [
  {
    icon: Users,
    text: "Pick the things you would actually say yes to. The best profile feels honest, not impressive.",
  },
  {
    icon: Lock,
    text: "Your interests are used to shape group ideas. They are not shown as a public checklist.",
  },
  {
    icon: RefreshCw,
    text: "You can update this later as your taste changes.",
  },
];

export function InterestsIntro({
  backLabel,
  onBack,
  onStart,
}: InterestsIntroProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center gap-0 pt-10 text-center sm:pt-12">
      <h1 className="mb-4 text-balance font-extrabold font-sans text-2xl text-ink leading-tight sm:text-display-lg">
        What do you love doing?
      </h1>

      <div>
        <p className="mb-3 text-pretty font-medium font-sans text-slate-muted text-sm leading-relaxed">
          Choose hobbies, places, games, and topics you would make time for.
        </p>
        <p className="mb-6 text-pretty font-sans text-slate-muted/80 text-sm leading-relaxed">
          Pick at least{" "}
          <span className="border-forge-teal/30 border-b font-bold text-ink">
            15 interests
          </span>
          . There are no wrong answers – only honest ones.
        </p>
      </div>

      <div className="mb-6 h-px w-full bg-slate-muted/10" />

      <OnboardingIntroBenefitList
        benefits={BENEFITS}
        iconTileClassName="mt-0.5 bg-forge-teal/5"
        textClassName="font-sans text-slate-muted text-sm leading-relaxed"
      />

      <OnboardingIntroActions
        backLabel={backLabel}
        onBack={onBack}
        onStart={onStart}
        startLabel="Let's pick your interests"
      />
    </div>
  );
}
