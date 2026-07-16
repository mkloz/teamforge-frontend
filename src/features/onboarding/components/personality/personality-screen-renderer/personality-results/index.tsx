import { m } from "framer-motion";

import { resultsContainer } from "@/features/onboarding/constants/motion";
import type { PersonalityDisclosure } from "@/shared/schemas/personality-assessment";
import type { PublicPersonalityProfile } from "@/shared/schemas/public-personality-profile";

import { PersonalityResultActions } from "./personality-result-actions";
import { PersonalityResultHero } from "./personality-result-hero";
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
  disclosure: PersonalityDisclosure;
  error: string | null;
  hasDraft: boolean;
  isOnline: boolean;
  isPublished: boolean;
  isLegacyResult: boolean;
  isResultPrivate: boolean;
  onContinue: () => void;
  onDiscard: () => void;
  onDeleteAll: () => void;
  onKeepPrivate: () => void;
  onPublish: () => void;
  onRetake: () => void;
  profile: PublicPersonalityProfile;
}

export function PersonalityResults({
  activeResultAction,
  canContinue,
  continueLabel = "Continue",
  disclosure,
  error,
  hasDraft,
  isOnline,
  isPublished,
  isLegacyResult,
  isResultPrivate,
  onContinue,
  onDiscard,
  onDeleteAll,
  onKeepPrivate,
  onPublish,
  onRetake,
  profile,
}: PersonalityResultsProps) {
  const audienceText = getAudienceText(disclosure.authorizedAudiences);

  return (
    <m.div
      variants={resultsContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col gap-8 py-8 sm:py-10"
    >
      <PersonalityResultHero personalityType={profile.personalityType} />

      <section className="flex flex-col gap-4 border-border/60 border-t pt-7">
        <SectionHeading
          eyebrow="Your result"
          title="Five broad personality traits"
        />
        <p className="text-pretty text-muted-foreground text-sm leading-relaxed">
          This is an estimate based on your answers. It is not a diagnosis or a
          fixed description of who you are.
        </p>
        <PersonalityTraitMap oceanScores={profile.ocean} />
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <SectionHeading
          eyebrow="Before you publish"
          title="What publication allows"
        />
        <p className="text-pretty text-ink/82 text-sm leading-relaxed">
          Publishing lets TeamForge use this exact type and these five scores
          for {audienceText}. Keeping it private stores the result for you.
          TeamForge will not use it when forming groups.
        </p>
        <p className="text-pretty text-muted-foreground text-xs leading-relaxed">
          Your answers were used for this submission and are not saved.
        </p>
      </section>

      {isLegacyResult ? (
        <p
          className="text-pretty rounded-2xl border border-border bg-muted/40 p-4 text-ink text-sm leading-relaxed"
          role="status"
        >
          This result came from the earlier assessment flow. You can keep it
          private, but you need to take the current assessment before publishing
          it.
        </p>
      ) : null}

      <PersonalityResultActions
        activeAction={activeResultAction}
        canContinue={canContinue}
        continueLabel={continueLabel}
        error={error}
        hasDraft={hasDraft}
        isOnline={isOnline}
        isPublished={isPublished}
        isLegacyResult={isLegacyResult}
        isResultPrivate={isResultPrivate}
        onContinue={onContinue}
        onDiscard={onDiscard}
        onDeleteAll={onDeleteAll}
        onKeepPrivate={onKeepPrivate}
        onPublish={onPublish}
        onRetake={onRetake}
      />
    </m.div>
  );
}

function getAudienceText(audiences: string[]) {
  const allowedAudiences = [
    audiences.includes("LIVE_PROPOSAL_SEAT")
      ? "people in a group proposal with you"
      : null,
    audiences.includes("CURRENT_GROUP") ? "current group members" : null,
  ].filter((audience): audience is string => audience !== null);

  if (allowedAudiences.length === 2) {
    return `${allowedAudiences[0]} and ${allowedAudiences[1]}`;
  }

  return allowedAudiences[0] ?? "group formation";
}
