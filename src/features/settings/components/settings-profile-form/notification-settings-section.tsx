import { BellOff, BellRing, Send } from "lucide-react";
import { useId } from "react";

import {
  OfflineSettingsNotice,
  PreferenceGroup,
  PreferenceStatusMessage,
  SectionHeading,
} from "@/features/settings/components/settings-profile-form/preference-section-parts";
import type { BooleanSettingsPreferenceKey } from "@/features/settings/components/settings-profile-form/settings-form-types";
import {
  EMAIL_PREFERENCE_ITEMS,
  NOTIFICATION_PREFERENCE_ITEMS,
} from "@/features/settings/components/settings-profile-form/settings-preference-items";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { Label } from "@/shared/components/ui/label";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { Switch } from "@/shared/components/ui/switch";
import { useWebPushSubscription } from "@/shared/hooks/use-web-push-subscription";
import { cn } from "@/shared/lib/utils";
import type { NotificationPreferences } from "@/shared/schemas";
import {
  getWebPushControlState,
  type WebPushControlState,
  type WebPushDeviceState,
} from "./notification-device-state";

interface NotificationSettingsSectionProps {
  notificationPreferences: NotificationPreferences | null;
  isLoadingNotificationPreferences: boolean;
  isSavingNotificationPreferences: boolean;
  savingNotificationPreferenceKeys: ReadonlySet<keyof NotificationPreferences>;
  error: string | null;
  isOnline: boolean;
  onChange: (
    key: BooleanSettingsPreferenceKey,
    value: boolean,
  ) => Promise<void>;
}

export function NotificationSettingsSection({
  notificationPreferences,
  isLoadingNotificationPreferences,
  savingNotificationPreferenceKeys,
  error,
  isOnline,
  onChange,
}: NotificationSettingsSectionProps) {
  const shouldShowEmailDelivery =
    !isLoadingNotificationPreferences && notificationPreferences;

  return (
    <section className="flex flex-col gap-8">
      <SectionHeading
        title="Notification preferences"
        description="Choose which updates are also sent by email."
      />

      <PreferenceStatusMessage error={error} />

      {!isOnline ? (
        <OfflineSettingsNotice message="Reconnect before changing notification delivery." />
      ) : null}

      <WebPushDevicePreference isOnline={isOnline} />

      <PreferenceGroup
        title="In-app notifications"
        description="Choose which updates appear inside TeamForge."
        items={NOTIFICATION_PREFERENCE_ITEMS}
        notificationPreferences={notificationPreferences}
        isLoading={isLoadingNotificationPreferences}
        disabled={!isOnline}
        savingPreferenceKeys={savingNotificationPreferenceKeys}
        emptyMessage="We couldn't load your notification preferences right now."
        onChange={onChange}
      />

      {shouldShowEmailDelivery && (
        <PreferenceGroup
          title="Email delivery"
          description="Choose which alerts TeamForge sends by email."
          items={EMAIL_PREFERENCE_ITEMS}
          notificationPreferences={notificationPreferences}
          disabled={!isOnline}
          savingPreferenceKeys={savingNotificationPreferenceKeys}
          emptyMessage="We couldn't load your email preferences right now."
          onChange={onChange}
        />
      )}
    </section>
  );
}

function WebPushDevicePreference({ isOnline }: { isOnline: boolean }) {
  const switchId = useId();
  const push = useWebPushSubscription();
  const controlState = getWebPushControlState({ isOnline, push });
  const StatusIcon = push.isSubscribed ? BellRing : BellOff;

  async function handleToggle(checked: boolean) {
    if (checked) {
      await push.turnOn("settings");
      return;
    }

    await push.turnOff("settings");
  }

  return (
    <>
      <div>
        <h3 className="font-semibold text-base text-ink">Device delivery</h3>
        <p className="mt-1 text-slate-muted text-sm">
          Control whether this browser can show TeamForge alerts outside the
          app.
        </p>
      </div>

      <div className="border-border border-t">
        <div
          className={cn(
            "flex w-full flex-col gap-4 border-border border-b py-4 text-left transition-colors sm:flex-row sm:items-center sm:justify-between",
            push.isSubscribed && "border-primary/20",
            controlState.isDisabled && "opacity-80",
          )}
        >
          <div className="flex min-w-0 gap-3">
            <IconTile
              icon={StatusIcon}
              shape="circle"
              size="lg"
              tone={controlState.statusTone}
              className="mt-0.5"
              iconClassName="size-4.5"
            />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Label
                  htmlFor={switchId}
                  className="font-semibold text-ink text-sm"
                >
                  Push notifications
                </Label>
                <StatusPill
                  size="xs"
                  tone={controlState.statusTone}
                  surface="soft"
                  className="font-semibold text-xs"
                >
                  {controlState.status.label}
                </StatusPill>
              </div>
              <p
                id={`${switchId}-description`}
                className="mt-1 text-slate-muted text-xs leading-relaxed"
              >
                {controlState.status.description}
              </p>
            </div>
          </div>

          <WebPushDeviceActions
            controlState={controlState}
            push={push}
            switchId={switchId}
            onToggle={handleToggle}
          />
        </div>
      </div>
    </>
  );
}

function WebPushDeviceActions({
  controlState,
  onToggle,
  push,
  switchId,
}: {
  controlState: WebPushControlState;
  onToggle: (checked: boolean) => Promise<void>;
  push: WebPushDeviceState;
  switchId: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
      {push.isSubscribed && (
        <Button
          variant="outline"
          size="sm"
          loading={push.isSendingTest}
          disabled={controlState.sendTestDisabled}
          onClick={() => {
            void push.sendTest("settings");
          }}
        >
          <Send size={16} strokeWidth={2} aria-hidden="true" />
          Send test
        </Button>
      )}

      <Switch
        id={switchId}
        checked={push.isSubscribed}
        disabled={controlState.isDisabled}
        onCheckedChange={(checked) => {
          void onToggle(checked);
        }}
        aria-describedby={`${switchId}-description`}
        aria-label="Push notifications"
      />
    </div>
  );
}
