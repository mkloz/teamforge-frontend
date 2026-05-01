import type { NotificationPreferences } from "@/shared/schemas";
import { NotificationPreferenceRow } from "@/features/settings/components/settings-profile-form/settings-form-controls";
import type { BooleanSettingsPreferenceKey } from "@/features/settings/components/settings-profile-form/settings-form-types";
import {
  EMAIL_PREFERENCE_ITEMS,
  NOTIFICATION_PREFERENCE_ITEMS,
} from "@/features/settings/components/settings-profile-form/settings-preference-items";

interface NotificationSettingsSectionProps {
  notificationPreferences: NotificationPreferences | null;
  isLoadingNotificationPreferences: boolean;
  isSavingNotificationPreferences: boolean;
  message: string | null;
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
  message,
  error,
  onChange,
}: NotificationSettingsSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-ink">Notification Preferences</h2>
        <p className="text-sm text-slate-muted">
          Choose which updates stay inside TeamForge and which ones should also
          land in your inbox.
        </p>
      </div>

      {(message || error) && (
        <p
          className={`mt-4 text-sm ${error ? "text-destructive" : "text-forge-teal"}`}
        >
          {error ?? message}
        </p>
      )}

      <div className="mt-6">
        <h3 className="text-base font-semibold text-ink">
          In-app notifications
        </h3>
        <p className="mt-1 text-sm text-slate-muted">
          These control the bell, drawer, badges, and in-app activity surfaces.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {isLoadingNotificationPreferences ? (
          <p className="text-sm text-slate-muted">
            Loading notification preferences...
          </p>
        ) : notificationPreferences ? (
          NOTIFICATION_PREFERENCE_ITEMS.map((item) => (
            <NotificationPreferenceRow
              key={item.key}
              checked={notificationPreferences[item.key]}
              title={item.title}
              description={item.description}
              disabled={isSavingNotificationPreferences}
              onToggle={() => {
                void onChange(item.key, !notificationPreferences[item.key]);
              }}
            />
          ))
        ) : (
          <p className="text-sm text-slate-muted">
            We couldn't load your notification preferences right now.
          </p>
        )}
      </div>

      {!isLoadingNotificationPreferences && notificationPreferences && (
        <>
          <div className="mt-8">
            <h3 className="text-base font-semibold text-ink">Email delivery</h3>
            <p className="mt-1 text-sm text-slate-muted">
              These control which alerts TeamForge is allowed to send to your
              inbox.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {EMAIL_PREFERENCE_ITEMS.map((item) => (
              <NotificationPreferenceRow
                key={item.key}
                checked={notificationPreferences[item.key]}
                title={item.title}
                description={item.description}
                disabled={isSavingNotificationPreferences}
                onToggle={() => {
                  void onChange(item.key, !notificationPreferences[item.key]);
                }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
