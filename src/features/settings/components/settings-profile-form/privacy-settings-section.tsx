import { AccountExportSection } from "@/features/settings/components/settings-profile-form/account-export-section";
import {
  OfflineSettingsNotice,
  PreferenceStatusMessage,
} from "@/features/settings/components/settings-profile-form/preference-section-parts";
import { NotificationPreferenceRow } from "@/features/settings/components/settings-profile-form/settings-form-controls";
import type { useAccountExport } from "@/features/settings/hooks/use-account-export";
import type { NotificationPreferences } from "@/shared/schemas";

const PRIVACY_TOGGLE_ITEMS = [
  {
    key: "showAgeOnProfile",
    title: "Show age",
  },
  {
    key: "showGenderOnProfile",
    title: "Show gender",
  },
  {
    key: "showCityOnProfile",
    title: "Show city",
  },
  {
    key: "showFriendsListOnProfile",
    title: "Show friends",
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
}>;

interface PrivacySettingsSectionProps {
  accountExport: ReturnType<typeof useAccountExport>;
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
  accountExport,
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
    <div className="flex flex-col gap-9">
      <section className="flex flex-col gap-6">
        <p className="max-w-2xl text-slate-muted text-sm leading-relaxed">
          Hidden details may still be used when TeamForge forms groups.
        </p>

        {!isOnline ? (
          <OfflineSettingsNotice message="Reconnect before changing profile privacy." />
        ) : null}

        <div className="grid gap-0 border-border border-t lg:grid-cols-3 lg:gap-8">
          {PRIVACY_TOGGLE_ITEMS.map((item) => (
            <NotificationPreferenceRow
              key={item.key}
              checked={notificationPreferences?.[item.key] ?? true}
              title={item.title}
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

      <AccountExportSection state={accountExport} />
    </div>
  );
}
