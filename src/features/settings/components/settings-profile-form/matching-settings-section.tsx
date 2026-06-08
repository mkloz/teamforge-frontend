import { Link } from "@tanstack/react-router";
import { Brain, Tags } from "lucide-react";
import {
  buildInterestsEditNavigation,
  buildPersonalityEditNavigation,
} from "@/features/onboarding/lib/onboarding-route";
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

export function MatchingSettingsSection({
  currentUser,
  notificationPreferences,
  isLoadingNotificationPreferences,
  savingNotificationPreferenceKeys,
  error,
  isOnline,
  onChange,
}: MatchingSettingsSectionProps) {
  const isDisabled =
    !isOnline || isLoadingNotificationPreferences || !notificationPreferences;

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

      {!isOnline ? (
        <OfflineSettingsNotice message="Reconnect before changing group forming settings." />
      ) : null}

      <div className="grid gap-0 border-border border-t lg:grid-cols-[1fr_1.4fr] lg:gap-8">
        <NotificationPreferenceRow
          checked={notificationPreferences?.autoMatchingEnabled ?? true}
          title="Automatic group forming"
          description="Allow TeamForge to include you when someone else forges an automatic group."
          disabled={
            isDisabled ||
            savingNotificationPreferenceKeys.has("autoMatchingEnabled")
          }
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
          disabled={
            isDisabled ||
            savingNotificationPreferenceKeys.has("minCompatibilityScore")
          }
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

      <PreferenceStatusMessage error={error} />

      <div className="border-border border-t pt-6">
        <p className="font-semibold text-slate-muted text-xs">Interests</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {currentUser?.interests?.length ? (
            currentUser.interests.slice(0, 12).map((interest) => (
              <StatusPill
                key={interest.id}
                size="sm"
                tone="teal"
                surface="outline"
                className="bg-primary/8 px-3 py-1 font-semibold"
              >
                {interest.name}
              </StatusPill>
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
    </section>
  );
}
