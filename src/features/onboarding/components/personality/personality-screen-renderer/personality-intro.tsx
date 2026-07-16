import { Eye, LoaderCircle, Lock, RefreshCcw } from "lucide-react";
import {
  OnboardingIntroActions,
  OnboardingIntroBenefitList,
} from "@/features/onboarding/components/onboarding-intro-parts";
import type { PersonalityAssessmentQueryStatus } from "@/features/onboarding/hooks/use-personality-test-page-flow";
import { getPersonalityAudienceText } from "@/features/onboarding/lib/personality-disclosure-copy";
import { Button } from "@/shared/components/ui/button";
import type { PersonalityDisclosure } from "@/shared/schemas/personality-assessment";
import { PersonalityScreenShell } from "./personality-screen-layout";

interface PersonalityIntroProps {
  backLabel: string;
  disclosure: PersonalityDisclosure | null;
  onBack: () => void;
  onRetryState: () => void;
  onStart: () => void;
  stateStatus: PersonalityAssessmentQueryStatus;
}

export function PersonalityIntro({
  backLabel,
  disclosure,
  onBack,
  onRetryState,
  onStart,
  stateStatus,
}: PersonalityIntroProps) {
  const benefits = getDisclosureBenefits(disclosure);
  const stateReady = stateStatus === "ready";

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

function getDisclosureBenefits(disclosure: PersonalityDisclosure | null) {
  const audience = disclosure
    ? getPersonalityAudienceText(disclosure.authorizedAudiences)
    : "people in a live group proposal with you and members of your current groups";

  return [
    {
      icon: Lock,
      text: "Your answers stay in this tab until you submit. They are sent for scoring and are not saved after scoring.",
    },
    {
      icon: Eye,
      text: `If you publish, ${audience} can see your four-letter type and five trait scores from 0 to 100. The result is not public on the open web.`,
    },
    {
      icon: RefreshCcw,
      text: "TeamForge uses a published result to calculate and explain compatibility for group formation. It is not a safety score or a promise that people will become friends.",
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
