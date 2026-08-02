import { BellDot, BellOff, BellRing, Mail, Send } from "lucide-react";
import { useId } from "react";

import {
  OfflineSettingsNotice,
  PreferenceStatusMessage,
} from "@/features/settings/components/settings-profile-form/preference-section-parts";
import type { BooleanSettingsPreferenceKey } from "@/features/settings/components/settings-profile-form/settings-form-types";
import { NOTIFICATION_CHANNEL_ITEMS } from "@/features/settings/components/settings-profile-form/settings-preference-items";
import { SettingsPreferencesSkeleton } from "@/features/settings/components/settings-section-skeletons";
import { Button } from "@/shared/components/ui/button";
import {
  GroupedMenuAction,
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
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
import { NotificationScheduleControls } from "./notification-schedule-controls";

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
  onScheduleChange: (
    values: Pick<
      NotificationPreferences,
      | "notificationHardMute"
      | "notificationTimeZoneId"
      | "quietHoursStartMinute"
      | "quietHoursEndMinute"
    >,
  ) => Promise<void>;
}

const NOTIFICATION_DELIVERY_CHANNELS = [
  {
    id: "in-app",
    title: "In app",
    description: "Keep selected updates inside TeamForge.",
    icon: BellDot,
    preferenceKey: "inAppKey",
  },
  {
    id: "email",
    title: "Email",
    description: "Send selected updates to your inbox.",
    icon: Mail,
    preferenceKey: "emailKey",
  },
] as const;

export function NotificationSettingsSection({
  notificationPreferences,
  isLoadingNotificationPreferences,
  savingNotificationPreferenceKeys,
  error,
  isOnline,
  onChange,
  onScheduleChange,
}: NotificationSettingsSectionProps) {
  return (
    <section className="flex flex-col gap-9">
      <PreferenceStatusMessage error={error} />

      {!isOnline ? (
        <OfflineSettingsNotice message="Reconnect before changing notification delivery." />
      ) : null}

      <WebPushDevicePreference isOnline={isOnline} />

      {notificationPreferences ? (
        <NotificationScheduleControls
          disabled={!isOnline}
          preferences={notificationPreferences}
          savingPreferenceKeys={savingNotificationPreferenceKeys}
          onChange={onScheduleChange}
        />
      ) : null}

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
      <div className="px-1">
        <h2 className="font-bold text-ink text-xl">Choose your channels</h2>
        <p className="mt-1 text-slate-muted text-sm leading-relaxed">
          Decide which updates stay in TeamForge and which also reach your
          inbox.
        </p>
      </div>

      {isLoading ? (
        <div className="mt-5">
          <SettingsPreferencesSkeleton />
        </div>
      ) : notificationPreferences ? (
        <fieldset
          className="mt-5 min-w-0"
          aria-label="Notification delivery channels"
        >
          <legend className="sr-only">Notification delivery channels</legend>
          <div className="grid gap-7 lg:grid-cols-2">
            {NOTIFICATION_DELIVERY_CHANNELS.map((channel) => (
              <NotificationChannelMenu
                key={channel.id}
                channel={channel}
                notificationPreferences={notificationPreferences}
                disabled={!isOnline}
                savingPreferenceKeys={savingPreferenceKeys}
                onChange={onChange}
              />
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="mt-4 text-slate-muted text-sm">
          Notification preferences are unavailable right now.
        </p>
      )}
    </section>
  );
}

function NotificationChannelMenu({
  channel,
  disabled,
  notificationPreferences,
  savingPreferenceKeys,
  onChange,
}: {
  channel: (typeof NOTIFICATION_DELIVERY_CHANNELS)[number];
  disabled: boolean;
  notificationPreferences: NotificationPreferences;
  savingPreferenceKeys: ReadonlySet<keyof NotificationPreferences>;
  onChange: (
    key: BooleanSettingsPreferenceKey,
    value: boolean,
  ) => Promise<void>;
}) {
  const headingId = useId();
  const ChannelIcon = channel.icon;

  return (
    <section aria-labelledby={headingId} className="min-w-0">
      <div className="flex items-center gap-3 px-1">
        <IconTile icon={ChannelIcon} shape="circle" size="md" tone="teal" />
        <div className="min-w-0">
          <h3 id={headingId} className="font-bold text-ink text-sm">
            {channel.title}
          </h3>
          <p className="mt-0.5 text-slate-muted text-xs">
            {channel.description}
          </p>
        </div>
      </div>

      <GroupedMenuList className="mt-3">
        {NOTIFICATION_CHANNEL_ITEMS.map((item) => {
          const preferenceKey = item[channel.preferenceKey];

          return (
            <GroupedMenuItem key={preferenceKey} className="bg-background/55">
              <NotificationChannelToggleRow
                channelTitle={channel.title}
                checked={notificationPreferences[preferenceKey]}
                disabled={disabled || savingPreferenceKeys.has(preferenceKey)}
                item={item}
                onToggle={() => {
                  void onChange(
                    preferenceKey,
                    !notificationPreferences[preferenceKey],
                  );
                }}
              />
            </GroupedMenuItem>
          );
        })}
      </GroupedMenuList>
    </section>
  );
}

function NotificationChannelToggleRow({
  channelTitle,
  checked,
  disabled,
  item,
  onToggle,
}: {
  channelTitle: string;
  checked: boolean;
  disabled: boolean;
  item: (typeof NOTIFICATION_CHANNEL_ITEMS)[number];
  onToggle: () => void;
}) {
  const switchId = useId();
  const ItemIcon = item.icon;

  return (
    <GroupedMenuAction
      selected={checked}
      className={cn(
        "min-h-12 gap-3 px-3 py-2 sm:min-h-13 sm:px-4 sm:py-2.5",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <ItemIcon
        className={cn(
          "size-4 shrink-0",
          checked ? "text-primary" : "text-slate-muted",
        )}
        aria-hidden="true"
      />
      <Label
        htmlFor={switchId}
        className={cn(
          "min-w-0 flex-1 font-semibold text-ink text-sm",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        {item.title}
        <span className="sr-only">. {item.description}</span>
      </Label>
      <Switch
        id={switchId}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onToggle}
        aria-label={`${item.title} ${channelTitle.toLowerCase()} notifications`}
        className="shrink-0"
      />
    </GroupedMenuAction>
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
    <section>
      <div className="px-1">
        <h2 className="font-bold text-ink text-xl">This device</h2>
        <p className="mt-1 text-slate-muted text-sm leading-relaxed">
          Receive time-sensitive updates even when TeamForge is closed.
        </p>
      </div>

      <GroupedMenuList aria-label="Push notification delivery" className="mt-4">
        <GroupedMenuItem>
          <GroupedMenuAction
            selected={push.isSubscribed}
            className={cn(
              "grid min-h-18 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-2.5 gap-y-3 p-3 sm:flex sm:min-h-20 sm:items-center sm:gap-4 sm:px-5 sm:py-4",
              controlState.isDisabled && "opacity-80",
            )}
          >
            <div className="contents sm:flex sm:min-w-0 sm:flex-1 sm:gap-3">
              <IconTile
                icon={StatusIcon}
                shape="circle"
                size="lg"
                tone={controlState.statusTone}
                className="mt-1 size-8 sm:mt-0 sm:size-10"
                iconClassName="size-4 sm:size-4.5"
              />

              <div className="min-w-0">
                <div className="flex flex-nowrap items-center gap-1.5">
                  <Label
                    htmlFor={switchId}
                    className="whitespace-nowrap font-semibold text-ink text-sm"
                  >
                    Push notifications
                  </Label>
                  <StatusPill
                    size="2xs"
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
          </GroupedMenuAction>
        </GroupedMenuItem>
      </GroupedMenuList>
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
    <div className="contents sm:flex sm:shrink-0 sm:items-center sm:gap-3">
      {push.isSubscribed && (
        <Button
          variant="outline"
          size="sm"
          className="col-span-2 col-start-2 row-start-2 w-fit justify-self-start sm:col-auto sm:row-auto sm:justify-self-auto"
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
        className="col-start-3 row-start-1 shrink-0"
      />
    </div>
  );
}
