import {
  OfflineSettingsNotice,
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
  {
    key: "showFriendsListOnProfile",
    title: "Show friends",
    description: "Display your friends list on your public profile.",
  },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<
    NotificationPreferences,
    | "showAgeOnProfile"
    | "showGenderOnProfile"
    | "showCityOnProfile"
    | "showFriendsListOnProfile"
  >;
  title: string;
  description: string;
}>;

interface PrivacySettingsSectionProps {
  notificationPreferences: NotificationPreferences | null;
  isLoadingNotificationPreferences: boolean;
  isSavingNotificationPreferences: boolean;
  savingNotificationPreferenceKeys: ReadonlySet<keyof NotificationPreferences>;
  error: string | null;
  isOnline: boolean;
  onChange: (
    values: Pick<
      NotificationPreferences,
      | "showAgeOnProfile"
      | "showGenderOnProfile"
      | "showCityOnProfile"
      | "showFriendsListOnProfile"
    >,
  ) => Promise<void>;
}

export function PrivacySettingsSection({
  notificationPreferences,
  isLoadingNotificationPreferences,
  savingNotificationPreferenceKeys,
  error,
  isOnline,
  onChange,
}: PrivacySettingsSectionProps) {
  const isDisabled =
    !isOnline || isLoadingNotificationPreferences || !notificationPreferences;

  return (
    <section className="flex flex-col gap-6">
      <SectionHeading
        title="Profile privacy"
        description="Choose which details appear on your public profile. Hidden details may still be used when TeamForge forms groups."
      />

      {!isOnline ? (
        <OfflineSettingsNotice message="Reconnect before changing profile privacy." />
      ) : null}

      <div className="grid gap-0 border-border border-t lg:grid-cols-3 lg:gap-8">
        {PRIVACY_TOGGLE_ITEMS.map((item) => (
          <NotificationPreferenceRow
            key={item.key}
            checked={notificationPreferences?.[item.key] ?? true}
            title={item.title}
            description={item.description}
            disabled={
              isDisabled || savingNotificationPreferenceKeys.has(item.key)
            }
            onToggle={() => {
              if (!notificationPreferences) {
                return;
              }

              void onChange({
                showAgeOnProfile: notificationPreferences.showAgeOnProfile,
                showGenderOnProfile:
                  notificationPreferences.showGenderOnProfile,
                showCityOnProfile: notificationPreferences.showCityOnProfile,
                showFriendsListOnProfile:
                  notificationPreferences.showFriendsListOnProfile,
                [item.key]: !notificationPreferences[item.key],
              });
            }}
          />
        ))}
      </div>

      <div className="border-primary/35 border-l pl-4">
        <p className="text-slate-muted text-sm leading-relaxed">
          Coordinates are not shown on public profiles. Your city appears only
          when you turn on Show city.
        </p>
      </div>

      <PreferenceStatusMessage error={error} />
    </section>
  );
}
