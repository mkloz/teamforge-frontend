import type { NotificationPreferences } from "@/shared/schemas";
import { NotificationPreferenceRow } from "@/features/settings/components/settings-profile-form/settings-form-controls";

interface PrivacySettingsSectionProps {
  notificationPreferences: NotificationPreferences | null;
  isLoadingNotificationPreferences: boolean;
  isSavingNotificationPreferences: boolean;
  message: string | null;
  error: string | null;
  onChange: (
    values: Pick<
      NotificationPreferences,
      "showAgeOnProfile" | "showGenderOnProfile" | "showCityOnProfile"
    >,
  ) => Promise<void>;
}

export function PrivacySettingsSection({
  notificationPreferences,
  isLoadingNotificationPreferences,
  isSavingNotificationPreferences,
  message,
  error,
  onChange,
}: PrivacySettingsSectionProps) {
  const isDisabled =
    isLoadingNotificationPreferences ||
    isSavingNotificationPreferences ||
    !notificationPreferences;

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-ink">Profile Privacy</h2>
        <p className="text-sm leading-relaxed text-slate-muted">
          Choose which personal details appear on your public profile. These
          signals can still be used privately for compatibility.
        </p>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        <NotificationPreferenceRow
          checked={notificationPreferences?.showAgeOnProfile ?? true}
          title="Show age"
          description="Display your exact age on public profile surfaces."
          disabled={isDisabled}
          onToggle={() => {
            if (!notificationPreferences) {
              return;
            }

            void onChange({
              showAgeOnProfile: !notificationPreferences.showAgeOnProfile,
              showGenderOnProfile: notificationPreferences.showGenderOnProfile,
              showCityOnProfile: notificationPreferences.showCityOnProfile,
            });
          }}
        />

        <NotificationPreferenceRow
          checked={notificationPreferences?.showGenderOnProfile ?? true}
          title="Show gender"
          description="Display gender on your public profile."
          disabled={isDisabled}
          onToggle={() => {
            if (!notificationPreferences) {
              return;
            }

            void onChange({
              showAgeOnProfile: notificationPreferences.showAgeOnProfile,
              showGenderOnProfile: !notificationPreferences.showGenderOnProfile,
              showCityOnProfile: notificationPreferences.showCityOnProfile,
            });
          }}
        />

        <NotificationPreferenceRow
          checked={notificationPreferences?.showCityOnProfile ?? true}
          title="Show city"
          description="Display your city to other people."
          disabled={isDisabled}
          onToggle={() => {
            if (!notificationPreferences) {
              return;
            }

            void onChange({
              showAgeOnProfile: notificationPreferences.showAgeOnProfile,
              showGenderOnProfile: notificationPreferences.showGenderOnProfile,
              showCityOnProfile: !notificationPreferences.showCityOnProfile,
            });
          }}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-forge-teal/15 bg-forge-teal/5 p-4">
        <p className="text-sm leading-relaxed text-slate-muted">
          Exact location is never shown on public profiles. TeamForge stores
          private coordinates only for matching and uses city as the public
          fallback.
        </p>
      </div>

      {(message || error) && (
        <p
          className={`mt-4 text-sm ${error ? "text-destructive" : "text-forge-teal"}`}
        >
          {error ?? message}
        </p>
      )}
    </section>
  );
}
