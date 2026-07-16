import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Brain, RefreshCcw, Tags } from "lucide-react";
import { CandidateAvailabilityControl } from "@/features/settings/components/settings-profile-form/candidate-availability-control";
import {
  OfflineSettingsNotice,
  PreferenceStatusMessage,
  SectionHeading,
} from "@/features/settings/components/settings-profile-form/preference-section-parts";
import {
  MatchingThresholdControl,
  StatPill,
} from "@/features/settings/components/settings-profile-form/settings-form-controls";
import { normalizeTrustScore } from "@/features/settings/components/settings-profile-form/settings-formatters";
import type { CandidateAvailabilityState } from "@/features/settings/hooks/use-candidate-availability";
import { personalityAssessmentQueryOptions } from "@/shared/api/personality-assessment-query";
import { Button } from "@/shared/components/ui/button";
import { StatusPill } from "@/shared/components/ui/status-pill";
import {
  buildInterestsEditNavigation,
  buildPersonalityEditNavigation,
} from "@/shared/navigation";
import type { NotificationPreferences, User } from "@/shared/schemas";
import type { PersonalityAssessmentState } from "@/shared/schemas/personality-assessment";

interface MatchingSettingsSectionProps {
  candidateAvailability: CandidateAvailabilityState;
  currentUser: User | undefined;
  notificationPreferences: NotificationPreferences | null;
  isLoadingNotificationPreferences: boolean;
  isSavingNotificationPreferences: boolean;
  savingNotificationPreferenceKeys: ReadonlySet<keyof NotificationPreferences>;
  error: string | null;
  isOnline: boolean;
  onChange: (
    values: Pick<NotificationPreferences, "minCompatibilityScore">,
  ) => Promise<void>;
}

type MatchingPreferenceValues = Pick<
  NotificationPreferences,
  "minCompatibilityScore"
>;
type UserInterest = NonNullable<User["interests"]>[number];

interface MatchingPreferenceControlsProps {
  disabled: boolean;
  notificationPreferences: NotificationPreferences | null;
  onChange: (values: MatchingPreferenceValues) => Promise<void>;
  savingNotificationPreferenceKeys: ReadonlySet<keyof NotificationPreferences>;
}

const MAX_INTERESTS_PREVIEW = 12;

export function MatchingSettingsSection({
  candidateAvailability,
  currentUser,
  notificationPreferences,
  isLoadingNotificationPreferences,
  savingNotificationPreferenceKeys,
  error,
  isOnline,
  onChange,
}: MatchingSettingsSectionProps) {
  const isDisabled = getMatchingControlsDisabled({
    isLoadingNotificationPreferences,
    isOnline,
    notificationPreferences,
  });

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <SectionHeading
          title="Group proposals"
          description="TeamForge may show you an activity-led group proposal. You review every proposal before joining."
        />

        <MatchingStats currentUser={currentUser} />
      </div>

      {!isOnline ? (
        <OfflineSettingsNotice message="Reconnect before changing group proposal settings." />
      ) : null}

      <CandidateAvailabilityControl
        hasSavedLocation={
          currentUser?.locationLat != null && currentUser.locationLng != null
        }
        state={candidateAvailability}
      />

      <MatchingPreferenceControls
        disabled={isDisabled}
        notificationPreferences={notificationPreferences}
        onChange={onChange}
        savingNotificationPreferenceKeys={savingNotificationPreferenceKeys}
      />

      <PreferenceStatusMessage error={error} />

      <SavedInterestsPreview interests={currentUser?.interests} />

      <MatchingEditActions />
    </section>
  );
}

function MatchingStats({ currentUser }: { currentUser: User | undefined }) {
  const personalityAssessment = useQuery(personalityAssessmentQueryOptions());

  return (
    <div className="grid gap-3">
      <div className="grid gap-5 sm:grid-cols-2">
        <StatPill
          label="Personality type"
          value={getPersonalityStatusLabel(personalityAssessment)}
        />
        <StatPill label="Trust score" value={getTrustScoreLabel(currentUser)} />
      </div>
      {personalityAssessment.isError ? (
        <Button
          variant="ghost"
          size="sm"
          className="justify-self-start"
          onClick={() => void personalityAssessment.refetch()}
        >
          <RefreshCcw className="size-4" aria-hidden="true" />
          Retry personality status
        </Button>
      ) : personalityAssessment.isFetching && personalityAssessment.data ? (
        <p className="text-slate-muted text-xs" role="status">
          Refreshing personality status
        </p>
      ) : null}
    </div>
  );
}

function MatchingPreferenceControls({
  disabled,
  notificationPreferences,
  onChange,
  savingNotificationPreferenceKeys,
}: MatchingPreferenceControlsProps) {
  function updateMatchingPreference(values: MatchingPreferenceValues | null) {
    if (!values) {
      return;
    }

    void onChange(values);
  }

  return (
    <div className="grid gap-0 border-border border-t">
      <MatchingThresholdControl
        value={notificationPreferences?.minCompatibilityScore ?? 0}
        disabled={getMatchingPreferenceDisabled(
          disabled,
          savingNotificationPreferenceKeys,
          "minCompatibilityScore",
        )}
        onChange={(value) => {
          updateMatchingPreference(
            getCompatibilityScoreValues(notificationPreferences, value),
          );
        }}
      />
    </div>
  );
}

function getMatchingPreferenceDisabled(
  disabled: boolean,
  savingNotificationPreferenceKeys: ReadonlySet<keyof NotificationPreferences>,
  key: keyof MatchingPreferenceValues,
) {
  return disabled || savingNotificationPreferenceKeys.has(key);
}

function getCompatibilityScoreValues(
  notificationPreferences: NotificationPreferences | null,
  minCompatibilityScore: number,
): MatchingPreferenceValues | null {
  if (!notificationPreferences) {
    return null;
  }

  return {
    minCompatibilityScore,
  };
}

function SavedInterestsPreview({
  interests,
}: {
  interests: User["interests"];
}) {
  const visibleInterests = interests?.slice(0, MAX_INTERESTS_PREVIEW) ?? [];

  return (
    <div className="border-border border-t pt-6">
      <p className="font-semibold text-slate-muted text-xs">Interests</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {visibleInterests.length ? (
          visibleInterests.map((interest) => (
            <InterestPill key={interest.id} interest={interest} />
          ))
        ) : (
          <div className="flex min-h-24 w-full items-center justify-center text-center">
            <p className="text-slate-muted text-sm">
              No interests have been saved yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InterestPill({ interest }: { interest: UserInterest }) {
  return (
    <StatusPill
      size="sm"
      tone="teal"
      surface="outline"
      className="bg-primary/8 px-3 py-1 font-semibold"
    >
      {interest.name}
    </StatusPill>
  );
}

function MatchingEditActions() {
  return (
    <div className="flex flex-col gap-3 border-border border-t pt-5 md:flex-row md:items-center md:justify-between">
      <p className="text-slate-muted text-sm">
        Review your personality result or update your interests when they
        change.
      </p>

      <div className="responsive-action-grid grid w-full gap-3 md:max-w-92">
        <Button asChild variant="outline" size="compact" className="min-w-0">
          <Link
            {...buildPersonalityEditNavigation({
              returnTo: "/settings",
              returnSection: "matching",
            })}
          >
            <Brain className="size-4" aria-hidden="true" />
            Review personality
          </Link>
        </Button>
        <Button asChild variant="outline" size="compact" className="min-w-0">
          <Link
            {...buildInterestsEditNavigation({
              returnTo: "/settings",
              returnSection: "matching",
            })}
          >
            <Tags className="size-4" aria-hidden="true" />
            Update interests
          </Link>
        </Button>
      </div>
    </div>
  );
}

function getPersonalityStatusLabel(query: {
  data: PersonalityAssessmentState | undefined;
  isError: boolean;
  isPending: boolean;
}) {
  if (query.isPending) return "Loading…";
  if (query.isError) return "Unavailable";

  const state = query.data;
  if (state?.draft) {
    return `${state.draft.personalityType} draft`;
  }

  if (state?.publicProfile) {
    return `${state.publicProfile.personalityType} saved`;
  }

  if (state?.current) {
    return state.current.provenance === "LEGACY_CLIENT_RESULT"
      ? `${state.current.personalityType} · retake needed`
      : `${state.current.personalityType} saved`;
  }

  return "Not set";
}

function getMatchingControlsDisabled({
  isLoadingNotificationPreferences,
  isOnline,
  notificationPreferences,
}: Pick<
  MatchingSettingsSectionProps,
  "isLoadingNotificationPreferences" | "isOnline" | "notificationPreferences"
>) {
  return (
    !isOnline || isLoadingNotificationPreferences || !notificationPreferences
  );
}

function getTrustScoreLabel(currentUser: User | undefined) {
  return currentUser ? `${normalizeTrustScore(currentUser.trustScore)}%` : "0%";
}
