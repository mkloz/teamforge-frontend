import { Link } from "@tanstack/react-router";
import { Brain, Tags } from "lucide-react";
import {
  buildInterestsEditNavigation,
  buildPersonalityEditNavigation,
} from "@/features/onboarding/public/onboarding-navigation";
import {
  OfflineSettingsNotice,
  PreferenceStatusMessage,
  SectionHeading,
} from "@/features/settings/components/settings-profile-form/preference-section-parts";
import {
  MatchingThresholdControl,
  NotificationPreferenceRow,
  StatPill,
} from "@/features/settings/components/settings-profile-form/settings-form-controls";
import { normalizeTrustScore } from "@/features/settings/components/settings-profile-form/settings-formatters";
import { Button } from "@/shared/components/ui/button";
import { StatusPill } from "@/shared/components/ui/status-pill";
import type { NotificationPreferences, User } from "@/shared/schemas";

interface MatchingSettingsSectionProps {
  currentUser: User | undefined;
  notificationPreferences: NotificationPreferences | null;
  isLoadingNotificationPreferences: boolean;
  isSavingNotificationPreferences: boolean;
  savingNotificationPreferenceKeys: ReadonlySet<keyof NotificationPreferences>;
  error: string | null;
  isOnline: boolean;
  onChange: (
    values: Pick<
      NotificationPreferences,
      "autoMatchingEnabled" | "minCompatibilityScore"
    >,
  ) => Promise<void>;
}

type MatchingPreferenceValues = Pick<
  NotificationPreferences,
  "autoMatchingEnabled" | "minCompatibilityScore"
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
          title="Group forming"
          description="Decide how openly TeamForge can include you when compatible groups are being formed."
        />

        <MatchingStats currentUser={currentUser} />
      </div>

      {!isOnline ? (
        <OfflineSettingsNotice message="Reconnect before changing group forming settings." />
      ) : null}

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
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <StatPill
        label="Personality type"
        value={currentUser?.personalityType ?? "Not set"}
      />
      <StatPill label="Trust score" value={getTrustScoreLabel(currentUser)} />
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
    <div className="grid gap-0 border-border border-t lg:grid-cols-[1fr_1.4fr] lg:gap-8">
      <NotificationPreferenceRow
        checked={notificationPreferences?.autoMatchingEnabled ?? true}
        title="Automatic group forming"
        description="Allow TeamForge to include you when someone else forges an automatic group."
        disabled={getMatchingPreferenceDisabled(
          disabled,
          savingNotificationPreferenceKeys,
          "autoMatchingEnabled",
        )}
        onToggle={() => {
          updateMatchingPreference(
            getAutoMatchingToggleValues(notificationPreferences),
          );
        }}
      />

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

function getAutoMatchingToggleValues(
  notificationPreferences: NotificationPreferences | null,
): MatchingPreferenceValues | null {
  if (!notificationPreferences) {
    return null;
  }

  return {
    autoMatchingEnabled: !notificationPreferences.autoMatchingEnabled,
    minCompatibilityScore: notificationPreferences.minCompatibilityScore,
  };
}

function getCompatibilityScoreValues(
  notificationPreferences: NotificationPreferences | null,
  minCompatibilityScore: number,
): MatchingPreferenceValues | null {
  if (!notificationPreferences) {
    return null;
  }

  return {
    autoMatchingEnabled: notificationPreferences.autoMatchingEnabled,
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
        Update your answers and interests when your preferences shift.
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
            Update personality
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
