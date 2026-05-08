import {
  PreferenceStatusMessage,
  SectionHeading,
} from "@/features/settings/components/settings-profile-form/preference-section-parts";
import { NotificationPreferenceRow } from "@/features/settings/components/settings-profile-form/settings-form-controls";
import type { NotificationPreferences } from "@/shared/schemas";

const PRIVACY_TOGGLE_ITEMS = [
  {
    key: "showAgeOnProfile",
    title: "Show age",
    description: "Display your exact age on public profile surfaces.",
  },
  {
    key: "showGenderOnProfile",
    title: "Show gender",
    description: "Display gender on your public profile.",
  },
  {
    key: "showCityOnProfile",
    title: "Show city",
    description: "Display your city to other people.",
  },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<
    NotificationPreferences,
    "showAgeOnProfile" | "showGenderOnProfile" | "showCityOnProfile"
  >;
  title: string;
  description: string;
}>;

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
    <section className="flex flex-col gap-6">
      <SectionHeading
        title="Profile privacy"
        description="Choose which personal details appear on your public profile. These details can still quietly help TeamForge place you in better groups."
      />

      <div className="grid gap-0 border-border border-t lg:grid-cols-3 lg:gap-8">
        {PRIVACY_TOGGLE_ITEMS.map((item) => (
          <NotificationPreferenceRow
            key={item.key}
            checked={notificationPreferences?.[item.key] ?? true}
            title={item.title}
            description={item.description}
            disabled={isDisabled}
            onToggle={() => {
              if (!notificationPreferences) {
                return;
              }

              void onChange({
                showAgeOnProfile: notificationPreferences.showAgeOnProfile,
                showGenderOnProfile:
                  notificationPreferences.showGenderOnProfile,
                showCityOnProfile: notificationPreferences.showCityOnProfile,
                [item.key]: !notificationPreferences[item.key],
              });
            }}
          />
        ))}
      </div>

      <div className="border-forge-teal/35 border-l pl-4">
        <p className="text-slate-muted text-sm leading-relaxed">
          Exact location is never shown on public profiles. People only see your
          city when you allow it.
        </p>
      </div>

      <PreferenceStatusMessage message={message} error={error} />
    </section>
  );
}
