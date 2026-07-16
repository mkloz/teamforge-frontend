import { m } from "framer-motion";

import { resultsContainer } from "@/features/onboarding/constants/motion";
import type { PersonalityAssessmentQueryStatus } from "@/features/onboarding/hooks/use-personality-test-page-flow";
import { getPersonalityResultViewModel } from "@/features/onboarding/lib/personality-results";
import { Button } from "@/shared/components/ui/button";
import type { PublicPersonalityProfile } from "@/shared/schemas/public-personality-profile";

import { PersonalityResultActions } from "./personality-result-actions";
import { PersonalityResultHero } from "./personality-result-hero";
import { PersonalityResultSummary } from "./personality-result-summary";
import { PersonalityTraitMap } from "./personality-trait-map";
import { SectionHeading } from "./section-heading";

type ResultAction = "publish" | "discard" | "delete-all" | "retake";

interface PersonalityResultsProps {
  activeResultAction: ResultAction | null;
  canContinue: boolean;
  continueLabel?: string;
  error: string | null;
  hasDraft: boolean;
  isOnline: boolean;
  isSaved: boolean;
  isLegacyResult: boolean;
  onContinue: () => void;
  onDiscard: () => void;
  onDeleteAll: () => void;
  onSave: () => void;
  onRetake: () => void;
  onRetryState: () => void;
  profile: PublicPersonalityProfile;
  stateStatus: PersonalityAssessmentQueryStatus;
}

export function PersonalityResults({
  activeResultAction,
  canContinue,
  continueLabel = "Continue",
  error,
  hasDraft,
  isOnline,
  isSaved,
  isLegacyResult,
  onContinue,
  onDiscard,
  onDeleteAll,
  onSave,
  onRetake,
  onRetryState,
  profile,
  stateStatus,
}: PersonalityResultsProps) {
  const viewModel = getPersonalityResultViewModel(profile);

  return (
    <m.div
      variants={resultsContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col gap-8 py-8 sm:py-10"
    >
      <PersonalityResultHero personalityType={profile.personalityType} />

      <PersonalityResultSummary profile={viewModel.profile} />

      <section className="flex flex-col gap-4 border-border/60 border-t pt-7">
        <SectionHeading
          eyebrow="Personality summary"
          title="How you may contribute to a group"
        />
        <p className="text-pretty font-medium text-base text-ink/82 leading-relaxed">
          {viewModel.groupRead}
        </p>
      </section>

      <PersonalityTraitMap
        dimensionScores={viewModel.dimensionScores}
        oceanScores={viewModel.oceanScores}
      />

      <section className="flex flex-col gap-4 border-border/60 border-t pt-7">
        <SectionHeading
          eyebrow="Keep in mind"
          title="An estimate, not a diagnosis"
        />
        <p className="text-pretty text-muted-foreground text-sm leading-relaxed">
          This is an estimate based on your answers. It is not a diagnosis or a
          fixed description of who you are. It does not measure safety or
          guarantee how well a group will work.
        </p>
      </section>

      <section className="flex flex-col gap-4 border-border/60 border-t pt-7">
        <SectionHeading
          eyebrow="Your TeamForge profile"
          title="A portrait people can understand"
        />
        <p className="text-pretty text-ink/82 text-sm leading-relaxed">
          Save this result to add the portrait to your profile. Other signed-in
          TeamForge users can see it, and TeamForge can use it when forming
          groups.
        </p>
        <p className="text-pretty text-muted-foreground text-xs leading-relaxed">
          Your answers were used for this assessment and are not saved.
        </p>
      </section>

      {isLegacyResult ? (
        <p
          className="text-pretty border-spark-amber/60 border-l-2 py-1 pl-4 text-ink text-sm leading-relaxed"
          role="status"
        >
          This result came from the earlier assessment flow. Retake the current
          assessment to refresh the portrait used on your profile and in group
          formation.
        </p>
      ) : null}

      <AssessmentStateNotice onRetry={onRetryState} status={stateStatus} />

      <PersonalityResultActions
        actionsAvailable={stateStatus === "ready"}
        activeAction={activeResultAction}
        canContinue={canContinue}
        continueLabel={continueLabel}
        error={error}
        hasDraft={hasDraft}
        isOnline={isOnline}
        isSaved={isSaved}
        isLegacyResult={isLegacyResult}
        onContinue={onContinue}
        onDiscard={onDiscard}
        onDeleteAll={onDeleteAll}
        onSave={onSave}
        onRetake={onRetake}
      />
    </m.div>
  );
}

function AssessmentStateNotice({
  onRetry,
  status,
}: {
  onRetry: () => void;
  status: PersonalityAssessmentQueryStatus;
}) {
  if (status === "error") {
    return (
      <div
        className="flex flex-col gap-3 border-destructive/60 border-l-2 py-1 pl-4"
        role="alert"
      >
        <p className="text-muted-foreground text-sm leading-relaxed">
          We could not refresh the saved result status. Review is still
          available, but refresh before changing it.
        </p>
        <Button variant="outline" size="sm" className="w-fit" onClick={onRetry}>
          Refresh status
        </Button>
      </div>
    );
  }

  return status === "refreshing" ? (
    <p className="text-center text-muted-foreground text-sm" role="status">
      Refreshing saved result status
    </p>
  ) : null;
}
