import { Eye, LoaderCircle, Lock, RefreshCcw } from "lucide-react";
import {
  OnboardingIntroActions,
  OnboardingIntroBenefitList,
} from "@/features/onboarding/components/onboarding-intro-parts";
import type { PersonalityAssessmentQueryStatus } from "@/features/onboarding/hooks/use-personality-test-page-flow";
import { Button } from "@/shared/components/ui/button";
import { PersonalityScreenShell } from "./personality-screen-layout";

interface PersonalityIntroProps {
  backLabel: string;
  onBack: () => void;
  onRetryState: () => void;
  onStart: () => void;
  stateStatus: PersonalityAssessmentQueryStatus;
}

export function PersonalityIntro({
  backLabel,
  onBack,
  onRetryState,
  onStart,
  stateStatus,
}: PersonalityIntroProps) {
  const benefits = getAssessmentBenefits();
  const stateReady = stateStatus === "ready";

  return (
    <PersonalityScreenShell className="max-w-md pt-10 sm:pt-12">
      <h1 className="mb-4 text-balance text-center font-extrabold font-sans text-2xl text-ink leading-tight sm:text-display-lg">
        Know what happens to your answers
      </h1>

      <div className="text-left">
        <p className="mb-6 text-pretty font-sans text-muted-foreground text-xs leading-relaxed">
          The questions come from the public-domain International Personality
          Item Pool. The result is an estimate, not a diagnosis.
        </p>
      </div>

      <OnboardingIntroBenefitList
        benefits={benefits}
        iconTileClassName="mt-0.5"
        textClassName="font-sans text-muted-foreground text-xs leading-relaxed"
      />

      <AssessmentStateNotice onRetry={onRetryState} status={stateStatus} />

      <OnboardingIntroActions
        backLabel={backLabel}
        onBack={onBack}
        onStart={onStart}
        startDisabled={!stateReady}
        startLabel="I understand, continue"
        startLoading={stateStatus === "loading" || stateStatus === "refreshing"}
      />
    </PersonalityScreenShell>
  );
}

function getAssessmentBenefits() {
  return [
    {
      icon: Lock,
      text: "Your answers stay in this tab until you submit. They are sent for scoring and are not saved after scoring.",
    },
    {
      icon: Eye,
      text: "When you save the result, other signed-in TeamForge users can see your four-letter type and five trait scores from 0 to 100.",
    },
    {
      icon: RefreshCcw,
      text: "TeamForge uses the saved result to calculate and explain compatibility for group formation. It is not a safety score or a promise that people will become friends.",
    },
    {
      icon: RefreshCcw,
      text: "Reloading, signing out, closing this tab, or replacing the session before submission loses your answers.",
    },
  ];
}

function AssessmentStateNotice({
  onRetry,
  status,
}: {
  onRetry: () => void;
  status: PersonalityAssessmentQueryStatus;
}) {
  if (status === "ready") return null;

  if (status === "error") {
    return (
      <div
        className="grid gap-3 rounded-2xl border border-border bg-card p-4 text-left"
        role="alert"
      >
        <p className="text-muted-foreground text-sm leading-relaxed">
          Your saved personality status could not be checked. Refresh it before
          starting another assessment.
        </p>
        <Button variant="outline" size="sm" className="w-fit" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <p
      className="flex items-center justify-center gap-2 text-muted-foreground text-sm"
      role="status"
    >
      <LoaderCircle
        className="size-4 animate-spin motion-reduce:animate-none"
        aria-hidden="true"
      />
      Checking your saved personality status
    </p>
  );
}
