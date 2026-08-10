import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Brain,
  BrainCircuit,
  type LucideIcon,
  RefreshCcw,
  Tags,
} from "lucide-react";
import { useState } from "react";

import { personalityAssessmentQueryOptions } from "@/shared/api/personality-assessment-query";
import { Button } from "@/shared/components/ui/button";
import { StatusPill } from "@/shared/components/ui/status-pill";
import {
  buildInterestsEditNavigation,
  buildPersonalityEditNavigation,
} from "@/shared/navigation";
import type { User } from "@/shared/schemas";
import type { PersonalityAssessmentState } from "@/shared/schemas/personality-assessment";

const MAX_INTERESTS_PREVIEW = 8;

interface MatchingProfileCardProps {
  currentUser: User | undefined;
  interestsDisabled: boolean;
  interestsDisabledReason: string | null;
}

type UserInterest = NonNullable<User["interests"]>[number];

export function MatchingProfileCard({
  currentUser,
  interestsDisabled,
  interestsDisabledReason,
}: MatchingProfileCardProps) {
  const personalityAssessment = useQuery(personalityAssessmentQueryOptions());
  const interests = currentUser?.interests ?? [];
  const [showAllInterests, setShowAllInterests] = useState(false);
  const visibleInterests = showAllInterests
    ? interests
    : interests.slice(0, MAX_INTERESTS_PREVIEW);
  const remainingInterestCount = Math.max(
    interests.length - visibleInterests.length,
    0,
  );
  const personality = getPersonalityValue(personalityAssessment);

  return (
    <section className="rounded-2xl bg-card p-3 sm:p-5">
      <div>
        <h3 className="font-bold text-base text-ink">Your matching profile</h3>
        <p className="mt-1 text-slate-muted text-sm leading-relaxed">
          These signals help Findafew understand which groups may suit you.
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 sm:mt-5">
        <ProfileSignal icon={Brain} label="Personality" value={personality} />
        <ProfileSignal icon={Tags} label="Interests" value={interests.length} />
      </dl>

      <div className="mt-4 border-border/45 border-t pt-3 sm:mt-5 sm:pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-bold text-ink text-sm">
            Interests shaping your fit
          </p>
          <span className="shrink-0 text-slate-muted text-xs">
            {interests.length ? `${interests.length} saved` : "None saved"}
          </span>
        </div>

        <div className="mt-3 flex min-h-8 flex-wrap items-center gap-1.5">
          {visibleInterests.length ? (
            <>
              {visibleInterests.map((interest) => (
                <InterestPill key={interest.id} interest={interest} />
              ))}
              {interests.length > MAX_INTERESTS_PREVIEW ? (
                <button
                  type="button"
                  aria-expanded={showAllInterests}
                  onClick={() =>
                    setShowAllInterests((isExpanded) => !isExpanded)
                  }
                  className="rounded-full border border-transparent bg-muted px-2.5 py-1 font-semibold text-ink text-xs outline-none transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-soft-sm focus-visible:ring-1 focus-visible:ring-foreground"
                >
                  {showAllInterests
                    ? "Show less"
                    : `+${remainingInterestCount} more`}
                </button>
              ) : null}
            </>
          ) : (
            <p className="text-slate-muted text-sm">
              Add interests to make group suggestions more relevant.
            </p>
          )}
        </div>
      </div>

      {personalityAssessment.isError ? (
        <Button
          variant="ghost"
          size="xs"
          className="mt-3"
          onClick={() => void personalityAssessment.refetch()}
        >
          <RefreshCcw className="size-3.5" aria-hidden="true" />
          Retry personality status
        </Button>
      ) : null}

      <div className="mt-4 grid gap-2 sm:mt-5 sm:grid-cols-2">
        <Button asChild variant="outline" size="compact" className="min-w-0">
          <Link
            {...buildPersonalityEditNavigation({
              returnTo: "/settings",
              returnSection: "matching",
            })}
          >
            <BrainCircuit className="size-4" aria-hidden="true" />
            Review personality
          </Link>
        </Button>

        {interestsDisabled ? (
          <Button
            variant="outline"
            size="compact"
            className="min-w-0"
            disabled
            title={interestsDisabledReason ?? undefined}
          >
            <Tags className="size-4" aria-hidden="true" />
            Edit interests
          </Button>
        ) : (
          <Button asChild variant="outline" size="compact" className="min-w-0">
            <Link
              {...buildInterestsEditNavigation({
                returnTo: "/settings",
                returnSection: "matching",
              })}
            >
              <Tags className="size-4" aria-hidden="true" />
              Edit interests
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}

function ProfileSignal({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="relative min-w-0 overflow-hidden rounded-xl bg-background/55 p-2 sm:p-3">
      <Icon
        className="pointer-events-none absolute top-1/2 right-3 size-10 -translate-y-1/2 text-slate-muted/8"
        aria-hidden="true"
        strokeWidth={1.5}
      />
      <dt className="relative z-10 text-slate-muted text-xs">{label}</dt>
      <dd className="relative z-10 mt-1 truncate font-bold text-ink text-lg">
        {value}
      </dd>
    </div>
  );
}

function InterestPill({ interest }: { interest: UserInterest }) {
  return (
    <StatusPill
      size="sm"
      tone="teal"
      surface="outline"
      className="bg-primary-soft px-2.5 py-1 font-semibold"
    >
      {interest.name}
    </StatusPill>
  );
}

function getPersonalityValue(query: {
  data: PersonalityAssessmentState | undefined;
  isError: boolean;
  isPending: boolean;
}) {
  if (query.isPending) {
    return "—";
  }

  if (query.isError) {
    return "—";
  }

  const state = query.data;
  if (state?.draft) {
    return state.draft.personalityType;
  }

  if (state?.publicProfile) {
    return state.publicProfile.personalityType;
  }

  if (state?.current) {
    return state.current.personalityType;
  }

  return "—";
}
