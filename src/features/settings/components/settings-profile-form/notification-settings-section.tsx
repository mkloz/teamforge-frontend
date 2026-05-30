import {
  PreferenceGroup,
  PreferenceStatusMessage,
  SectionHeading,
} from "@/features/settings/components/settings-profile-form/preference-section-parts";
import type { BooleanSettingsPreferenceKey } from "@/features/settings/components/settings-profile-form/settings-form-types";
import {
  EMAIL_PREFERENCE_ITEMS,
  NOTIFICATION_PREFERENCE_ITEMS,
} from "@/features/settings/components/settings-profile-form/settings-preference-items";
import type { NotificationPreferences } from "@/shared/schemas";

interface NotificationSettingsSectionProps {
  notificationPreferences: NotificationPreferences | null;
  isLoadingNotificationPreferences: boolean;
  isSavingNotificationPreferences: boolean;
  error: string | null;
  onChange: (
    key: BooleanSettingsPreferenceKey,
    value: boolean,
  ) => Promise<void>;
}

export function NotificationSettingsSection({
  notificationPreferences,
  isLoadingNotificationPreferences,
  isSavingNotificationPreferences,
  error,
  onChange,
}: NotificationSettingsSectionProps) {
  const shouldShowEmailDelivery =
    !isLoadingNotificationPreferences && notificationPreferences;

  return (
    <section className="flex flex-col gap-8">
      <SectionHeading
        title="Notification preferences"
        description="Choose which updates stay inside TeamForge and which ones should also land in your inbox."
      />

      <PreferenceStatusMessage error={error} />

      <PreferenceGroup
        title="In-app notifications"
        description="These control the bell, drawer, badges, and in-app activity surfaces."
        items={NOTIFICATION_PREFERENCE_ITEMS}
        notificationPreferences={notificationPreferences}
        isLoading={isLoadingNotificationPreferences}
        isSaving={isSavingNotificationPreferences}
        emptyMessage="We couldn't load your notification preferences right now."
        onChange={onChange}
      />

      {shouldShowEmailDelivery && (
        <PreferenceGroup
          title="Email delivery"
          description="These control which alerts TeamForge is allowed to send to your inbox."
          items={EMAIL_PREFERENCE_ITEMS}
          notificationPreferences={notificationPreferences}
          isSaving={isSavingNotificationPreferences}
          emptyMessage="We couldn't load your email preferences right now."
          onChange={onChange}
        />
      )}
    </section>
  );
}
