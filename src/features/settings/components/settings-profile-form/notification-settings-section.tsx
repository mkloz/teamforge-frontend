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
import {
  StatusPill,
  type StatusPillTone,
} from "@/shared/components/ui/status-pill";
import { Switch } from "@/shared/components/ui/switch";
import { useWebPushSubscription } from "@/shared/hooks/use-web-push-subscription";
import { cn } from "@/shared/lib/utils";
import type { NotificationPreferences } from "@/shared/schemas";

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
        description="Choose which updates stay inside TeamForge and which ones should also land in your inbox."
      />

      <PreferenceStatusMessage error={error} />

      {!isOnline ? (
        <OfflineSettingsNotice message="Reconnect before changing notification delivery." />
      ) : null}

      <WebPushDevicePreference isOnline={isOnline} />

      <PreferenceGroup
        title="In-app notifications"
        description="These control the bell, drawer, badges, and in-app activity surfaces."
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
          description="These control which alerts TeamForge is allowed to send to your inbox."
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

type WebPushDeviceState = ReturnType<typeof useWebPushSubscription>;

function getWebPushDeviceStatus(push: WebPushDeviceState) {
  if (!push.support.isSupported) {
    return {
      label: "Unavailable",
      description: "This browser cannot receive TeamForge push notifications.",
      tone: "muted",
    } as const;
  }

  if (!push.isAuthenticated) {
    return {
      label: "Sign in needed",
      description: "Sign in before turning on push notifications.",
      tone: "muted",
    } as const;
  }

  if (!push.isOnline) {
    return {
      label: "Offline",
      description:
        "Reconnect before changing push notifications for this device.",
      tone: "attention",
    } as const;
  }

  if (push.isPublicKeyLoading) {
    return {
      label: "Checking",
      description: "Checking whether this TeamForge environment can send push.",
      tone: "muted",
    } as const;
  }

  if (!push.isWebPushEnabled) {
    return {
      label: "Not enabled",
      description:
        "Push delivery is not enabled for this TeamForge environment yet.",
      tone: "muted",
    } as const;
  }

  if (push.permission === "denied") {
    return {
      label: "Blocked",
      description:
        "Notifications are blocked in this browser. Turn them back on in site settings.",
      tone: "attention",
    } as const;
  }

  if (push.isSubscribed) {
    return {
      label: "On",
      description:
        "This device can show group invites, messages, and plan updates outside the app.",
      tone: "on",
    } as const;
  }

  if (push.browserEndpoint) {
    return {
      label: "Ready",
      description:
        "This browser already has permission. Turn it on to reconnect this device.",
      tone: "attention",
    } as const;
  }

  return {
    label: "Off",
    description:
      "Turn this on to let TeamForge notify this device when something needs your attention.",
    tone: "muted",
  } as const;
}

function WebPushDevicePreference({ isOnline }: { isOnline: boolean }) {
  const switchId = useId();
  const push = useWebPushSubscription();
  const status = getWebPushDeviceStatus(push);
  const StatusIcon = push.isSubscribed ? BellRing : BellOff;
  const statusTone: StatusPillTone =
    status.tone === "on"
      ? "teal"
      : status.tone === "attention"
        ? "amber"
        : "muted";
  const isBusy =
    push.isTurningOn || push.isTurningOff || push.isCheckingBrowserSubscription;
  const canToggle =
    push.isOnline && (push.isSubscribed || push.canRequestPermission);
  const isDisabled =
    !isOnline ||
    !push.isOnline ||
    isBusy ||
    push.isPublicKeyLoading ||
    !canToggle;

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
            isDisabled && "opacity-80",
          )}
        >
          <div className="flex min-w-0 gap-3">
            <IconTile
              icon={StatusIcon}
              shape="circle"
              size="lg"
              tone={statusTone}
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
                  tone={statusTone}
                  surface="soft"
                  className="font-semibold text-xs"
                >
                  {status.label}
                </StatusPill>
              </div>
              <p
                id={`${switchId}-description`}
                className="mt-1 text-slate-muted text-xs leading-relaxed"
              >
                {status.description}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
            {push.isSubscribed && (
              <Button
                variant="outline"
                size="sm"
                loading={push.isSendingTest}
                disabled={!isOnline || !push.isOnline || isBusy}
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
              disabled={isDisabled}
              onCheckedChange={(checked) => {
                void handleToggle(checked);
              }}
              aria-describedby={`${switchId}-description`}
              aria-label="Push notifications"
            />
          </div>
        </div>
      </div>
    </>
  );
}
