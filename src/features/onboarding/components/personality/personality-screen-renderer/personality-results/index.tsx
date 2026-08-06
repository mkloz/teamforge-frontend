import { m } from "framer-motion";

import type { CompatibilityInputLockStatus } from "@/features/forge-proposals/public/proposal-review";
import { resultsContainer } from "@/features/onboarding/constants/motion";
import type { PersonalityAssessmentQueryStatus } from "@/features/onboarding/hooks/use-personality-test-page-flow";
import { getPersonalityResultViewModel } from "@/features/onboarding/lib/personality-results";
import { Button } from "@/shared/components/ui/button";
import type { PersonalityAssessmentMeasurement } from "@/shared/schemas/personality-assessment";
import type { PublicPersonalityProfile } from "@/shared/schemas/public-personality-profile";

import { PersonalityResultActions } from "./personality-result-actions";
import { PersonalityResultHero } from "./personality-result-hero";
import { PersonalityResultSummary } from "./personality-result-summary";
import { PersonalityTraitMap } from "./personality-trait-map";
import { SectionHeading } from "./section-heading";

type ResultAction =
  | "publish"
  | "keep-private"
  | "discard"
  | "delete-all"
  | "retake";

interface PersonalityResultsProps {
  activeResultAction: ResultAction | null;
  canContinue: boolean;
  continueLabel?: string;
  error: string | null;
  hasDraft: boolean;
  inputLock: {
    isBlocked: boolean;
    message: string | null;
    retry: () => unknown;
    status: CompatibilityInputLockStatus;
  };
  isOnline: boolean;
  isAcceptedPrivately: boolean;
  isSaved: boolean;
  isLegacyResult: boolean;
  isCompatibilityEligible: boolean;
  measurement: PersonalityAssessmentMeasurement | null;
  onContinue: () => void;
  onDiscard: () => void;
  onDeleteAll: () => void;
  onKeepPrivate: () => void;
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
  inputLock,
  isOnline,
  isAcceptedPrivately,
  isSaved,
  isLegacyResult,
  isCompatibilityEligible,
  measurement,
  onContinue,
  onDiscard,
  onDeleteAll,
  onKeepPrivate,
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
        <SectionHeading title="How you may contribute to a group" />
        <p className="text-pretty font-medium text-base text-ink/82 leading-relaxed">
          {viewModel.groupRead}
        </p>
      </section>

      <PersonalityTraitMap
        dimensionScores={viewModel.dimensionScores}
        oceanScores={viewModel.oceanScores}
      />

      {measurement?.mode === "DYNAMIC" && measurement.uncertainty ? (
        <section className="flex flex-col gap-4 border-border/60 border-t pt-7">
          <SectionHeading title="Your likely score ranges" />
          <p className="text-pretty text-muted-foreground text-sm leading-relaxed">
            These ranges show how much each score could reasonably vary, not a
            limit on who you are. A narrower range means this set of answers
            gave a clearer estimate.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Object.entries(measurement.uncertainty).map(
              ([trait, uncertainty]) => (
                <div
                  key={trait}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
                >
                  <span className="font-semibold text-ink text-sm capitalize">
                    {trait}
                  </span>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {uncertainty.lower90}–{uncertainty.upper90}
                  </span>
                </div>
              ),
            )}
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            This version used {measurement.questionCount} questions and stopped
            {measurement.stopReason === "PRECISION_REACHED"
              ? " after it gathered enough answers for each trait."
              : " at the maximum length shown before you started."}
          </p>
        </section>
      ) : null}

      <section className="flex flex-col gap-4 border-border/60 border-t pt-7">
        <SectionHeading title="An estimate, not a diagnosis" />
        <p className="text-pretty text-muted-foreground text-sm leading-relaxed">
          This is an estimate based on your answers. It is not a diagnosis or a
          fixed description of who you are. It does not measure safety or
          guarantee how well a group will work.
        </p>
      </section>

      <section className="flex flex-col gap-4 border-border/60 border-t pt-7">
        <SectionHeading title="Choose who can see this" />
        <p className="text-pretty text-ink/82 text-sm leading-relaxed">
          {isCompatibilityEligible
            ? "Use the result privately for matching, or also add the portrait to your profile for other signed-in members to see."
            : "Keep the result private, or add the portrait to your profile. This assessment version is not currently used for matching."}
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

      <CompatibilityInputLockNotice inputLock={inputLock} />

      <PersonalityResultActions
        actionsAvailable={stateStatus === "ready"}
        activeAction={activeResultAction}
        canContinue={canContinue}
        continueLabel={continueLabel}
        error={error}
        hasDraft={hasDraft}
        retakeBlocked={inputLock.isBlocked}
        retakeBlockedReason={inputLock.message}
        isOnline={isOnline}
        isAcceptedPrivately={isAcceptedPrivately}
        isSaved={isSaved}
        isLegacyResult={isLegacyResult}
        publishBlocked={inputLock.isBlocked}
        publishBlockedReason={inputLock.message}
        onContinue={onContinue}
        onDiscard={onDiscard}
        onDeleteAll={onDeleteAll}
        onKeepPrivate={onKeepPrivate}
        onSave={onSave}
        onRetake={onRetake}
      />
    </m.div>
  );
}

function CompatibilityInputLockNotice({
  inputLock,
}: Pick<PersonalityResultsProps, "inputLock">) {
  if (!inputLock.isBlocked) {
    return null;
  }

  return (
    <div
      className="flex flex-col gap-3 border-border border-l-2 py-1 pl-4"
      role={inputLock.status === "error" ? "alert" : "status"}
    >
      <p className="text-muted-foreground text-sm leading-relaxed">
        {inputLock.message}
      </p>
      {inputLock.status === "error" ? (
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => void inputLock.retry()}
        >
          Try again
        </Button>
      ) : null}
    </div>
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
