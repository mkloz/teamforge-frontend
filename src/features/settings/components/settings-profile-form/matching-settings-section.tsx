import { Link } from "@tanstack/react-router";

import { Button } from "@/shared/components/ui/button";
import {
  buildInterestsEditNavigation,
  buildPersonalityEditNavigation,
} from "@/shared/lib/onboarding-route";
import type { NotificationPreferences, User } from "@/shared/schemas";
import {
  MatchingThresholdControl,
  NotificationPreferenceRow,
  StatPill,
} from "@/features/settings/components/settings-profile-form/settings-form-controls";
import { normalizeTrustScore } from "@/features/settings/components/settings-profile-form/settings-formatters";

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
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">
            Matching Preferences Snapshot
          </h2>
          <p className="mt-1 text-sm text-slate-muted">
            This reflects what the compatibility engine already knows about you.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <StatPill
            label="Personality Type"
            value={currentUser?.personalityType ?? "Not set"}
          />
          <StatPill
            label="Trust Score"
            value={
              currentUser
                ? `${normalizeTrustScore(currentUser.trustScore)}%`
                : "0%"
            }
          />
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_1.3fr]">
        <NotificationPreferenceRow
          checked={notificationPreferences?.autoMatchingEnabled ?? true}
          title="Automatic matching"
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

      {(message || error) && (
        <p
          className={`mt-4 text-sm ${error ? "text-destructive" : "text-forge-teal"}`}
        >
          {error ?? message}
        </p>
      )}

      <div className="mt-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-muted">
          Interests
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {currentUser?.interests?.length ? (
            currentUser.interests.slice(0, 12).map((interest) => (
              <span
                key={interest.id}
                className="rounded-full border border-forge-teal/20 bg-forge-teal/8 px-3 py-1 text-xs font-semibold text-forge-teal"
              >
                {interest.name}
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-muted">
              No interests have been saved yet.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-muted">
          Update the signals TeamForge uses when forming your groups.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link
              {...buildPersonalityEditNavigation({
                returnTo: "/settings",
                returnSection: "matching",
              })}
            >
              Update Personality
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link
              {...buildInterestsEditNavigation({
                returnTo: "/settings",
                returnSection: "matching",
              })}
            >
              Update Interests
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
