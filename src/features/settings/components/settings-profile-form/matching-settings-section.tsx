import type { CandidateAvailabilityState } from "@/features/forge/public/candidate-availability";
import { useCompatibilityInputLock } from "@/features/forge-proposals/public/proposal-review";
import { GroupReachabilityControl } from "@/features/settings/components/settings-profile-form/group-reachability-control";
import { MatchingProfileCard } from "@/features/settings/components/settings-profile-form/matching-profile-card";
import {
  OfflineSettingsNotice,
  PreferenceStatusMessage,
} from "@/features/settings/components/settings-profile-form/preference-section-parts";
import { MatchingThresholdControl } from "@/features/settings/components/settings-profile-form/settings-form-controls";
import type { ActivityInviteAvailabilityState } from "@/features/settings/hooks/use-activity-invite-availability";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";
import type { NotificationPreferences, User } from "@/shared/schemas";

interface MatchingSettingsSectionProps {
  activityInviteAvailability: ActivityInviteAvailabilityState;
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
interface MatchingPreferenceControlsProps {
  disabled: boolean;
  notificationPreferences: NotificationPreferences | null;
  onChange: (values: MatchingPreferenceValues) => Promise<void>;
  savingNotificationPreferenceKeys: ReadonlySet<keyof NotificationPreferences>;
}

export function MatchingSettingsSection({
  activityInviteAvailability,
  candidateAvailability,
  currentUser,
  notificationPreferences,
  isLoadingNotificationPreferences,
  savingNotificationPreferenceKeys,
  error,
  isOnline,
  onChange,
}: MatchingSettingsSectionProps) {
  const compatibilityInputLock = useCompatibilityInputLock();
  const isDisabled =
    compatibilityInputLock.isBlocked ||
    getMatchingControlsDisabled({
      isLoadingNotificationPreferences,
      isOnline,
      notificationPreferences,
    });

  return (
    <section className="flex flex-col gap-4">
      <PreferenceStatusMessage error={error} />
      {!isOnline ? (
        <OfflineSettingsNotice message="Reconnect before changing group proposal settings." />
      ) : null}

      {compatibilityInputLock.isBlocked ? (
        <CompatibilityInputLockNotice lock={compatibilityInputLock} />
      ) : null}

      <MatchingProfileCard
        currentUser={currentUser}
        interestsDisabled={compatibilityInputLock.isBlocked}
        interestsDisabledReason={compatibilityInputLock.message}
      />

      <MatchingPreferenceControls
        disabled={isDisabled}
        notificationPreferences={notificationPreferences}
        onChange={async (values) => {
          if (!compatibilityInputLock.isBlocked) {
            await onChange(values);
          }
        }}
        savingNotificationPreferenceKeys={savingNotificationPreferenceKeys}
      />

      <GroupReachabilityControl
        activityInvites={activityInviteAvailability}
        candidateProposals={candidateAvailability}
        hasSavedLocation={
          currentUser?.locationLat != null && currentUser.locationLng != null
        }
      />
    </section>
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
    <div>
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

function CompatibilityInputLockNotice({
  lock,
}: {
  lock: ReturnType<typeof useCompatibilityInputLock>;
}) {
  return (
    <Notice
      role={lock.status === "error" ? "alert" : "status"}
      tone={lock.status === "error" ? "warning" : "neutral"}
      action={
        lock.status === "error" ? (
          <Button variant="ghost" size="xs" onClick={() => void lock.retry()}>
            Try again
          </Button>
        ) : null
      }
    >
      {lock.message}
    </Notice>
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
