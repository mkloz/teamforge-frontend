import { Link } from "@tanstack/react-router";
import {
  buildInterestsEditNavigation,
  buildPersonalityEditNavigation,
} from "@/features/onboarding/lib/onboarding-route";
import {
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
import type { NotificationPreferences, User } from "@/shared/schemas";

interface MatchingSettingsSectionProps {
  currentUser: User | undefined;
  notificationPreferences: NotificationPreferences | null;
  isLoadingNotificationPreferences: boolean;
  isSavingNotificationPreferences: boolean;
  message: string | null;
  error: string | null;
  onChange: (
    values: Pick<
      NotificationPreferences,
      "autoMatchingEnabled" | "minCompatibilityScore"
    >,
  ) => Promise<void>;
}

export function MatchingSettingsSection({
  currentUser,
  notificationPreferences,
  isLoadingNotificationPreferences,
  isSavingNotificationPreferences,
  message,
  error,
  onChange,
}: MatchingSettingsSectionProps) {
  const isDisabled =
    isLoadingNotificationPreferences ||
    isSavingNotificationPreferences ||
    !notificationPreferences;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <SectionHeading
          title="Group forming"
          description="Decide how openly TeamForge can include you when compatible groups are being formed."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <StatPill
            label="Personality type"
            value={currentUser?.personalityType ?? "Not set"}
          />
          <StatPill
            label="Trust score"
            value={
              currentUser
                ? `${normalizeTrustScore(currentUser.trustScore)}%`
                : "0%"
            }
          />
        </div>
      </div>

      <div className="grid gap-0 border-border border-t lg:grid-cols-[1fr_1.4fr] lg:gap-8">
        <NotificationPreferenceRow
          checked={notificationPreferences?.autoMatchingEnabled ?? true}
          title="Automatic group forming"
          description="Allow TeamForge to include you when someone else forges an automatic group."
          disabled={isDisabled}
          onToggle={() => {
            if (!notificationPreferences) {
              return;
            }

            void onChange({
              autoMatchingEnabled: !notificationPreferences.autoMatchingEnabled,
              minCompatibilityScore:
                notificationPreferences.minCompatibilityScore,
            });
          }}
        />

        <MatchingThresholdControl
          value={notificationPreferences?.minCompatibilityScore ?? 0}
          disabled={isDisabled}
          onChange={(value) => {
            if (!notificationPreferences) {
              return;
            }

            void onChange({
              autoMatchingEnabled: notificationPreferences.autoMatchingEnabled,
              minCompatibilityScore: value,
            });
          }}
        />
      </div>

      <PreferenceStatusMessage message={message} error={error} />

      <div className="border-border border-t pt-6">
        <p className="font-semibold text-slate-muted text-xs uppercase tracking-widest">
          Interests
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {currentUser?.interests?.length ? (
            currentUser.interests.slice(0, 12).map((interest) => (
              <span
                key={interest.id}
                className="rounded-full border border-forge-teal/20 bg-forge-teal/8 px-3 py-1 font-semibold text-forge-teal text-xs"
              >
                {interest.name}
              </span>
            ))
          ) : (
            <p className="text-slate-muted text-sm">
              No interests have been saved yet.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-border border-t pt-5 md:flex-row md:items-center md:justify-between">
        <p className="text-slate-muted text-sm">
          Update your answers and interests when your preferences shift.
        </p>

        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-3 md:max-w-92">
          <Button asChild variant="outline" className="min-w-0 px-3">
            <Link
              {...buildPersonalityEditNavigation({
                returnTo: "/settings",
                returnSection: "matching",
              })}
            >
              Update personality
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-w-0 px-3">
            <Link
              {...buildInterestsEditNavigation({
                returnTo: "/settings",
                returnSection: "matching",
              })}
            >
              Update interests
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
