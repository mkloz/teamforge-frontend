import { BellOff, BellRing, Send } from "lucide-react";
import { useId } from "react";

import {
  OfflineSettingsNotice,
  PreferenceStatusMessage,
} from "@/features/settings/components/settings-profile-form/preference-section-parts";
import type { BooleanSettingsPreferenceKey } from "@/features/settings/components/settings-profile-form/settings-form-types";
import { NOTIFICATION_CHANNEL_ITEMS } from "@/features/settings/components/settings-profile-form/settings-preference-items";
import { SettingsPreferencesSkeleton } from "@/features/settings/components/settings-section-skeletons";
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
  return (
    <section className="flex flex-col gap-8">
      <PreferenceStatusMessage error={error} />

      {!isOnline ? (
        <OfflineSettingsNotice message="Reconnect before changing notification delivery." />
      ) : null}

      <WebPushDevicePreference isOnline={isOnline} />

      <NotificationDeliveryPreferences
        notificationPreferences={notificationPreferences}
        isLoading={isLoadingNotificationPreferences}
        isOnline={isOnline}
        savingPreferenceKeys={savingNotificationPreferenceKeys}
        onChange={onChange}
      />
    </section>
  );
}

function NotificationDeliveryPreferences({
  notificationPreferences,
  isLoading,
  isOnline,
  savingPreferenceKeys,
  onChange,
}: {
  notificationPreferences: NotificationPreferences | null;
  isLoading: boolean;
  isOnline: boolean;
  savingPreferenceKeys: ReadonlySet<keyof NotificationPreferences>;
  onChange: (
    key: BooleanSettingsPreferenceKey,
    value: boolean,
  ) => Promise<void>;
}) {
  return (
    <section>
      <h2 className="font-bold text-ink text-xl">Updates</h2>

      {isLoading ? (
        <SettingsPreferencesSkeleton />
      ) : notificationPreferences ? (
        <fieldset
          className="mt-4 min-w-0 overflow-hidden border-border border-y"
          aria-label="Notification delivery channels"
        >
          <div className="grid grid-cols-[minmax(0,1fr)_3rem_3rem] items-center gap-2 border-border border-b py-3 text-center sm:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem]">
            <span className="text-left font-semibold text-slate-muted text-xs">
              Update
            </span>
            <span className="font-semibold text-slate-muted text-xs">
              In app
            </span>
            <span className="font-semibold text-slate-muted text-xs">
              Email
            </span>
          </div>

          {NOTIFICATION_CHANNEL_ITEMS.map((item) => (
            <NotificationChannelRow
              key={item.inAppKey}
              item={item}
              notificationPreferences={notificationPreferences}
              disabled={!isOnline}
              savingPreferenceKeys={savingPreferenceKeys}
              onChange={onChange}
            />
          ))}
        </fieldset>
      ) : (
        <p className="mt-4 text-slate-muted text-sm">
          Notification preferences are unavailable right now.
        </p>
      )}
    </section>
  );
}

function NotificationChannelRow({
  disabled,
  item,
  notificationPreferences,
  savingPreferenceKeys,
  onChange,
}: {
  disabled: boolean;
  item: (typeof NOTIFICATION_CHANNEL_ITEMS)[number];
  notificationPreferences: NotificationPreferences;
  savingPreferenceKeys: ReadonlySet<keyof NotificationPreferences>;
  onChange: (
    key: BooleanSettingsPreferenceKey,
    value: boolean,
  ) => Promise<void>;
}) {
  const inAppId = useId();
  const emailId = useId();

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_3rem_3rem] items-center gap-2 border-border border-b py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem]">
      <div className="min-w-0 pr-2">
        <p className="font-semibold text-ink text-sm">{item.title}</p>
        <p className="mt-1 text-slate-muted text-xs leading-relaxed">
          {item.description}
        </p>
      </div>

      <div className="flex justify-center">
        <Switch
          id={inAppId}
          checked={notificationPreferences[item.inAppKey]}
          disabled={disabled || savingPreferenceKeys.has(item.inAppKey)}
          onCheckedChange={() => {
            void onChange(
              item.inAppKey,
              !notificationPreferences[item.inAppKey],
            );
          }}
          aria-label={`${item.title} in-app notifications`}
        />
      </div>

      <div className="flex justify-center">
        <Switch
          id={emailId}
          checked={notificationPreferences[item.emailKey]}
          disabled={disabled || savingPreferenceKeys.has(item.emailKey)}
          onCheckedChange={() => {
            void onChange(
              item.emailKey,
              !notificationPreferences[item.emailKey],
            );
          }}
          aria-label={`${item.title} email notifications`}
        />
      </div>
    </div>
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
    <section
      className={cn(
        "flex w-full flex-col gap-4 border-border border-y py-4 text-left transition-colors sm:flex-row sm:items-center sm:justify-between",
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
    </section>
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
